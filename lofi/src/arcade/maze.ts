// Labyrinth „Bug-Jagd“: Zeichenketten wörtlich aus design/Arcade.dc.html (renderVals), linke Hälfte + Spiegelung.
// # Wand · . Bit · o Kaffee · - Tür des Bug-Nests · Leerzeichen frei. Zeile 10 = Tunnel.
export const HALF = ['##############', '#............#', '#.####.#####.#', '#o####.#####.#', '#.............', '#.####.##.####', '#......##....#',
  '######.#####.#', '     #.##.....', '######.##.###-', '      ....#   ', '######.##.####', '     #.##.....', '######.##.####',
  '#............#', '#.####.#####.#', '#o..##........', '#.#.##.##.####', '#......##.....', '##############'];
export const ROWS = HALF.map((l) => l + l.split('').reverse().join(''));
export const W = 28, H = 20, T = 6, OX = 12, OY = 12;
export const TUNNEL_ROW = 10;
/** Nest-Innenraum (Zeile 10, Spalten 11–16), Tür Spalten 13–14 in Zeile 9, Ausgang oberhalb (Zeile 8) */
export const NEST = { row: 10, c0: 11, c1: 16, doorRow: 9, exit: { c: 13, r: 8 } };

export type Cell = '#' | '.' | 'o' | '-' | ' ';
export const cell = (c: number, r: number): Cell => {
  if (r < 0 || r >= H) return '#';
  return ROWS[r][((c % W) + W) % W] as Cell;
};
export const isWall = (c: number, r: number) => cell(c, r) === '#';
/** begehbar für die Spielfigur (Tür des Nests ist für sie zu) */
export const walkable = (c: number, r: number) => { const ch = cell(c, r); return ch !== '#' && ch !== '-'; };
export const inTunnel = (c: number, r: number) => r === TUNNEL_ROW && (((c % W) + W) % W < 6 || ((c % W) + W) % W > 21);

export interface Pickups { dots: Set<string>; powers: Set<string> }
export const key = (c: number, r: number) => `${c},${r}`;
export function freshPickups(): Pickups {
  const dots = new Set<string>(), powers = new Set<string>();
  ROWS.forEach((row, r) => row.split('').forEach((ch, c) => { if (ch === '.') dots.add(key(c, r)); else if (ch === 'o') powers.add(key(c, r)); }));
  return { dots, powers };
}

/** Erreichbare Kacheln ab (c, r) – Breitensuche mit Tunnel-Wrap (für Tests) */
export function reachable(c0: number, r0: number): Set<string> {
  const seen = new Set([key(c0, r0)]), q: [number, number][] = [[c0, r0]];
  while (q.length) {
    const [c, r] = q.shift()!;
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nc = (((c + dc) % W) + W) % W, nr = r + dr;
      if (walkable(nc, nr) && !seen.has(key(nc, nr))) { seen.add(key(nc, nr)); q.push([nc, nr]); }
    }
  }
  return seen;
}
