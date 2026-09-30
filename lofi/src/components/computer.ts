// Quelle: design/Computer.dc.html
import { esc, type PcState } from '../types';

export interface ComputerProps {
  state: PcState;
  num: string; total: string; clock: string;
  phase: string; countdown: string; next: string;
  fill: number;            // 0–16
  /** Blinken: Countdown und LED aus */
  dark?: boolean;
}

// Farben/Größen je Zustand aus renderVals() übernommen (Texte kommen aus echten Daten)
export const STYLE: Record<PcState, { timeSize: number; accent: string; time: string; led: string }> = {
  laeuft:   { timeSize: 78, accent: '#B8E0A8', time: '#E2F5D6', led: '#7BD389' },
  endspurt: { timeSize: 78, accent: '#F2B866', time: '#F7C77A', led: '#F2B866' },
  pause:    { timeSize: 78, accent: '#B8E0A8', time: '#E2F5D6', led: '#7BD389' },
  ende:     { timeSize: 62, accent: '#B8E0A8', time: '#E2F5D6', led: '#7BD389' },
  arcade:   { timeSize: 78, accent: '#F2B866', time: '#F7C77A', led: '#F2B866' },
};

/** Beispielwerte aus dem Design (für ?ref und den Screenshot-Vergleich). */
export const DESIGN_SAMPLES: Record<PcState, Omit<ComputerProps, 'state'>> = {
  laeuft:   { num: '04', total: '08', phase: 'HACKING I', countdown: '01:24:37', clock: '11:05', next: 'NÄCHSTE > MITTAG · 12:30', fill: 6 },
  endspurt: { num: '04', total: '08', phase: 'HACKING I · ENDSPURT', countdown: '00:04:12', clock: '12:25', next: 'NÄCHSTE > MITTAG · 12:30', fill: 15 },
  pause:    { num: '05', total: '08', phase: 'MITTAGESSEN', countdown: '00:38:50', clock: '12:36', next: 'NÄCHSTE > HACKING II · 13:15', fill: 3 },
  ende:     { num: '08', total: '08', phase: 'ABSCHLUSS', countdown: 'GESCHAFFT!', clock: '17:00', next: 'DANKE FÜRS MITHACKEN!', fill: 16 },
  arcade:   { num: '--', total: '08', phase: 'BUG-JAGD', countdown: 'READY?', clock: 'G·A·M·E', next: 'ENTER = START', fill: 16 },
};

export function computerHtml(p: ComputerProps): string {
  const s = STYLE[p.state] || STYLE.laeuft;
  const led = p.dark ? '#1A1512' : s.led;
  let cells = '';
  for (let i = 0; i < 16; i++) cells += `<div style="flex-grow: 1; height: 8px; background: ${i < p.fill ? s.accent : '#34503F'}"></div>`;
  return `<div style="width: 528px; height: 384px; position: relative; font-family: 'VT323', monospace; color: #B8E0A8">
<svg width="528" height="384" viewBox="0 0 88 64" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" style="position: absolute; left: 0px; top: 0px; display: block">
<defs>
<pattern id="pc-keys" x="0" y="0" width="3" height="2" patternUnits="userSpaceOnUse"><rect width="3" height="2" fill="#2F2A26"></rect><rect width="2" height="1" fill="#EDE0C8"></rect><rect y="1" width="2" height="1" fill="#B9AA8C"></rect></pattern>
</defs>
<rect x="3" y="2" width="84" height="52" fill="#1A0F0D" opacity="0.35"></rect>
<rect x="28" y="52" width="28" height="3" fill="#B9AA8C"></rect>
<rect x="2" y="0" width="80" height="52" fill="#D8CBB0"></rect>
<rect x="1" y="1" width="82" height="50" fill="#D8CBB0"></rect>
<rect x="2" y="1" width="80" height="1" fill="#EAE0CC"></rect>
<rect x="1" y="47" width="82" height="4" fill="#B9AA8C"></rect>
<rect x="2" y="51" width="80" height="1" fill="#B9AA8C"></rect>
<rect x="4" y="4" width="60" height="42" fill="#2A2622"></rect>
<rect x="5" y="5" width="58" height="40" fill="#1E2E26"></rect>
<rect x="66" y="4" width="14" height="42" fill="#2F2A26"></rect>
<rect x="70" y="8" width="6" height="6" fill="#B9AA8C"></rect>
<rect x="71" y="9" width="4" height="4" fill="#D8CBB0"></rect>
<rect x="70" y="18" width="6" height="6" fill="#B9AA8C"></rect>
<rect x="71" y="19" width="4" height="4" fill="#D8CBB0"></rect>
<rect x="69" y="29" width="8" height="1" fill="#1A1512"></rect>
<rect x="69" y="31" width="8" height="1" fill="#1A1512"></rect>
<rect x="69" y="33" width="8" height="1" fill="#1A1512"></rect>
<rect x="72" y="39" width="2" height="2" fill="${led}"></rect>
<rect x="6" y="55" width="76" height="9" fill="#2F2A26"></rect>
<rect x="7" y="55" width="74" height="1" fill="#3E3833"></rect>
<rect x="8" y="57" width="72" height="2" fill="url(#pc-keys)"></rect>
<rect x="8" y="60" width="72" height="2" fill="url(#pc-keys)"></rect>
<rect x="30" y="60" width="24" height="2" fill="#EDE0C8"></rect>
<rect x="30" y="61" width="24" height="1" fill="#B9AA8C"></rect>
</svg>
<div id="screen" style="position: absolute; left: 30px; top: 30px; width: 348px; height: 240px; overflow: hidden; background: #1E2E26; box-sizing: border-box; padding: 14px 20px; display: flex; flex-direction: column; justify-content: space-between; text-shadow: 0 0 6px rgba(184,224,168,0.45)">
<div style="display: flex; justify-content: space-between; font-size: 18px; color: #7FA58A">
<span>PHASE ${esc(p.num)}/${esc(p.total)}</span>
<span>${esc(p.clock)}</span>
</div>
<div style="font-size: 26px; line-height: 1; letter-spacing: 1px; color: ${s.accent}">${esc(p.phase)}</div>
<div style="font-size: ${s.timeSize}px; line-height: 0.9; letter-spacing: 1px; color: ${s.time}; visibility: ${p.dark ? 'hidden' : 'visible'}">${esc(p.countdown)}</div>
<div style="display: flex; gap: 4px; height: 8px">
${cells}
</div>
<div style="font-size: 18px; color: #7FA58A">${esc(p.next)}</div>
<div style="position: absolute; left: 0px; top: 0px; width: 348px; height: 240px; pointer-events: none; background: repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 3px, rgba(0,0,0,0) 3px, rgba(0,0,0,0) 6px)"></div>
</div>
</div>`;
}
