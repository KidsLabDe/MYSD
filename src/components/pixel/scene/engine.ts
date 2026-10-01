// Lo-Fi-Szene als Board-UI (aus dem Lo-Fi-Board, dort main.ts). Den Plan-Zustand (Phase, Countdown,
// Jalousie) liefert das BoardModel; die Szene animiert nur dorthin: Abhaken, Jalousie, Leerlauf, Easter Egg.
// Phasenwechsel per Pfeiltaste (→/←) laufen über usePresenterKeys, nicht hier. Der Presenter-Klick
// (PageDown/PageUp) reißt hier ein Blatt vom Abreißkalender und erreicht den Plan nicht.
import './fonts.css';
import { Scene, fitStage, type SceneState } from './scene';
import { WeatherService } from './weather';
import { Animator } from './anim';
import { Toast, HelpOverlay, toggleFullscreen, autoHideCursor } from './ui';
import { CAL_ROWS, calOffset, hhmm, hms } from './format';
import type { ComputerProps } from './components/computer';
import type { CalendarProps } from './components/calendar';
import { Printer, printerTimings } from './printer';
import { pickIdle, nextWave, nextCoffee, type IdleKind } from './idle';
import { ArcadeSession } from './arcade/session';
import { GameSequence, dashboardAction } from './arcade/keys';
import { strikeVariants } from './strikes';
import { TEAR_START, isTearKey, stepTear, tearPage, type TearState } from './tear';
import { K_BLINK_MS, K_SPOT, kollegeAt, nextBlink, type KollegeState } from './kollege';
import { buildKollegeDebug, type KollegeDebug } from './debugPanel';
import { KOLLEGE_FACES, KOLLEGE_POSES, KOLLEGE_VIEWS } from './components/kollege';
import type { PixelPhase } from '../../../lib/pixelPhase';

export interface SceneItem {
  readonly start: string;
  readonly end: string;
  readonly title: string;
}

/** Was die Szene vom Board bekommt, einmal pro Sekunde. */
export interface SceneInput {
  /** Board-Uhr in ms (inkl. ?date=&time=) */
  readonly now: number;
  readonly phase: PixelPhase;
  /** Einträge des Tages, nach Start sortiert */
  readonly items: readonly SceneItem[];
  /** Kalender-Titel (boardTitle) */
  readonly title: string;
  readonly subline: string;
  /** ISO-Datum des gezeigten Tages */
  readonly date: string | null;
}

export interface SceneOptions {
  readonly latitude: number;
  readonly longitude: number;
  readonly poster: string;
  /** Testparameter: ?weather=, ?print=, ?wave=, ?coffee=, ?arcade[=screen]&demo, ?debug, ?kollege=pose&kview=&kface=&kleft= */
  readonly params: URLSearchParams;
}

const LS_IDLE = 'hackday:idle';

// ---------- Text an Bildschirmbreite anpassen (VT323) ----------
const SCREEN_W = 348 - 40;
let measureCtx: CanvasRenderingContext2D | null | undefined;
function measure(font: string, text: string): number | null {
  // jsdom hat kein Canvas; getContext gibt dort null zurück
  if (measureCtx === undefined) {
    try { measureCtx = document.createElement('canvas').getContext('2d'); } catch { measureCtx = null; }
  }
  if (!measureCtx) return null;
  measureCtx.font = font;
  return measureCtx.measureText(text).width;
}
function fits(text: string, px: number) { const w = measure(`${px}px VT323`, text); return w === null || w + text.length <= SCREEN_W; }
const firstFit = (px: number, c: readonly [string, ...string[]]) => c.find((t) => fits(t, px)) ?? c[c.length - 1]!;
/** Kalender: Platz für den Namen, wenn "JETZT" daneben steht (396 − Padding 36 − Zeit 56 − 2 Lücken 24 − Badge) */
function calNameSize(name: string): number | undefined {
  const badge = measure("16px 'Pixelify Sans'", 'JETZT');
  if (badge === null) return undefined;
  const room = 396 - 36 - 56 - 24 - (badge + 16);
  for (let px = 23; px > 14; px--) { if ((measure(`${px}px 'Pixelify Sans'`, name) ?? 0) <= room) return px === 23 ? undefined : px; }
  return 14;
}
/** Kalender-Titel (Press Start 2P) auf 396 − 2·12 px einpassen */
function calTitleSize(title: string): number | undefined {
  for (let px = 24; px > 10; px--) { if ((measure(`${px}px 'Press Start 2P'`, title) ?? 0) <= 372) return px === 24 ? undefined : px; }
  return 10;
}
const pad2 = (n: number) => String(n).padStart(2, '0');
const WD = ['SO', 'MO', 'DI', 'MI', 'DO', 'FR', 'SA'];
const DAY_MS = 24 * 3600_000;
const upper = (s: string) => s.toUpperCase();

