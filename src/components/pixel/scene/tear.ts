// Abreißkalender (HANDOFF_TearCalendar.md, design TearCalendar.dc.html): reine Logik, ohne DOM.
// Jeder Presenter-Druck (PageDown/PageUp) reißt ein Blatt ab; es fällt flatternd auf einen Haufen am Boden.
// Koordinaten in CSS-px, lokal zur Komponente (Ursprung Szene (0, 54) = Bühne left 0 / top 324).

export interface PagePose {
  readonly cx: number;
  readonly cy: number;
  /** Grad */
  readonly rot: number;
  /** Grad */
  readonly skew: number;
  readonly sy: number;
}

export interface Faller {
  readonly num: number;
  /** performance.now() beim Druck */
  readonly t0: number;
  readonly tearA: number; readonly A: number; readonly w: number; readonly wf: number;
  readonly dir: -1 | 1; readonly R: number; readonly bob: number; readonly vt: number;
  readonly target: number; readonly finalRot: number; readonly skew: number;
  readonly fill: string; readonly ink: string;
  readonly pose: PagePose;
}

export interface Landed extends PagePose {
  readonly num: number;
  readonly fill: string;
  readonly ink: string;
}

export interface TearState {
  /** Tag auf dem Block, 1…31 */
  readonly day: number;
  /** gerade in der Luft */
  readonly fallers: readonly Faller[];
  /** auf dem Boden, in Lande-Reihenfolge */
  readonly pile: readonly Landed[];
}

export const LAST_DAY = 31;
export const TEAR_START: TearState = { day: 1, fallers: [], pile: [] };

const TEAR_KEYS = new Set(['PageDown', 'PageUp']);
/** Nur die Tasten, die ein Presenter schickt. PageUp reißt (noch) ebenfalls ab. */
export const isTearKey = (key: string) => TEAR_KEYS.has(key);

const BLUE = '#3D8FD1', BLUE_ALT = '#3682C0', WHITE = '#F4F2EC', WHITE_ALT = '#E6E6E2';
/** Bayerisch: gerade Tage blaues Blatt mit weißer Zahl, ungerade weißes Blatt mit blauer Zahl. */
export function pageColors(n: number, alt: boolean): { fill: string; ink: string } {
  return n % 2 === 0 ? { fill: alt ? BLUE_ALT : BLUE, ink: WHITE } : { fill: alt ? WHITE_ALT : WHITE, ink: BLUE };
}

// Drehpunkt = obere rechte Ecke des Blatts am Block; D = Blattmitte relativ dazu
const PX = 66, PY = 42, DX = -27, DY = 36;
const TEAR = 0.24, K = 0.28;
const FLOOR = 655, MAX_HEAP = 66, SETTLE = 70, FLAT = 0.32;
const X_MIN = 12, X_MAX = 150;

export function makeFaller(num: number, now: number, r: () => number = Math.random): Faller {
  return {
    num, t0: now,
    tearA: 24 + 14 * r(), A: 16 + 20 * r(), w: 2 * Math.PI * (0.8 + 0.5 * r()), wf: 2 * Math.PI * (1.4 + 1.2 * r()),
    dir: r() < 0.7 ? -1 : 1, R: 18 + 18 * r(), bob: 6 + 8 * r(), vt: 330 + 90 * r(),
    target: 24 + 72 * r(), finalRot: (r() - 0.5) * 14, skew: (r() - 0.5) * 50,
    ...pageColors(num, r() < 0.5),
    pose: { cx: PX + DX, cy: PY + DY, rot: 0, skew: 0, sy: 1 },
  };
}

/** Ein Druck: Blatt abreißen, oder nach Tag 31 ohne Animation zurück auf Tag 1. */
export function tearPage(s: TearState, now: number, r: () => number = Math.random): TearState {
  if (s.day >= LAST_DAY) return TEAR_START;
  return { ...s, day: s.day + 1, fallers: [...s.fallers, makeFaller(s.day, now, r)] };
}

/** Mitte eines liegenden Blatts an Stelle x: der Haufen wächst mit den Blättern in der Nähe. */
export function landY(x: number, pile: readonly Landed[]): number {
  const h = pile.reduce((sum, p) => sum + Math.max(0, 1 - Math.abs(p.cx - x) / 42) * 5, 0);
  return FLOOR - Math.min(h, MAX_HEAP);
}

const rotate = (deg: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: PX + DX * Math.cos(a) - DY * Math.sin(a), y: PY + DX * Math.sin(a) + DY * Math.cos(a) };
};

