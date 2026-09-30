// Animations-Queue: Sequenzen laufen nie parallel. Zeiten in Echtzeit (auch im Testmodus).
// Abhaken: design/CHANGES.md + Tafel Kalender_Abhaken · Jalousie: Tafel Jalousie-Animation ·
// Laufen/Drehen/Winken: Tafel Person_Ansichten · Drucker: Tafel Drucker_Zyklus · Kaffee: Tafel Kaffee_Pause.
import { handDy, TIP, type Arm, type View, type Face, type ArmLeft, type Holding } from './components/person';
import { restHandleY } from './components/window';
import { LED, type Printer } from './printer';
import { strikeY } from './strikes';
import type { IdleKind } from './idle';
import type { ArcadeSession } from './arcade/session';
import type { Pose } from './types';

export const OFFSTAGE = 1968;      // rechts außerhalb
export const AT_CORD = 462;        // vor dem Tisch an der Schnur
export const AT_ARCADE = 960;
export const AT_WAVE = 1500, AT_COFFEE = 660, AT_FETCH = 456, AT_BUTTON = 348;
const WALK_PX_S = 576 / 1.4;       // Tafel "Abläufe": 1968 → 1392 in 1,4 s
const STEP = 6;                    // 1 Szenenpixel
const TURN_MS = 120;               // Zwischenbild „Seite stand“
const TOP_FLOOR = 378, TOP_STEP = 324, TOP_BENCH = 270;

/** Je Kalenderzeile: Standfläche + Schreib-Arm (design/CHANGES.md, „Positionen je Zeile“). */
export const ROWS: { bench: boolean; arm: Arm }[] = [
  { bench: true, arm: 'up' }, { bench: true, arm: 'steil' }, { bench: false, arm: 'up' }, { bench: false, arm: 'diag' },
  { bench: false, arm: 'flach' }, { bench: false, arm: 'waagrecht' }, { bench: false, arm: 'leichtRunter' }, { bench: false, arm: 'runter' },
];
/** Figur-Position für Zeile i bei n gezogenen Pixeln (Szene-x des Linienendes = 250 + n), Strich-Variante v (strikes.ts). */
export function strokePose(i: number, n: number, v = 0) {
  const r = ROWS[Math.max(0, Math.min(i, ROWS.length - 1))]!, tip = TIP[r.arm];
  const xEnd = 250 + n;
  const lineTop = 32 + 10 * i + strikeY(v, xEnd - 249);
  const top = r.bench ? 45 : 63;
  return { left: (xEnd - tip.x) * 6, top: top * 6, arm: r.arm, armDy: lineTop - (top + tip.top) };
}

export interface PersonState {
  visible: boolean; x: number; pose: Pose; marker: boolean; layer: 'auto' | 'ganzVorne'; top: number;
  arm: Arm | null; armDy: number; view: View; face: Face; armLeft: ArmLeft; holding: Holding; steamDy: number;
}
export interface AnimState {
  person: PersonState;
  draw: { row: number; len: number } | null;
  dark: boolean;                   // Countdown + LED aus (Blinken)
  freezePc: boolean;               // Computer zeigt kurz noch die alte Phase
  blinds: number;                  // angezeigte Jalousie
  holding: boolean;                // Hand an der Schnur
  handleY: number | null;          // angezeigter Griff (null = Formel)
  struck: number; idx: number;     // angezeigter Kalenderstand
  cupOnDesk: boolean;              // Tasse auf dem Tisch
  pcArcade: boolean;               // Computer zeigt Zustand arcade
}

class Cancelled extends Error {}
const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

const freshPerson = (): PersonState => ({
  visible: false, x: OFFSTAGE, pose: 'stand', marker: true, layer: 'auto', top: TOP_FLOOR,
  arm: null, armDy: 0, view: 'back', face: 'auto', armLeft: 'down', holding: 'none', steamDy: 0,
});

export class Animator {
  busy = false;
  /** Art der laufenden Sequenz (für Protokoll/Tests) */
  current: 'phase' | 'blinds' | 'arcade' | IdleKind | null = null;
  idleRunning = false;
  private cancelReq = false;
  a: AnimState = {
    person: freshPerson(), draw: null, dark: false, freezePc: false, blinds: 0, holding: false, handleY: null, struck: 0, idx: 0, cupOnDesk: true, pcArcade: false,
  };
  private lastHandle = 0;
  constructor(public printer: Printer) {}