function nextLine(name: string, time: string) {
  return firstFit(18, [`NÄCHSTE > ${name} · ${time}`, `> ${name} · ${time}`, `${name} · ${time}`]);
}

/** Monitor-Inhalt aus dem Plan-Zustand. */
export function computerView(input: SceneInput): ComputerProps {
  const { phase: L, items, now } = input;
  const total = pad2(L.n), clock = hhmm(now);
  const item = items[Math.min(L.idx, L.n - 1)];
  if (L.ende || !item) {
    return { state: 'ende', num: total, total, clock, phase: item ? upper(item.title) : '', countdown: 'GESCHAFFT!', next: 'DANKE FÜRS MITHACKEN!', fill: 16 };
  }
  const name = upper(item.title);
  if (L.gap) return { state: 'pause', num: pad2(L.idx), total, clock, phase: 'PAUSE', countdown: hms(L.remainingMs), next: nextLine(name, item.start), fill: 0 };
  if (L.waiting && L.remainingMs >= DAY_MS && input.date) { // Plan-Tag liegt noch Tage entfernt: Datum statt Riesen-Countdown
    const [y = 0, m = 1, d = 1] = input.date.split('-').map(Number);
    const day = `${WD[new Date(y, m - 1, d).getDay()]} ${pad2(d)}.${pad2(m)}.`;
    return { state: 'pause', num: '00', total, clock, phase: firstFit(26, [name]), countdown: day, next: `START · ${day} ${item.start}`, fill: 0 };
  }
  if (L.waiting) return { state: 'pause', num: '00', total, clock, phase: firstFit(26, [name]), countdown: hms(L.remainingMs), next: `START · ${item.start}`, fill: 0 };
  const phase = L.state === 'endspurt' ? firstFit(26, [`${name} · ENDSPURT`, name]) : name;
  const following = items[L.idx + 1];
  const next = following ? nextLine(upper(following.title), following.start) : `NÄCHSTE > ENDE · ${item.end}`;
  return { state: L.state, num: pad2(L.idx + 1), total, clock, phase, countdown: hms(L.remainingMs), next, fill: L.fill };
}

/** Strich-Variante je Eintrag: stabil über Start und Titel */
const strikesFor = (items: readonly SceneItem[]) => strikeVariants(items.map((x) => `${x.start} ${x.title}`));

const dayKey = (i: SceneInput) => `${i.date}|${i.items.map((x) => `${x.start}-${x.end} ${x.title}`).join('|')}`;

export class PixelScene {
  private readonly viewport: HTMLDivElement;
  private readonly stage: HTMLDivElement;
  private readonly scene: Scene;
  private readonly toast: Toast;
  private readonly help: HelpOverlay;
  private readonly weather: WeatherService;
  private readonly printer: Printer;
  private readonly anim: Animator;
  /** Easter Egg, erst beim ersten G·A·M·E angelegt (braucht ein Canvas) */
  private arcadeSession: ArcadeSession | null = null;
  private readonly gameSeq = new GameSequence();
  private readonly cleanups: (() => void)[] = [];
  private readonly nameSizes = new Map<string, number | undefined>();
  private input: SceneInput | null = null;
  private strikes: number[] = [];
  private key = '';
  private raf = 0;
  /** Abreißkalender: Druck und Frame laufen beide auf dem Hauptthread, nie gleichzeitig */
  private tear: TearState = TEAR_START;
  private disposed = false;