/** Pose des Blatts zur Zeit `now`; `landed`, sobald es den Haufen berührt. */
export function pagePose(f: Faller, now: number, pile: readonly Landed[]): PagePose & { landed: boolean } {
  const t = Math.max(0, (now - f.t0) / 1000);
  if (t < TEAR) {
    const a = 0 - f.tearA * (t / TEAR) ** 2; // 0 − … statt −…: kein −0 zu Beginn
    const c = rotate(a);
    return { landed: false, cx: c.x, cy: c.y, rot: a, skew: 0, sy: 1 };
  }
  const a1 = -f.tearA;
  const c1 = rotate(a1);
  const tau = t - TEAR;
  const T = Math.max(0.6, (FLOOR - c1.y) / f.vt + K);
  const drift = (f.target - c1.x) / T;
  const ramp = 1 - Math.exp(-tau / 0.3);
  const s = Math.sin(f.w * tau), c = Math.cos(f.w * tau);
  const cx = Math.max(X_MIN, Math.min(X_MAX, c1.x + drift * tau + f.dir * f.A * ramp * s));
  const cy = c1.y + f.vt * (tau - K * (1 - Math.exp(-tau / K))) - f.bob * ramp * s * s;
  const rot = a1 * Math.exp(-tau / 0.35) + f.dir * f.R * ramp * c;
  const sy = 1 - 0.3 * ramp * (0.5 + 0.5 * Math.cos(f.wf * tau));
  const ly = landY(cx, pile);
  const dist = ly - cy;
  if (dist <= 0) return { landed: true, cx, cy: ly, rot: f.finalRot, skew: f.skew, sy: FLAT };
  if (dist >= SETTLE) return { landed: false, cx, cy, rot, skew: 0, sy };
  // Aufsetzen: flach drücken und in die Liegelage drehen
  const m = dist / SETTLE;
  return { landed: false, cx, cy, rot: f.finalRot + (rot - f.finalRot) * m, skew: f.skew * (1 - m), sy: FLAT + (sy - FLAT) * m };
}

/** Ein Frame: fallende Blätter bewegen, gelandete auf den Haufen legen. */
export function stepTear(s: TearState, now: number): TearState {
  if (!s.fallers.length) return s;
  return s.fallers.reduce<TearState>((acc, f) => {
    const { landed, ...pose } = pagePose(f, now, acc.pile);
    return landed
      ? { ...acc, pile: [...acc.pile, { ...pose, num: f.num, fill: f.fill, ink: f.ink }] }
      : { ...acc, fallers: [...acc.fallers, { ...f, pose }] };
  }, { ...s, fallers: [] });
}

// 3×5-Pixelziffern im Blatt-Raster 9×12: zweistellig x 1–3 / 5–7, einstellig x 3–5, Zeilen 4–8
const GLYPHS: Readonly<Record<string, readonly string[]>> = {
  '0': ['111', '101', '101', '101', '111'], '1': ['010', '110', '010', '010', '111'],
  '2': ['111', '001', '111', '100', '111'], '3': ['111', '001', '111', '001', '111'],
  '4': ['101', '101', '111', '001', '001'], '5': ['111', '100', '111', '001', '111'],
  '6': ['111', '100', '111', '101', '111'], '7': ['111', '001', '010', '010', '010'],
  '8': ['111', '101', '111', '101', '111'], '9': ['111', '101', '111', '001', '111'],
};
const digitCache = new Map<number, string>();
export function digitPath(n: number): string {
  const hit = digitCache.get(n);
  if (hit !== undefined) return hit;
  const str = String(n);
  const x0 = str.length === 2 ? 1 : 3;
  const d = [...str].map((ch, k) => (GLYPHS[ch] ?? []).map((row, y) => [...row]
    .map((bit, x) => (bit === '1' ? `M${x0 + 4 * k + x} ${4 + y}h1v1h-1z` : '')).join('')).join('')).join('');
  digitCache.set(n, d);
  return d;
}

/** Kontaktschatten unter dem Haufen (Mitten ±30 px, im 6-px-Raster), null ohne Haufen. */
export function pileShadow(pile: readonly Landed[]): { left: number; width: number } | null {
  if (!pile.length) return null;
  const xs = pile.map((p) => p.cx);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  return { left: Math.round((minX - 30) / 6) * 6, width: Math.round((maxX - minX + 60) / 6) * 6 };
}
