// Quelle: TearCalendar.dc.html (HANDOFF_TearCalendar.md §3, §4, §8). Box 192×756, 1 Szenenpixel = 6 px.
import { LAST_DAY, digitPath, pageColors, pileShadow, type PagePose, type TearState } from '../tear';

export const TEAR_W = 192, TEAR_H = 756;

/** Block an der Wand: Nagel, Aufhänger, Rückwand, roter Kopf, aktuelles Blatt und Stapelkanten. */
export function tearPadHtml(day: number): string {
  const { fill, ink } = pageColors(day, false);
  const left = LAST_DAY - day;
  return `<svg width="${TEAR_W}" height="${TEAR_H}" viewBox="0 0 32 126" shape-rendering="crispEdges" style="position: absolute; left: 0px; top: 0px; display: block">
<rect x="6" y="0" width="1" height="1" fill="#2A1A18"></rect>
<g fill="#8A4E30"><rect x="5" y="1" width="1" height="1"></rect><rect x="7" y="1" width="1" height="1"></rect><rect x="4" y="2" width="1" height="1"></rect><rect x="8" y="2" width="1" height="1"></rect></g>
<rect x="2" y="4" width="11" height="19" fill="#1A0F0D" opacity="0.4"></rect>
<rect x="1" y="3" width="11" height="19" fill="#8A4E30"></rect>
<rect x="1" y="3" width="11" height="3" fill="#C4493A"></rect>
<rect x="1" y="6" width="11" height="1" fill="#9E3A2E"></rect>
<g fill="#EDE0C8"><rect x="3" y="4" width="1" height="1"></rect><rect x="5" y="4" width="2" height="1"></rect><rect x="8" y="4" width="1" height="1"></rect></g>
<rect x="2" y="7" width="9" height="12" fill="${fill}"></rect>
${left >= 6 ? '<rect x="2" y="19" width="9" height="1" fill="#D8DCE0"></rect>' : ''}
${left >= 18 ? '<rect x="2" y="20" width="9" height="1" fill="#AFC2D2"></rect>' : ''}
<path d="${digitPath(day)}" transform="translate(2 7)" fill="${ink}"></path>
</svg>`;
}

const snap = (v: number) => Math.round(v / 3) * 3;
const transform = (p: PagePose) =>
  `rotate(${Math.round(p.rot / 3) * 3}deg) skewX(${Math.round(p.skew)}deg) scaleY(${Math.round(p.sy * 20) / 20})`;

/** Abgerissenes Blatt mit gezackter Oberkante (x 2 und x 6 fehlen in Zeile 0). */
function pageHtml(p: PagePose, num: number, fill: string, ink: string): string {
  return `<div style="position: absolute; left: ${snap(p.cx - 27)}px; top: ${snap(p.cy - 36)}px; width: 54px; height: 72px; transform: ${transform(p)}; transform-origin: 50% 50%; pointer-events: none">
<svg width="54" height="72" viewBox="0 0 9 12" shape-rendering="crispEdges" style="display: block"><g fill="${fill}"><rect x="0" y="1" width="9" height="11"></rect><rect x="0" y="0" width="2" height="1"></rect><rect x="3" y="0" width="3" height="1"></rect><rect x="7" y="0" width="2" height="1"></rect></g><path d="${digitPath(num)}" fill="${ink}"></path></svg></div>`;
}

/** Kontaktschatten, Haufen (Lande-Reihenfolge) und fallende Blätter darüber. */
export function tearPagesHtml(s: TearState): string {
  const sh = pileShadow(s.pile);
  const shadow = sh ? `<div style="position: absolute; left: ${sh.left}px; top: 663px; width: ${sh.width}px; height: 6px; background: #1A0F0D; opacity: 0.45; pointer-events: none"></div>` : '';
  return shadow
    + s.pile.map((p) => pageHtml(p, p.num, p.fill, p.ink)).join('')
    + s.fallers.map((f) => pageHtml(f.pose, f.num, f.fill, f.ink)).join('');
}