  // Jalousie per J: gilt, bis die Phase wechselt
  private blindsOverride: { idx: number; value: number } | null = null;
  // Easter Egg
  private arcadeRequested = false; private arcadeInstant = false; private arcadeToastShown = false;
  // Leerlauf
  private readonly waveTest: number | null; private readonly coffeeTest: number | null;
  private waveAt: number; private coffeeAt: number;
  private lastIdle: IdleKind | null = null;
  private idleOn = true;
  private readonly manual: IdleKind[] = [];
  // Wetter-Effekte
  private rainOff = 0; private snowOff = 0; private lastRain = 0; private lastSnow = 0;
  private nextBolt = performance.now() + 6000; private boltT = -1e9;
  private lastPc: ComputerProps | null = null; private frozenPc: ComputerProps | null = null;
  // Kollege Fabi (Vortrag, Taste V): unabhängig von der Warteschlange der Person
  private talk: { start: number; leaveAt: number | null } | null = null;
  private blinkAt = 0; private blinkUntil = -1;
  /** ?debug / ?kollege=…: Kollege fest anzeigen (übersteuert den Vortrag) */
  private readonly kDebug: KollegeDebug;

  constructor(host: HTMLElement, private readonly opts: SceneOptions) {
    const q = opts.params;
    this.viewport = document.createElement('div');
    this.stage = document.createElement('div');
    this.viewport.appendChild(this.stage);
    host.appendChild(this.viewport);
    this.scene = new Scene(this.stage);
    this.toast = new Toast(this.stage);
    this.help = new HelpOverlay(this.stage);

    const fit = () => fitStage(this.viewport, this.stage);
    fit();
    window.addEventListener('resize', fit);
    this.cleanups.push(() => window.removeEventListener('resize', fit), autoHideCursor(host));

    this.weather = new WeatherService(opts.latitude, opts.longitude, q.get('weather'));
    this.weather.start();
    this.cleanups.push(() => this.weather.stop());

    this.printer = new Printer(printerTimings(Number(q.get('print')) || null));
    this.anim = new Animator(this.printer);
    this.cleanups.push(() => this.arcadeSession?.dispose());
    if (q.has('arcade')) {
      this.arcadeRequested = true; this.arcadeInstant = true;
      const scr = q.get('arcade');
      if (q.has('demo') && (scr === 'title' || scr === 'play' || scr === 'name' || scr === 'board')) { this.arcade.demo = scr; this.arcade.demoCanvas = q.get('demo') === 'canvas'; }
    }

    this.waveTest = Number(q.get('wave')) || null;
    this.coffeeTest = Number(q.get('coffee')) || null;
    this.waveAt = performance.now() + nextWave(this.waveTest);
    this.coffeeAt = performance.now() + nextCoffee(this.coffeeTest);
    try { this.idleOn = localStorage.getItem(LS_IDLE) !== '0'; } catch { /* Standard: an */ }
    const pick = <T extends string>(list: readonly T[], v: string | null, d: T): T => (list as readonly string[]).includes(v ?? '') ? (v as T) : d;
    this.kDebug = {
      on: q.has('kollege'), pose: pick(KOLLEGE_POSES, q.get('kollege'), 'stand'), view: pick(KOLLEGE_VIEWS, q.get('kview'), 'front'),
      face: pick(KOLLEGE_FACES, q.get('kface'), 'auto'), left: Number(q.get('kleft')) || K_SPOT,
    };
    if (q.has('debug')) this.cleanups.push(buildKollegeDebug(this.kDebug));

    // Capture-Phase: läuft vor usePresenterKeys, damit die Pfeile im Spiel nicht die Phase wechseln
    // und PageDown/PageUp nur den Abreißkalender bedienen
    window.addEventListener('keydown', this.onKey, true);
    this.cleanups.push(() => window.removeEventListener('keydown', this.onKey, true));

    // Schriften vor dem Messen laden; danach Namensgrößen neu berechnen
    const fonts = typeof document !== 'undefined' ? document.fonts : undefined;
    if (fonts) {
      void Promise.all(["23px 'Pixelify Sans'", '26px VT323', "24px 'Press Start 2P'"].map((f) => fonts.load(f).catch(() => null)))
        .then(() => this.nameSizes.clear());
    }
    this.raf = requestAnimationFrame(this.loop);
  }

