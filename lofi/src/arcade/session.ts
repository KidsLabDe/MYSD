// Sitzung „Bug-Jagd“: Zoom-Rahmen, Abdunkeln, Bildschirme, Spielschleife, Tasten, Rangliste, Auto-Schließen.
import { Game, type Dir } from './game';
import { drawGame, drawDemo } from './render';
import { screenHtml, demoHtml, type Screen } from './screens';
import * as LB from './leaderboard';

const FRAME_X = 336, FRAME_Y = 96;                  // Zielposition 1248×888 (Tafel Arcade_Ablauf)
const SCREEN = { x: 828 + 30, y: 360 + 30, w: 348 }; // Bildschirm des Computers auf der Bühne
const INNER = 36 + 12;                              // Padding + Innenrand bis zum Spielfeld
const S0 = SCREEN.w / 1152;
const IDLE_CLOSE_MS = 45_000;

export interface SessionHooks { toast: (t: string, ms?: number) => void }

export class ArcadeSession {
  open = false;
  screen: Screen = 'title';
  private dim: HTMLDivElement; private frame: HTMLDivElement; private screenEl: HTMLDivElement;
  private canvas: HTMLCanvasElement; private ctx: CanvasRenderingContext2D;
  private phaseEl: HTMLDivElement;
  /** öffentlich nur für Tests (Test-Hook) */
  game: Game | null = null;
  list: LB.Entry[] = [];
  private me = -1; private name: string[] = Array(8).fill(' '); private cursor = 0; private rank = 0;
  private paused = false; private lastInput = 0; private lastT = 0; private raf = 0; private domKey = '';
  private resetArmed = -Infinity;
  private resolveClose: (() => void) | null = null;
  demo: Screen | null = null; demoCanvas = false;
  phaseOver = false;
  /** Tasten erst nach dem Zoom annehmen */
  private ready = false;

  constructor(stage: HTMLElement, private hooks: SessionHooks) {
    this.dim = document.createElement('div');
    this.dim.style.cssText = 'position: absolute; left: 0px; top: 0px; width: 1920px; height: 1080px; background: rgba(14,10,8,0); z-index: 30; display: none; pointer-events: none';
    this.frame = document.createElement('div');
    this.frame.style.cssText = 'position: absolute; width: 1248px; height: 888px; transform-origin: 0px 0px; z-index: 31; display: none';
    // Rahmen wörtlich aus Arcade_Ablauf (Monitor: #D8CBB0, Unterkante #B9AA8C, Innenrand #2A2622)
    this.frame.innerHTML = `<div style="width: 1248px; height: 888px; box-sizing: border-box; background: #D8CBB0; border-bottom: 18px solid #B9AA8C; padding: 36px 36px 42px; box-shadow: 0 24px 0 rgba(26,15,13,0.45)">
<div style="width: 1176px; height: 792px; box-sizing: border-box; border: 12px solid #2A2622; overflow: hidden; position: relative"><div id="arc-screen" style="position: absolute; left: 0px; top: 0px; width: 1152px; height: 792px"></div></div>
</div>`;
    this.screenEl = this.frame.querySelector('#arc-screen') as HTMLDivElement;
    this.canvas = document.createElement('canvas');
    this.canvas.width = 192; this.canvas.height = 132;
    this.canvas.style.cssText = 'position: absolute; left: 0px; top: 0px; width: 1152px; height: 792px; image-rendering: pixelated';
    this.ctx = this.canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;
    // „PHASE VORBEI“ blinkt mittig im HUD (anstelle von HI)
    this.phaseEl = document.createElement('div');
    this.phaseEl.style.cssText = "position: absolute; left: 376px; top: 18px; width: 400px; height: 36px; background: #0E1A14; color: #F07A7A; font-family: 'Press Start 2P', monospace; font-size: 26px; line-height: 36px; text-align: center; z-index: 2; display: none";
    this.phaseEl.textContent = 'PHASE VORBEI';
    stage.appendChild(this.dim); stage.appendChild(this.frame);
  }

  private setZoom(k: number) { // k = 0 … 6
    const t = k / 6, s = S0 + (1 - S0) * t;
    const x0 = SCREEN.x - INNER * S0, y0 = SCREEN.y - INNER * S0;
    const x = Math.round(x0 + (FRAME_X - x0) * t), y = Math.round(y0 + (FRAME_Y - y0) * t);
    this.frame.style.left = x + 'px'; this.frame.style.top = y + 'px';
    this.frame.style.transform = k === 6 ? 'none' : `scale(${s})`;
    this.frame.style.display = k === 0 ? 'none' : 'block';
    this.dim.style.display = k === 0 ? 'none' : 'block';
    this.dim.style.background = `rgba(14,10,8,${(0.6 * t).toFixed(2)})`;
  }
  private wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  /** Öffnen (instant: ohne Zoom-Animation, für ?arcade) → Promise, das beim Schließen erfüllt wird */
  async run(instant = false): Promise<void> {
    this.list = LB.load();
    this.open = true; this.screen = this.demo ?? 'title'; this.me = -1; this.paused = false; this.lastInput = performance.now();
    this.render(true);
    if (instant) this.setZoom(6); else for (let k = 1; k <= 6; k++) { this.setZoom(k); await this.wait(80); }
    this.lastT = performance.now(); this.ready = true;
    this.loop();
    await new Promise<void>((r) => (this.resolveClose = r));
    cancelAnimationFrame(this.raf); this.ready = false;
    for (let k = 5; k >= 0; k--) { this.setZoom(k); await this.wait(80); }
    this.open = false; this.game = null; this.phaseOver = false;
  }
  close() { if (this.resolveClose) { const r = this.resolveClose; this.resolveClose = null; r(); } }