  /** Sequenz starten. Leerlauf-Sequenzen sind abbrechbar; end() stellt dann ohne Animation den Endzustand her. */
  run(kind: 'phase' | 'blinds' | 'arcade' | IdleKind, seq: () => Promise<void>, end?: () => void) {
    if (this.busy) return;
    const idle = kind !== 'phase' && kind !== 'blinds' && kind !== 'arcade';
    this.busy = true; this.current = kind; this.idleRunning = idle; this.cancelReq = false;
    seq()
      .catch((e) => { if (e instanceof Cancelled) { end?.(); this.hide(); } else console.error(e); })
      .finally(() => { this.busy = false; this.current = null; this.idleRunning = false; this.cancelReq = false; });
  }
  /** Abhaken/Jalousie hat Vorrang: laufende Leerlauf-Animation sofort beenden */
  cancelIdle() { if (this.idleRunning) this.cancelReq = true; }

  private chk() { if (this.idleRunning && this.cancelReq) throw new Cancelled(); }
  /** Warten in Scheiben, damit ein Abbruch sofort greift */
  async wait(ms: number) {
    const end = performance.now() + ms;
    for (;;) {
      this.chk();
      const left = end - performance.now();
      if (left <= 0) break;
      await new Promise((r) => setTimeout(r, Math.min(40, left)));
    }
    this.chk();
  }

  /** Pro Frame: Schnurgriff folgt der Hand, Dampf über der Tasse wippt (400-ms-Takt). */
  tick(t: number) {
    const a = this.a, p = a.person;
    p.steamDy = p.view === 'front' && p.pose === 'cupLow' && Math.floor(t / 400) % 2 ? -1 : 0;
    const rest = restHandleY(a.blinds);
    const target = a.holding ? 64 + handDy(p.pose) : rest;
    if (a.handleY === null) { if (!a.holding) return; a.handleY = rest; }
    const every = a.holding ? 12 : 30;
    if (t - this.lastHandle < every) return;
    this.lastHandle = t;
    if (a.handleY < target) a.handleY++;
    else if (a.handleY > target) a.handleY--;
    else if (!a.holding) a.handleY = null;
  }

  /** Laufen immer in Seitenansicht: nach links view left, nach rechts view right (Tafel Person_Ansichten). */
  async walk(to: number, marker: boolean) {
    const p = this.a.person;
    const wasVisible = p.visible;
    p.visible = true; p.marker = marker; p.arm = null; p.armDy = 0; p.armLeft = 'down'; p.face = 'auto';
    const from = p.x, dir = Math.sign(to - from);
    if (dir === 0) return;
    const side: View = dir < 0 ? 'left' : 'right';
    if (wasVisible && (p.view === 'back' || p.view === 'front')) { p.view = side; p.pose = 'stand'; await this.wait(TURN_MS); }
    p.view = side;
    const t0 = performance.now();
    for (;;) {
      this.chk();
      const el = performance.now() - t0;
      const x = from + dir * Math.floor((el * WALK_PX_S) / 1000 / STEP) * STEP;
      if ((dir > 0 && x >= to) || (dir < 0 && x <= to)) break;
      p.x = x;
      p.pose = Math.floor(el / 180) % 2 ? 'walkB' : 'walkA';
      await frame();
    }
    p.x = to; p.pose = 'stand';
  }

  /** Drehen über ein Zwischenbild „Seite stand“ (120 ms). */
  async turn(v: View) {
    const p = this.a.person;
    if (p.view === v) return;
    if (p.view === 'back' || p.view === 'front') p.view = 'right';
    p.pose = 'stand';
    await this.wait(TURN_MS);
    p.view = v;
  }

  /** Auf die Bank (hoch) oder herunter: stand → stepA → stepB → stand, je 150 ms (design/CHANGES.md). */
  async bench(up: boolean) {
    const p = this.a.person;
    p.arm = null; p.armDy = 0;
    const seq: [Pose, number][] = up
      ? [['stepA', TOP_FLOOR], ['stepB', TOP_STEP], ['stand', TOP_BENCH]]
      : [['stepB', TOP_STEP], ['stepA', TOP_FLOOR], ['stand', TOP_FLOOR]];
    for (const [pose, top] of seq) { p.pose = pose; p.top = top; await this.wait(150); }
  }