  /** Neuer Board-Zustand (jede Sekunde). Beim ersten Mal und bei einem neuen Tag: Endzustand ohne Animation. */
  update(input: SceneInput) {
    const first = this.input === null;
    if (input.items !== this.input?.items) this.strikes = strikesFor(input.items);
    this.input = input;
    const k = dayKey(input);
    if (first || (k !== this.key && !this.anim.busy)) {
      this.key = k;
      this.snap(this.resolved());
      this.render(performance.now());
    }
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    for (const c of this.cleanups) c();
    this.viewport.remove();
  }

  private get arcade(): ArcadeSession {
    this.arcadeSession ??= new ArcadeSession(this.stage, { toast: (t, ms) => this.toast.show(t, ms) });
    return this.arcadeSession;
  }

  /** Plan-Zustand inkl. Jalousie-Override (J) */
  private resolved(): PixelPhase {
    const L = this.input!.phase;
    const o = this.blindsOverride;
    if (o && o.idx !== L.idx) this.blindsOverride = null;
    return this.blindsOverride ? { ...L, blinds: this.blindsOverride.value } : L;
  }

  private snap(L: PixelPhase) {
    const a = this.anim.a;
    a.idx = L.idx; a.struck = L.idx; a.blinds = L.blinds;
    this.anim.hide(); a.handleY = null; a.cupOnDesk = true;
  }

  private runIdle(k: IdleKind) {
    const anim = this.anim;
    const seqs: Record<IdleKind, [() => Promise<void>, () => void]> = {
      wave: [() => anim.wave(), () => {}],
      coffee: [() => anim.coffee(), () => anim.coffeeEnd()],
      printFetch: [() => anim.printFetch(), () => anim.printFetchEnd()],
      printStart: [() => anim.printStart(), () => anim.printStartEnd()],
    };
    const [seq, end] = seqs[k];
    this.lastIdle = k;
    const t = performance.now();
    if (k === 'wave') this.waveAt = t + nextWave(this.waveTest);
    if (k === 'coffee') this.coffeeAt = t + nextCoffee(this.coffeeTest);
    anim.run(k, seq, end);
  }

  private fx(t: number): boolean {
    if (t - this.lastRain >= 40) { this.rainOff++; this.lastRain = t; }
    if (t - this.lastSnow >= 200) { this.snowOff++; this.lastSnow = t; }
    if (t >= this.nextBolt) { this.boltT = t; this.nextBolt = t + 6000 + Math.random() * 6000; }
    const e = t - this.boltT;
    return (e >= 0 && e < 90) || (e >= 180 && e < 270);
  }

  private loop = (t: number) => {
    if (this.disposed) return;
    this.tear = stepTear(this.tear, t);
    this.scene.renderTear(this.tear);
    if (this.input) {
      this.control(t);
      this.render(t);
    }
    this.raf = requestAnimationFrame(this.loop);
  };

