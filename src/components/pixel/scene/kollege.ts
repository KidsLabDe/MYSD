// Kollege Fabi (Update 7, design/Kollege.dc.html + PROMPT_Kollege.md): zweite Figur, Vortrag per Taste V.
// Reine Zeitfunktion: aus der Zeit seit dem Start (und ggf. dem Abbruchzeitpunkt) folgt der Zustand der Figur.
// Kein Zustand wird verändert; das Blinzeln würfelt die Szene und reicht es als Flag herein.
import type { KollegeFace, KollegePose, KollegeView } from './components/kollege';

/** Standplatz (left, px). Vorschlag laut Design war 540; bei `point` reicht die Hand bis x 57 (= left + 342 px)
 *  und läge damit auf dem Monitor-Bildschirm (ab 858 px). 516 ist der größte Wert im 6-px-Raster, bei dem sie
 *  davor endet (516 + 342 = 858), per Screenshot geprüft. */
export const K_SPOT = 516;
/** Start- und Endpunkt links außerhalb der Bühne */
export const K_OFF = -264;
/** Laufen wie die Person: 576 px in 1,4 s, Position in 6-px-Stufen, walkA/walkB alle 180 ms */
export const K_WALK_PX_S = 576 / 1.4;
const STEP = 6;
const WALK_FRAME_MS = 180;
/** Zwischenbild „stand“ beim Drehen */
export const K_TURN_MS = 120;
/** Mund auf/zu beim Sprechen */
export const K_TALK_FLIP_MS = 200;
/** Blinzeln: alle 3–6 s für 120 ms */
export const K_BLINK_MS = 120;
export const nextBlink = (rnd: number) => 3000 + rnd * 3000;

export interface KollegeStep {
  readonly pose: KollegePose;
  readonly ms: number;
}

const alternate = (a: KollegePose, b: KollegePose, ms: number, times: number): KollegeStep[] =>
  Array.from({ length: times }, () => [{ pose: a, ms }, { pose: b, ms }]).flat();

/** Vortrag in Vorderansicht (Tafel Kollege_Vortrag, Timing aus PROMPT_Kollege.md §3.2). „4×“ = vier Wechsel-Paare. */
export const TALK_STEPS: readonly KollegeStep[] = [
  { pose: 'open', ms: 1500 },
  { pose: 'talk', ms: 3000 },
  { pose: 'point', ms: 2000 },
  { pose: 'clicker', ms: 600 },
  { pose: 'talk', ms: 2000 },
  { pose: 'pointUp', ms: 1500 },
  { pose: 'think', ms: 2000 },
  { pose: 'talk', ms: 2000 },
  ...alternate('clap', 'open', 180, 4),
  ...alternate('waveA', 'waveB', 250, 4),
];
export const TALK_MS = TALK_STEPS.reduce((s, x) => s + x.ms, 0);

/** Posen, in denen er spricht (Mund wechselt talk ↔ smile) */
const SPEAKING: ReadonlySet<KollegePose> = new Set(['talk', 'point', 'pointUp', 'open', 'clicker']);

/** Laufzeit in ganzen ms (aufgerundet), damit die Timeline ganzzahlig bleibt und er am Ende genau am Ziel steht */
const walkMs = (from: number, to: number) => Math.ceil((Math.abs(to - from) * 1000) / K_WALK_PX_S);
/** Auftritt: hereinlaufen, dann Zwischenbild und zur Front drehen */
export const ENTER_MS = walkMs(K_OFF, K_SPOT) + K_TURN_MS;
/** Zeitpunkt, an dem er von selbst geht */
export const LEAVE_AT = ENTER_MS + TALK_MS;

export interface KollegeState {
  readonly x: number;
  readonly view: KollegeView;
  readonly pose: KollegePose;
  readonly face: KollegeFace;
}

/** Position beim Laufen: nur ganze Szenenpixel (6 px), stoppt genau am Ziel */
function walkX(from: number, to: number, el: number) {
  const dir = Math.sign(to - from);
  const x = from + dir * Math.floor((el * K_WALK_PX_S) / 1000 / STEP) * STEP;
  return dir > 0 ? Math.min(x, to) : Math.max(x, to);
}
const walkPose = (el: number): KollegePose => (Math.floor(el / WALK_FRAME_MS) % 2 ? 'walkB' : 'walkA');

/** Zustand ohne Abgang (Auftritt + Vortrag); nach dem Vortrag bleibt er im letzten Bild stehen. */
function onStage(t: number): KollegeState {
  const walk = walkMs(K_OFF, K_SPOT);
  if (t < walk) return { x: walkX(K_OFF, K_SPOT, t), view: 'right', pose: walkPose(t), face: 'auto' };
  if (t < ENTER_MS) return { x: K_SPOT, view: 'right', pose: 'stand', face: 'auto' };
  let rest = t - ENTER_MS;
  for (const s of TALK_STEPS) {
    if (rest < s.ms) {
      const face: KollegeFace = SPEAKING.has(s.pose) ? (Math.floor(rest / K_TALK_FLIP_MS) % 2 ? 'smile' : 'talk') : 'auto';
      return { x: K_SPOT, view: 'front', pose: s.pose, face };
    }
    rest -= s.ms;
  }
  const last = TALK_STEPS[TALK_STEPS.length - 1]!;
  return { x: K_SPOT, view: 'front', pose: last.pose, face: 'auto' };
}

/**
 * Zustand t ms nach dem Start. `leaveAt` = Abbruch per V (ms nach dem Start); ohne ihn geht er nach dem Vortrag.
 * Abgang: 120 ms „stand“ mit Blick nach links, dann nach links hinaus. null = nicht mehr sichtbar (fertig).
 * `blink` legt für 120 ms die Augen zu (nur in der Vorderansicht sichtbar).
 */
export function kollegeAt(t: number, leaveAt: number | null = null, blink = false): KollegeState | null {
  const leave = Math.min(leaveAt ?? LEAVE_AT, LEAVE_AT);
  let s: KollegeState;
  if (t < leave) s = onStage(t);
  else {
    const from = onStage(leave).x;
    const el = t - leave;
    if (el < K_TURN_MS) s = { x: from, view: 'left', pose: 'stand', face: 'auto' };
    else {
      const w = el - K_TURN_MS;
      if (w >= walkMs(from, K_OFF)) return null;
      s = { x: walkX(from, K_OFF, w), view: 'left', pose: walkPose(w), face: 'auto' };
    }
  }
  return blink && s.view === 'front' ? { ...s, face: 'blink' } : s;
}

/** Gesamtdauer eines Auftritts, abgebrochen bei `leaveAt` (sonst vollständig) */
export function kollegeTotalMs(leaveAt: number | null = null) {
  const leave = Math.min(leaveAt ?? LEAVE_AT, LEAVE_AT);
  return leave + K_TURN_MS + walkMs(onStage(leave).x, K_OFF);
}