  private enter() { const p = this.a.person; p.x = OFFSTAGE; p.top = TOP_FLOOR; p.layer = 'ganzVorne'; p.view = 'left'; }
  hide() { this.a.person = freshPerson(); this.a.draw = null; this.a.holding = false; }
  async leave(marker: boolean) { await this.walk(OFFSTAGE, marker); this.hide(); }

  /** Teil A: Phase prevIdx wird abgehakt. targetBlinds() liefert die Jalousie der neuen Phase. */
  async phaseDone(prevIdx: number, targetBlinds: () => number, rowOffset = 0, strike = 0) {
    const a = this.a, p = a.person;
    a.freezePc = true;                                   // 01 Countdown + LED blinken 3×
    for (let i = 0; i < 3; i++) { a.dark = true; await this.wait(100); a.dark = false; await this.wait(100); }
    a.freezePc = false;
    const row = Math.max(0, Math.min(prevIdx - rowOffset, ROWS.length - 1)); // Zeile im Kalenderfenster
    const rowCfg = ROWS[row]!;
    const start = strokePose(row, 2, strike);
    this.enter();                                        // 02 rein (view left), am Ziel zum Kalender drehen
    await this.walk(start.left, true);
    await this.turn('back');
    if (rowCfg.bench) await this.bench(true);            // 03 Zeilen 0–1: auf die Bank, dann Arm der Zeile
    p.pose = 'stand'; p.arm = start.arm; p.armDy = start.armDy; p.top = start.top;
    a.draw = { row, len: 2 };
    await this.wait(150);
    const t0 = performance.now();                        // 04 Strich wächst 1 px / 32 ms, Figur trippelt mit
    for (let n = 3; n <= 62; n++) {
      while (performance.now() - t0 < (n - 2) * 32) await frame();
      const s = strokePose(row, n, strike);
      a.draw = { row, len: n };
      p.x = s.left; p.armDy = s.armDy;
      p.pose = Math.floor((n - 2) / 3) % 2 ? 'walkB' : 'walkA';
    }
    await frame();
    p.pose = 'stand';
    await this.wait(150);
    if (rowCfg.bench) await this.bench(false);           // absteigen, Zeile 45 %, Haken, JETZT weiter
    a.draw = null;
    a.struck = prevIdx + 1; a.idx = prevIdx + 1;
    p.arm = null; p.armDy = 0; p.top = TOP_FLOOR;
    await this.wait(300);
    const tb = targetBlinds();                           // 05 weiter zur Jalousie oder raus (view right)
    if (tb !== a.blinds) await this.blindsTo(tb);
    else await this.leave(true);
  }

  /** Teil B: VOR Tisch und Computer (ganzVorne) ohne Stift zur Schnur, grab → pullA → pullB je 150 ms, ±10 % pro Zug-Frame. */
  async blindsTo(target: number) {
    const a = this.a, p = a.person;
    if (!p.visible) this.enter();
    p.layer = 'ganzVorne';
    await this.walk(AT_CORD, false);
    await this.turn('back');
    const open = target < a.blinds;
    const frames: [Pose, Pose, Pose] = open ? ['grab', 'pullA', 'pullB'] : ['pullB', 'pullA', 'grab'];
    p.pose = frames[0]; a.holding = true;
    await this.wait(300);
    let guard = 0;
    while (a.blinds !== target && guard++ < 40) {
      for (const f of frames.slice(1)) {
        p.pose = f;
        a.blinds = open ? Math.max(target, a.blinds - 10) : Math.min(target, a.blinds + 10);
        await this.wait(150);
        if (a.blinds === target) break;
      }
      if (a.blinds === target) break;
      p.pose = frames[0];
      await this.wait(150);
    }
    p.pose = 'stand'; a.holding = false;
    await this.wait(300);
    await this.leave(false);
  }