  /** Controller: logischer Zustand → angezeigter Zustand (Warteschlange, nie parallel). */
  private control(t: number) {
    const { anim, printer, arcadeSession } = this;
    const a = anim.a;
    const L = this.resolved();
    printer.tick(t);
    const pending = L.idx !== a.idx || L.blinds !== a.blinds;   // Abhaken/Jalousie steht an
    if (anim.idleRunning && (pending || this.arcadeRequested)) anim.cancelIdle(); // Vorrang: Leerlauf sofort beenden
    if (arcadeSession) arcadeSession.phaseOver = arcadeSession.open && L.idx !== a.idx; // „PHASE VORBEI“ im HUD
    if (anim.busy) return;
    if (this.arcadeRequested && (!pending || this.arcadeInstant)) {
      this.arcadeRequested = false;
      const instant = this.arcadeInstant; this.arcadeInstant = false;
      if (!instant && !this.arcadeToastShown) this.toast.show('G · A · M · E · Bug-Jagd startet', 1500);
      this.arcadeToastShown = false;
      anim.run('arcade', async () => {
        await anim.arcade(this.arcade, instant);
        const t2 = performance.now(); // Leerlauf pausierte
        this.waveAt = t2 + nextWave(this.waveTest); this.coffeeAt = t2 + nextCoffee(this.coffeeTest);
      });
    } else if (L.idx === a.idx) {
      if (L.blinds !== a.blinds) anim.run('blinds', () => anim.blindsTo(L.blinds));
      else if (this.manual.length) this.runIdle(this.manual.shift()!);
      else {
        const due: IdleKind[] = [];
        if (printer.state === 'done' && t >= printer.fetchAt) due.push('printFetch');
        if (printer.state === 'empty' && t >= printer.startAt) due.push('printStart');
        if (t >= this.waveAt) due.push('wave');
        if (t >= this.coffeeAt) due.push('coffee');
        // Während des Vortrags pausiert der automatische Leerlauf (D/K/H von Hand gehen weiter)
        const k = this.talk ? null : pickIdle({ enabled: this.idleOn, queueEmpty: true, phaseChangePending: false, remainingMs: L.ende ? Infinity : L.remainingMs, due, last: this.lastIdle });
        if (k) this.runIdle(k);
      }
    } else if (L.idx === a.idx + 1 && this.sameDayAsShown()) {
      const prev = a.idx;
      anim.run('phase', () => anim.phaseDone(prev, () => { const now = this.resolved(); return now.idx === prev + 1 ? now.blinds : a.blinds; }, calOffset(prev, L.n), this.strikes[prev] ?? 0));
    } else this.snap(L); // Sprung (←, neuer Tag, Laptop geschlafen, Stau): Endzustand direkt
  }

  /** Ein neuer Tag (anderer Plan) wird nie abgehakt, sondern gesetzt. Merkt sich dabei den neuen Tag. */
  private sameDayAsShown() {
    const k = dayKey(this.input!);
    if (k === this.key) return true;
    this.key = k;
    return false;
  }

  private nameSize(name: string) {
    if (!this.nameSizes.has(name)) this.nameSizes.set(name, calNameSize(name));
    return this.nameSizes.get(name);
  }

  private render(t: number) {
    const input = this.input!;
    const a = this.anim.a;
    const L = this.resolved();
    const bolt = this.fx(t);
    this.anim.tick(t);

    let pc = computerView({ ...input, phase: L });
    if (a.pcArcade) pc = { state: 'arcade', num: '--', total: pad2(L.n), clock: 'G·A·M·E', phase: 'BUG-JAGD', countdown: 'READY?', next: 'ENTER = START', fill: 16 };
    if (a.freezePc) { this.frozenPc ??= { ...(this.lastPc ?? pc), countdown: '00:00:00', fill: 16 }; pc = this.frozenPc; } else this.frozenPc = null;
    this.lastPc = pc;

    // Mehr als 8 Einträge: Fenster wandert mit dem Abhaken (Zeilenindizes im Fenster)
    const off = calOffset(a.struck, L.n);
    const nowAbs = a.idx >= L.n || (L.waiting && a.idx === L.idx) ? -1 : a.idx;
    const calTitle = upper(input.title || 'Hackday');
    const cal: CalendarProps = {
      title: calTitle, titleSize: calTitleSize(calTitle), subline: input.subline,
      rows: input.items.slice(off, off + CAL_ROWS).map((p, i) => ({ time: p.start, name: p.title, size: this.nameSize(p.title), strike: this.strikes[off + i] ?? 0 })),
      struck: a.struck - off, nowRow: nowAbs < 0 ? -1 : nowAbs - off, draw: a.draw,
    };
    const s: SceneState = {
      weather: this.weather.current, blinds: a.blinds, poster: this.opts.poster, handleY: a.handleY,
      rainOff: this.rainOff, snowOff: this.snowOff, bolt,
      calendar: cal, computer: { ...pc, dark: a.dark }, person: { ...a.person },
      cupOnDesk: a.cupOnDesk, printer: this.printer.view(t),
      kollege: this.kollegeFrame(t),
    };
    this.scene.render(s);
  }

