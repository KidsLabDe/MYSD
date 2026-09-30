// Spielfeld auf <canvas> 192×132 (6× skaliert, ohne Glättung). Pixel wörtlich aus design/Arcade.dc.html.
import { ROWS, W, H, T, OX, OY, key, type Pickups } from './maze';
import { BUG_COLORS, FRIGHT_COLOR, type Game, type Dir } from './game';

type R = [number, number, number, number, string, number?];
const rect = (ctx: CanvasRenderingContext2D, x: number, y: number, rs: R[]) => {
  for (const [rx, ry, w, h, c, a] of rs) { ctx.globalAlpha = a ?? 1; ctx.fillStyle = c; ctx.fillRect(x + rx, y + ry, w, h); }
  ctx.globalAlpha = 1;
};
const CUP: R[] = [[1, 2, 3, 3, '#EDE0C8'], [1, 2, 3, 1, '#5E3320'], [4, 3, 1, 1, '#EDE0C8'], [2, 0, 1, 1, '#F2B866'], [3, 1, 1, 1, '#F2B866']];
/** Augen je Blickrichtung (Design zeigt nur x 1/3; rechts 2/4 und hoch/runter 1/4 sind Vorschlag) */
export const EYES: Record<Dir, [number, number]> = { left: [1, 3], right: [2, 4], up: [1, 4], down: [1, 4] };
const bulb = (e1: number, e2: number): R[] => [[0, 0, 6, 6, '#FCE680', 0.18], [1, 0, 4, 1, '#FCE680'], [0, 1, 6, 3, '#FCE680'], [1, 4, 4, 1, '#FCE680'],
  [e1, 1, 1, 2, '#1A1512'], [e2, 1, 1, 2, '#1A1512'], [2, 5, 2, 1, '#F0A31B']];
const bug = (c: string): R[] => [[1, 0, 1, 1, c], [4, 0, 1, 1, c], [1, 1, 4, 4, c], [0, 2, 1, 1, c], [5, 2, 1, 1, c], [0, 4, 1, 1, c], [5, 4, 1, 1, c],
  [1, 5, 1, 1, c], [4, 5, 1, 1, c], [2, 2, 1, 1, '#EDE0C8'], [3, 2, 1, 1, '#1A1512']];

export function drawMaze(ctx: CanvasRenderingContext2D, pick: Pickups) {
  ROWS.forEach((row, r) => row.split('').forEach((ch, c) => {
    const x = OX + c * T, y = OY + r * T;
    if (ch === '#') { rect(ctx, x, y, [[0, 0, 6, 6, '#2F5A46']]); if (r === 0 || ROWS[r - 1]?.[c] !== '#') rect(ctx, x, y, [[0, 0, 6, 1, '#5E9A78']]); }
    else if (ch === '-') rect(ctx, x, y, [[0, 2, 6, 2, '#F07A7A']]);
  }));
  for (const k of pick.dots) { const [c = 0, r = 0] = k.split(',').map(Number); rect(ctx, OX + c * T, OY + r * T, [[2, 2, 2, 2, '#E9F7DF']]); }
  for (const k of pick.powers) { const [c = 0, r = 0] = k.split(',').map(Number); rect(ctx, OX + c * T, OY + r * T, CUP); }
}

/** Figur/Bug zeichnen, im Tunnel auf das Labyrinth zugeschnitten und über den Rand gewrappt */
function sprite(ctx: CanvasRenderingContext2D, x: number, y: number, rs: R[]) {
  ctx.save(); ctx.beginPath(); ctx.rect(OX, OY, W * T, H * T); ctx.clip();
  rect(ctx, OX + x, OY + y, rs);
  if (x > W * T - T) rect(ctx, OX + x - W * T, OY + y, rs);
  ctx.restore();
}

export function drawGame(ctx: CanvasRenderingContext2D, g: Game, ms: number) {
  ctx.clearRect(0, 0, 192, 132);
  drawMaze(ctx, g.pick);
  const blink = Math.floor(ms / 150) % 2 === 0;
  const p = g.player;
  if (!(g.phase === 'dying' && !blink)) { const [e1, e2] = EYES[p.dir]; sprite(ctx, p.x, p.y, bulb(e1, e2)); }
  for (const b of g.bugs) {
    if (b.state === 'eaten') continue;
    let c = BUG_COLORS[b.name];
    if (b.fright) c = g.frightUntil - g.t < 1 && !blink ? BUG_COLORS[b.name] : FRIGHT_COLOR; // letzte Sekunde blinkt
    sprite(ctx, b.x, b.y, bug(c));
  }
}

/** Beispielzustand aus renderVals() (für ?arcade=play&demo=canvas): gefressene Bits, Figur 13/14, Bugs */
export function drawDemo(ctx: CanvasRenderingContext2D) {
  const eaten = new Set<string>();
  for (let c = 14; c <= 26; c++) eaten.add(key(c, 14));
  for (let r = 15; r <= 18; r++) eaten.add(key(26, r));
  for (let c = 1; c <= 11; c++) eaten.add(key(c, 4));
  const dots = new Set<string>(), powers = new Set<string>();
  ROWS.forEach((row, r) => row.split('').forEach((ch, c) => {
    if (ch === '.' && !eaten.has(key(c, r))) dots.add(key(c, r));
    if (ch === 'o' && !(r === 16 && c === 26)) powers.add(key(c, r));
  }));
  ctx.clearRect(0, 0, 192, 132);
  drawMaze(ctx, { dots, powers });
  rect(ctx, OX + 13 * T, OY + 14 * T, bulb(1, 3));
  ([[9, 4, '#F0A31B'], [21, 6, '#C48BC4'], [12, 10, '#7FE0C2'], [15, 10, '#4CC8F0']] as [number, number, string][]).forEach(([c, r, col]) => rect(ctx, OX + c * T, OY + r * T, bug(col)));
}