  private loop = () => {
    const now = performance.now();
    const dt = Math.min(0.1, (now - this.lastT) / 1000); this.lastT = now;
    if (this.screen === 'play' && this.game && !this.paused && !this.demo) {
      // feste Schritte (120 Hz) für gleichmäßige 1-px-Bewegung
      let rest = dt; while (rest > 0) { const h = Math.min(rest, 1 / 120); this.game.step(h); rest -= h; }
      if (this.game.phase === 'over') this.gameOver();
    }
    if ((this.screen === 'title' || this.screen === 'board') && now - this.lastInput > IDLE_CLOSE_MS && !this.demo) this.close();
    this.render(false);
    if (this.open) this.raf = requestAnimationFrame(this.loop);
  };

  private start() { this.game = new Game(); this.screen = 'play'; this.paused = false; this.me = -1; }
  private gameOver() {
    const score = this.game!.score;
    if (LB.qualifies(this.list, score)) {
      this.name = Array(8).fill(' '); this.cursor = 0;
      this.rank = LB.insert(this.list, 'X', score, '9999').index + 1;
      this.screen = 'name';
    } else { this.me = -1; this.screen = 'board'; }
    this.lastInput = performance.now();
  }
  private saveName() {
    const { list, index } = LB.insert(this.list, this.name.join(''), this.game?.score ?? 0);
    this.list = list; this.me = index; LB.save(list); this.screen = 'board';
  }

  /** Alle Tasten gehören dem Spiel, solange es offen ist */
  key(e: KeyboardEvent) {
    if (!this.ready) return;
    this.lastInput = performance.now();
    const k = e.key;
    if (this.demo) { if (k === 'Escape') this.close(); return; }
    if (this.screen === 'title') { if (k === 'Enter') this.start(); else if (k === 'Escape') this.close(); return; }
    if (this.screen === 'play') {
      const dirs: Record<string, Dir> = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
      if (dirs[k] && this.game) this.game.input(dirs[k]);
      else if (k === 'p' || k === 'P') this.paused = !this.paused;
      else if (k === 'Escape') this.close();
      return;
    }
    if (this.screen === 'name') {
      const C = LB.NAME_CHARS;
      if (k === 'ArrowUp' || k === 'ArrowDown') { const i = C.indexOf(this.name[this.cursor]); this.name[this.cursor] = C[(i + (k === 'ArrowUp' ? 1 : C.length - 1)) % C.length]; }
      else if (k === 'ArrowLeft') this.cursor = Math.max(0, this.cursor - 1);
      else if (k === 'ArrowRight') this.cursor = Math.min(7, this.cursor + 1);
      else if (k === 'Backspace') { this.name[this.cursor] = ' '; this.cursor = Math.max(0, this.cursor - 1); }
      else if (k === 'Enter') this.saveName();
      else if (k === 'Escape') { this.me = -1; this.screen = 'board'; }
      else if (k.length === 1 && C.includes(k.toUpperCase())) { this.name[this.cursor] = k.toUpperCase(); this.cursor = Math.min(7, this.cursor + 1); }
      return;
    }
    if (this.screen === 'board') {
      if (k === 'R' && e.shiftKey) {
        if (performance.now() - this.resetArmed < 3000) { this.list = []; LB.save([]); this.me = -1; this.resetArmed = -Infinity; this.hooks.toast('Rangliste gelöscht'); }
        else { this.resetArmed = performance.now(); this.hooks.toast('Rangliste löschen? Nochmal Shift+R', 3000); }
      } else if (k === 'Enter') this.start();
      else if (k === 'Escape') this.close();
    }
  }

  private render(force: boolean) {
    const g = this.game;
    const hi = Math.max(this.list[0]?.score ?? 0, g?.score ?? 0);
    const dom = this.demo
      ? { demo: this.demo, canvas: this.demoCanvas }
      : { s: this.screen, score: g?.score ?? 0, hi, lives: g?.lives ?? 3, me: this.me, name: this.name.join(''), cursor: this.cursor, rank: this.rank, n: this.list.length, top: this.list[0]?.score };
    const k = JSON.stringify(dom);
    if (force || k !== this.domKey) {
      this.domKey = k;
      this.screenEl.innerHTML = this.demo && !(this.demo === 'play' && this.demoCanvas)
        ? demoHtml(this.demo)
        : screenHtml({ screen: this.demo ?? this.screen, score: g?.score ?? (this.demo ? 7560 : 0), hi: this.demo ? 12480 : hi, lives: this.demo ? 3 : g?.lives ?? 3, list: this.list, me: this.me, name: this.name, cursor: this.cursor, rank: this.rank });
      const play = this.screenEl.firstElementChild?.firstElementChild as HTMLElement | null;
      if ((this.screen === 'play' && !this.demo) || (this.demo === 'play' && this.demoCanvas)) play?.insertBefore(this.canvas, play.firstChild);
      play?.appendChild(this.phaseEl);
    }
    if (this.demo === 'play' && this.demoCanvas) drawDemo(this.ctx);
    else if (this.screen === 'play' && g) drawGame(this.ctx, g, performance.now());
    this.phaseEl.style.display = this.phaseOver && this.screen === 'play' && Math.floor(performance.now() / 500) % 2 === 0 ? 'block' : 'none';
  }
}