  /** Kollege für dieses Bild: Debug fest, sonst Vortrag (mit Blinzeln); beendet den Vortrag, wenn er draußen ist. */
  private kollegeFrame(t: number): (KollegeState & { x: number }) | null {
    const d = this.kDebug;
    if (d.on) return { x: d.left, view: d.view, pose: d.pose, face: d.face };
    if (!this.talk) return null;
    if (t >= this.blinkAt) { this.blinkUntil = t + K_BLINK_MS; this.blinkAt = t + nextBlink(Math.random()); }
    const k = kollegeAt(t - this.talk.start, this.talk.leaveAt, t < this.blinkUntil);
    if (!k) this.talk = null;
    return k;
  }

  /** Taste V: Auftritt, während des Vortrags Abbruch (er geht sofort). Unabhängig von der Person. */
  private toggleTalk() {
    const t = performance.now();
    if (!this.talk) {
      this.talk = { start: t, leaveAt: null };
      this.blinkAt = t + nextBlink(Math.random()); this.blinkUntil = -1;
      this.toast.show('Vortrag');
    } else if (this.talk.leaveAt === null) {
      this.talk = { ...this.talk, leaveAt: t - this.talk.start };
      this.toast.show('Vortrag beendet');
    }
  }

  // ---- Tastenkürzel ----
  private onKey = (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const { anim, arcadeSession, toast } = this;
    // Solange das Spiel offen ist, gehören alle Tasten dem Spiel – auch die Clicker-Tasten des Boards
    if (arcadeSession?.open) { arcadeSession.key(e); e.preventDefault(); e.stopImmediatePropagation(); return; }
    // Presenter-Klick: genau ein Blatt pro Druck (Halten zählt nicht), nie ein Phasenwechsel
    if (isTearKey(e.key)) {
      e.preventDefault(); e.stopImmediatePropagation();
      if (!e.repeat) this.tear = tearPage(this.tear, performance.now());
      return;
    }
    if (this.gameSeq.push(e.key, performance.now())) {
      this.arcadeRequested = true;
      this.arcadeToastShown = !(anim.busy && !anim.idleRunning);
      toast.show(this.arcadeToastShown ? 'G · A · M · E · Bug-Jagd startet' : 'Bug-Jagd kommt gleich', 1500);
      e.preventDefault(); return;
    }
    const act = dashboardAction(e.key);
    if (!act || !this.input) return;
    const L = this.resolved();
    switch (act) {
      case 'blinds': {
        const value = L.blinds > 0 ? 0 : 100;
        this.blindsOverride = { idx: L.idx, value };
        toast.show(value ? 'Jalousie zu' : 'Jalousie auf');
        break;
      }
      case 'weather': toast.show('Wetter: ' + this.weather.cycle()); break;
      case 'full': toggleFullscreen(); break;
      case 'help': this.help.toggle(); break;
      case 'escape': if (!this.help.open) return; this.help.toggle(false); break;
      case 'printer':
        if (this.printer.state === 'printing') { this.printer.finishNow(performance.now()); toast.show('Drucker: sofort fertig'); }
        else {
          this.manual.push(this.printer.state === 'done' ? 'printFetch' : 'printStart');
          toast.show(anim.busy ? 'Drucker: kommt gleich' : this.printer.state === 'done' ? 'Drucker: Teil abholen' : 'Drucker: neuen Druck starten');
        }
        break;
      case 'coffee': this.manual.push('coffee'); toast.show(anim.busy ? 'Kaffeepause: kommt gleich' : 'Kaffeepause'); break;
      case 'wave': this.manual.push('wave'); toast.show(anim.busy ? 'Hallo: kommt gleich' : 'Hallo!'); break;
      case 'talk': this.toggleTalk(); break;
      case 'idle':
        this.idleOn = !this.idleOn;
        try { localStorage.setItem(LS_IDLE, this.idleOn ? '1' : '0'); } catch { /* egal */ }
        toast.show(this.idleOn ? 'Leerlauf-Animationen an' : 'Leerlauf-Animationen aus (Drucker druckt weiter)');
        break;
    }
    e.preventDefault();
  };
}
