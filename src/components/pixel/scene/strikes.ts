// Strich-Varianten für erledigte Kalenderzeilen. Jede Variante ist eine Pixel-Linie über die Spalten
// 2–63 der Zeile (viewBox 66×10), 2 px dick, in Stufen von 1 px. Variante 0 ist der Strich aus
// design/Calendar.dc.html; die Stiftspitze der Figur folgt derselben Linie (strokePose in anim.ts).

/** Segment: Spalten x0–x1 (einschließlich) auf Höhe y */
export type StrikeSeg = readonly [x0: number, x1: number, y: number];

export const STRIKES: readonly (readonly StrikeSeg[])[] = [
  [[2, 15, 5], [16, 35, 4], [36, 51, 5], [52, 63, 4]],                         // Design
  [[2, 21, 5], [22, 43, 4], [44, 63, 3]],                                     // steigt
  [[2, 21, 3], [22, 43, 4], [44, 63, 5]],                                     // fällt
  [[2, 9, 5], [10, 21, 4], [22, 31, 5], [32, 43, 4], [44, 53, 5], [54, 63, 4]], // Zickzack
  [[2, 13, 3], [14, 27, 4], [28, 43, 5], [44, 55, 4], [56, 63, 3]],            // Mulde
  [[2, 13, 5], [14, 27, 4], [28, 43, 3], [44, 55, 4], [56, 63, 5]],            // Bogen
  [[2, 37, 5], [38, 63, 4]],                                                   // ein Knick
];

const variant = (v: number) => STRIKES[v] ?? STRIKES[0]!;

/** Höhe der Linie in Spalte `col` */
export function strikeY(v: number, col: number): number {
  const segs = variant(v);
  return (segs.find(([x0, x1]) => col >= x0 && col <= x1) ?? (col < 2 ? segs[0]! : segs[segs.length - 1]!))[2];
}

/** SVG-Rechtecke der Linie (für <g fill=…>) */
export function strikeRects(v: number): string {
  return variant(v).map(([x0, x1, y]) => `<rect x="${x0}" y="${y}" width="${x1 - x0 + 1}" height="2"></rect>`).join('');
}

/** FNV-1a: stabiler Hash, damit ein Eintrag bei jedem Neuladen denselben Strich bekommt */
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193);
  return h >>> 0;
}

/** Strich je Eintrag (Schlüssel z. B. "08:00 Arbeitsphase"): zufällig wirkend, stabil, nie zweimal untereinander gleich. */
export function strikeVariants(keys: readonly string[]): number[] {
  const out: number[] = [];
  for (const k of keys) {
    let v = hash(k) % STRIKES.length;
    if (v === out[out.length - 1]) v = (v + 1) % STRIKES.length;
    out.push(v);
  }
  return out;
}
