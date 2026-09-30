// Quelle: design/Calendar.dc.html
import { esc } from '../types';

export interface CalendarProps {
  title: string;       // "HACKDAY"
  titleSize?: number;  // Schriftgröße, falls der Titel zu lang ist (Standard 24)
  subline: string;     // "[DATUM] · [ORT]"
  rows: { time: string; name: string; size?: number }[]; // max. 8 · size: Schriftgröße, falls der Name zu lang ist
  struck: number;      // Zeilen < struck sind erledigt
  nowRow: number;      // Zeile mit "JETZT" (-1 = keine)
  /** Strich wird gerade gezogen (design/Calendar.dc.html drawRow/drawLen): sichtbar (2 + len)·6 px. */
  draw?: { row: number; len: number } | null;
}

const strikeDraw = (len: number) => `<div class="strike-draw" style="position: absolute; left: 0px; top: 0px; width: ${(2 + Math.max(0, Math.min(62, len))) * 6}px; height: 60px; overflow: hidden; pointer-events: none"><svg width="396" height="60" viewBox="0 0 66 10" shape-rendering="crispEdges" style="display: block"><g fill="#C4493A"><rect x="2" y="5" width="14" height="2"></rect><rect x="16" y="4" width="20" height="2"></rect><rect x="36" y="5" width="16" height="2"></rect><rect x="52" y="4" width="12" height="2"></rect></g></svg></div>`;
const CHECK = `<svg width="24" height="18" viewBox="0 0 8 6" shape-rendering="crispEdges" style="display: block"><g fill="#4F7A3E"><rect x="0" y="3" width="1" height="1"></rect><rect x="1" y="4" width="1" height="1"></rect><rect x="2" y="5" width="1" height="1"></rect><rect x="3" y="4" width="1" height="1"></rect><rect x="4" y="3" width="1" height="1"></rect><rect x="5" y="2" width="1" height="1"></rect><rect x="6" y="1" width="1" height="1"></rect><rect x="7" y="0" width="1" height="1"></rect></g></svg>`;
const strike = () => `<svg class="strike" width="396" height="60" viewBox="0 0 66 10" shape-rendering="crispEdges" style="position: absolute; left: 0px; top: 0px; pointer-events: none"><g fill="#C4493A"><rect x="2" y="5" width="14" height="2"></rect><rect x="16" y="4" width="20" height="2"></rect><rect x="36" y="5" width="16" height="2"></rect><rect x="52" y="4" width="12" height="2"></rect></g></svg>`;

export function calendarHtml(p: CalendarProps): string {
  const struck = Math.max(0, Math.min(8, p.struck));
  const rows = p.rows.slice(0, 8).map((r, i) => {
    const done = i < struck, now = i === p.nowRow;
    const op = done ? '0.45' : '1';
    const bg = now ? 'rgba(224,169,74,0.32)' : 'rgba(0,0,0,0)';
    const drawing = !!p.draw && p.draw.row === i && i >= struck;
    return `<div data-row="${i}" style="position: relative; height: 60px; box-sizing: border-box; padding: 0px 18px; display: flex; align-items: center; gap: 12px; border-bottom: 3px dashed #D6C6A6; background: ${bg}">
<div style="width: 56px;${r.size ? ' flex-shrink: 0;' : ''} font-size: 18px; color: #8A6A55; opacity: ${op}">${esc(r.time)}</div>
<div style="flex-grow: 1; font-size: ${r.size ?? 23}px; line-height: 1; white-space: nowrap; opacity: ${op}">${esc(r.name)}</div>
${done ? CHECK : ''}
${now ? `<div style="${r.size ? 'flex-shrink: 0; ' : ''}background: #C4493A; color: #EDE0C8; font-size: 16px; padding: 3px 8px; white-space: nowrap">JETZT</div>` : ''}
${done ? strike() : ''}
${drawing ? strikeDraw(p.draw!.len) : ''}
</div>`;
  }).join('');
  return `<div style="width: 432px; height: 660px; position: relative; font-family: 'Pixelify Sans', monospace; color: #2A1A18">
<svg width="432" height="660" viewBox="0 0 72 110" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" style="position: absolute; left: 0px; top: 0px; display: block">
<g fill="#8A4E30">
<rect x="31" y="3" width="4" height="1"></rect><rect x="27" y="4" width="4" height="1"></rect><rect x="23" y="5" width="4" height="1"></rect><rect x="19" y="6" width="4" height="1"></rect><rect x="15" y="7" width="4" height="1"></rect><rect x="11" y="8" width="4" height="1"></rect><rect x="8" y="9" width="3" height="1"></rect>
<rect x="37" y="3" width="4" height="1"></rect><rect x="41" y="4" width="4" height="1"></rect><rect x="45" y="5" width="4" height="1"></rect><rect x="49" y="6" width="4" height="1"></rect><rect x="53" y="7" width="4" height="1"></rect><rect x="57" y="8" width="4" height="1"></rect><rect x="61" y="9" width="3" height="1"></rect>
</g>
<rect x="35" y="1" width="2" height="2" fill="#2A1A18"></rect>
<rect x="5" y="12" width="66" height="98" fill="#1A0F0D" opacity="0.4"></rect>
<rect x="3" y="10" width="66" height="98" fill="#EDE0C8"></rect>
<rect x="3" y="10" width="66" height="14" fill="#C4493A"></rect>
<rect x="3" y="24" width="66" height="1" fill="#9E3A2E"></rect>
<g fill="#2A1A18">
<rect x="10" y="9" width="2" height="3"></rect><rect x="20" y="9" width="2" height="3"></rect><rect x="30" y="9" width="2" height="3"></rect><rect x="40" y="9" width="2" height="3"></rect><rect x="50" y="9" width="2" height="3"></rect><rect x="60" y="9" width="2" height="3"></rect>
</g>
<g fill="#D6C6A6">
<rect x="68" y="102" width="1" height="6"></rect><rect x="67" y="103" width="1" height="5"></rect><rect x="66" y="104" width="1" height="4"></rect><rect x="65" y="105" width="1" height="3"></rect><rect x="64" y="106" width="1" height="2"></rect><rect x="63" y="107" width="1" height="1"></rect>
</g>
</svg>
<div style="position: absolute; left: 18px; top: 60px; width: 396px; height: 84px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: #EDE0C8">
<div style="font-family: 'Press Start 2P', monospace; font-size: ${p.titleSize ?? 24}px; line-height: 1${p.titleSize ? '; white-space: nowrap' : ''}">${esc(p.title)}</div>
<div style="font-size: 16px; letter-spacing: 1px">${esc(p.subline)}</div>
</div>
<div style="position: absolute; left: 18px; top: 156px; width: 396px; display: flex; flex-direction: column">
${rows}
</div>
</div>`;
}