  /** Easter Egg (Tafel Arcade_Ablauf): Toast 1,5 s → rein bis 960 → zu back drehen → Computer „arcade“ 600 ms → Zoom → Spiel → rückwärts → raus. */
  async arcade(session: ArcadeSession, instant: boolean) {
    const a = this.a, p = a.person;
    if (instant) { Object.assign(p, { visible: true, x: AT_ARCADE, top: TOP_FLOOR, layer: 'ganzVorne', view: 'back', pose: 'stand', marker: false }); a.pcArcade = true; }
    else {
      await this.wait(1500);
      this.enter();
      await this.walk(AT_ARCADE, false);
      await this.turn('back');
      a.pcArcade = true;
      await this.wait(600);
    }
    await session.run(instant);
    a.pcArcade = false;
    await this.leave(false);
  }

  // ---------- Leerlauf-Animationen (abbrechbar) ----------

  /** Winken (Tafel Person_Ansichten): rein bis 1500 → Publikum, smile 400 → 3× waveA/B je 250 → blink 150 → smile 600 → raus. */
  async wave() {
    const p = this.a.person;
    this.enter();
    await this.walk(AT_WAVE, false);
    await this.turn('front');
    p.face = 'smile'; await this.wait(400);
    for (let i = 0; i < 3; i++) { p.face = 'auto'; p.pose = 'waveA'; await this.wait(250); p.pose = 'waveB'; await this.wait(250); }
    p.pose = 'stand'; p.face = 'blink'; await this.wait(150);
    p.face = 'smile'; await this.wait(600);
    p.face = 'auto';
    await this.leave(false);
  }

  /** Kaffeepause (Tafel Kaffee_Pause), ca. 9 s. */
  async coffee() {
    const a = this.a, p = a.person;
    this.enter();
    await this.walk(AT_COFFEE, false);
    await this.turn('back');
    p.armLeft = 'greifen'; await this.wait(300);
    a.cupOnDesk = false; p.holding = 'cup'; await this.wait(300);   // Tasse in der Hand, Untertasse bleibt
    p.armLeft = 'down';
    await this.turn('front');
    const drink: [Pose, number, Face][] = [['cupLow', 600, 'auto'], ['cupDrink', 900, 'auto'], ['cupLow', 300, 'auto'], ['cupDrink', 700, 'auto'], ['cupLow', 800, 'grin']];
    for (const [pose, ms, face] of drink) { p.pose = pose; p.face = face; await this.wait(ms); }
    p.pose = 'stand'; p.face = 'auto';
    await this.turn('back');
    p.armLeft = 'greifen'; await this.wait(300);                  // Tasse zurück auf die Untertasse
    a.cupOnDesk = true; p.holding = 'none'; p.armLeft = 'down';
    await this.leave(false);
  }
  coffeeEnd() { this.a.cupOnDesk = true; }

  /** Drucker abholen (Tafel Drucker_Zyklus): rein bis 456 → greifen 300 → Teil in die Hand, Drucker leer 300 → mit Teil raus. */
  async printFetch() {
    const p = this.a.person;
    this.enter();
    await this.walk(AT_FETCH, false);
    await this.turn('back');
    p.armLeft = 'greifen'; await this.wait(300);
    p.holding = this.printer.obj; this.printer.take(performance.now()); await this.wait(300);
    p.armLeft = 'down';
    const holding = p.holding;
    await this.walk(OFFSTAGE, false);   // walk() setzt armLeft zurück, holding bleibt
    p.holding = holding;
    this.hide();
  }
  printFetchEnd() { if (this.printer.state === 'done') this.printer.take(performance.now()); }

  /** Neuen Druck starten: rein bis 348 → drücken 300 → LED 2× grün → nächstes Objekt → raus. */
  async printStart() {
    const p = this.a.person;
    this.enter();
    await this.walk(AT_BUTTON, false);
    await this.turn('back');
    p.armLeft = 'druecken'; await this.wait(300);
    for (let i = 0; i < 2; i++) { this.printer.ledOverride = LED.GREEN; await this.wait(150); this.printer.ledOverride = LED.OFF; await this.wait(150); }
    this.printer.ledOverride = null;
    this.printer.start(performance.now());
    p.armLeft = 'down';
    await this.leave(false);
  }
  printStartEnd() { this.printer.ledOverride = null; if (this.printer.state === 'empty') this.printer.start(performance.now()); }
}
