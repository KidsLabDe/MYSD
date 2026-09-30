// Quelle: design/Window.dc.html (SVG wörtlich übernommen, renderVals 1:1 portiert)
import type { Weather } from '../types';

export interface WindowProps {
  weather: Weather;
  blinds: number;
  /** Überschreibt die Griff-Position (Pixel-y), solange die Figur die Schnur hält. */
  handleY?: number | null;
  /** Wetter-Animation: Verschiebung in Pixeln (0 = Stand wie im Design). */
  rainOff?: number;
  snowOff?: number;
  /** Blitz sichtbar? (Standbild im Design: sichtbar) */
  bolt?: boolean;
}

const W: Record<Weather, { sky: string; halo: string; halo2: string; light: number; sill: string }> = {
  sonnig:   { sky: '#FFF4D8', halo: '#553530', halo2: '#633E33', light: 0.2, sill: '#E0A060' },
  bewoelkt: { sky: '#CFC9BE', halo: '#4F322D', halo2: '#563832', light: 0.08, sill: '#A8785A' },
  regen:    { sky: '#7E8A92', halo: '#4C302C', halo2: '#4F332F', light: 0.04, sill: '#8A5A42' },
  schnee:   { sky: '#D6DCE0', halo: '#533833', halo2: '#5C413B', light: 0.1, sill: '#B8927A' },
  gewitter: { sky: '#4A5062', halo: '#4A2E2B', halo2: '#4A2E2B', light: 0.02, sill: '#8A4E30' },
  nacht:    { sky: '#1C2236', halo: '#4A2E2B', halo2: '#4A2E2B', light: 0, sill: '#8A4E30' },
};

export function windowVals(p: WindowProps) {
  const weather: Weather = W[p.weather] ? p.weather : 'sonnig';
  const w = W[weather];
  const b = Math.max(0, Math.min(100, p.blinds ?? 40));
  const blindH = Math.round((88 * b) / 100 / 3) * 3;
  let cordH = Math.min(84, 40 + Math.round((88 - blindH) / 2));
  if (p.handleY != null) cordH = p.handleY - 9;
  return {
    weather, sky: w.sky, halo: w.halo, halo2: w.halo2, sillLight: w.sill,
    light: String(b >= 100 ? w.light * 0.3 : w.light),
    stripes: b > 0, solid: b === 0,
    blindH, railY: 9 + blindH, cordH, cordY: 9 + cordH,
  };
}

/** Griff-y laut Design-Formel (ohne Hand). */
export function restHandleY(blinds: number) {
  return windowVals({ weather: 'sonnig', blinds }).cordY;
}

// Tropfen/Flocken aus dem Design; wandern in 1-Pixel-Schritten nach unten, gewrappt.
const RAIN: [number, number][] = [[30,32],[40,42],[52,30],[60,50],[72,36],[84,46],[96,32],[106,52],[34,60],[48,68],[66,62],[80,70],[92,60],[110,68],[44,54],[100,42]];
const STORM: [number, number][] = [[32,36],[46,48],[56,34],[88,40],[100,54],[38,62],[84,64],[108,36]];
const SNOW: [number, number, number][] = [[30,18,1],[44,28,2],[58,16,1],[70,34,2],[86,22,1],[100,40,2],[112,18,1],[36,46,1],[52,56,2],[66,50,1],[80,62,2],[94,54,1],[108,64,2],[40,66,1],[60,72,1],[74,80,2]];
const wrap = (y: number, off: number, lo: number, hi: number) => lo + (((y - lo + off) % (hi - lo)) + (hi - lo)) % (hi - lo);

export const rainDrops = (off = 0) =>
  RAIN.map(([x, y]) => `<rect x="${x}" y="${wrap(y, off, 29, 97)}" width="1" height="4"></rect>`).join('');
export const stormDrops = (off = 0) =>
  STORM.map(([x, y]) => `<rect x="${x}" y="${wrap(y, off, 30, 97)}" width="1" height="4"></rect>`).join('');
export const snowFlakes = (off = 0) =>
  SNOW.map(([x, y, s]) => `<rect x="${x}" y="${wrap(y, off, 9, 88)}" width="${s}" height="${s}"></rect>`).join('');

const stripeRows = (h: number) =>
  [[122,12],[125,18],[128,24],[131,30],[134,36],[137,42],[140,48],[143,54],[146,60],[149,66],[152,72],[155,78],[158,84],[161,90],[164,96],[167,102]]
    .map(([x, y], i) => `<rect x="${x}" y="${y}" width="30" height="${h}"></rect>${i % 4 === 3 && i < 15 ? '\n' : ''}`).join('');

export function windowHtml(p: WindowProps): string {
  const v = windowVals(p);
  const wx = v.weather;
  const ro = p.rainOff ?? 0, so = p.snowOff ?? 0, bolt = p.bolt ?? true;
  return `<div style="width: 1260px; height: 672px; position: relative; font-family: monospace; color: #2A1A18">
<svg width="1260" height="672" viewBox="0 0 210 112" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" style="display: block">
<defs>
<pattern id="wn-slat-sonnig" x="0" y="0" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="2" fill="#FFE2A6"></rect><rect y="2" width="4" height="1" fill="#D48E52"></rect></pattern>
<pattern id="wn-slat-bewoelkt" x="0" y="0" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="2" fill="#E2D9C6"></rect><rect y="2" width="4" height="1" fill="#B3A58C"></rect></pattern>
<pattern id="wn-slat-regen" x="0" y="0" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="2" fill="#B9BDB8"></rect><rect y="2" width="4" height="1" fill="#8A8E88"></rect></pattern>
<pattern id="wn-slat-schnee" x="0" y="0" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="2" fill="#E4E6E2"></rect><rect y="2" width="4" height="1" fill="#B4B8B4"></rect></pattern>
<pattern id="wn-slat-gewitter" x="0" y="0" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="2" fill="#8E93A0"></rect><rect y="2" width="4" height="1" fill="#646874"></rect></pattern>
<pattern id="wn-slat-nacht" x="0" y="0" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="2" fill="#3A3E4C"></rect><rect y="2" width="4" height="1" fill="#262833"></rect></pattern>
</defs>
<rect x="14" y="0" width="112" height="108" fill="${v.halo}"></rect>
<rect x="17" y="3" width="106" height="102" fill="${v.halo2}"></rect>
${v.stripes ? `<g fill="#FFD08A" opacity="${v.light}">${stripeRows(4)}</g>` : ''}
${v.solid ? `<g fill="#FFD08A" opacity="${v.light}">${stripeRows(6)}</g>` : ''}
<rect x="20" y="6" width="100" height="94" fill="#2A1A18"></rect>
<rect x="23" y="9" width="94" height="88" fill="${v.sky}"></rect>
${wx === 'sonnig' ? `<g>
<rect x="86" y="14" width="18" height="18" fill="#FFE9B0"></rect>
<rect x="89" y="17" width="12" height="12" fill="#FFFBEE"></rect>
<rect x="23" y="86" width="94" height="11" fill="#F0CF94"></rect>
<rect x="28" y="78" width="16" height="8" fill="#F0CF94"></rect>
<rect x="31" y="74" width="10" height="4" fill="#F0CF94"></rect>
<rect x="54" y="81" width="20" height="5" fill="#F0CF94"></rect>
<rect x="86" y="76" width="18" height="10" fill="#F0CF94"></rect>
<rect x="90" y="72" width="10" height="4" fill="#F0CF94"></rect>
</g>` : ''}
${wx === 'bewoelkt' ? `<g>
<rect x="30" y="20" width="26" height="6" fill="#E9E4DA"></rect><rect x="34" y="16" width="16" height="4" fill="#E9E4DA"></rect>
<rect x="66" y="30" width="34" height="7" fill="#E9E4DA"></rect><rect x="72" y="26" width="18" height="4" fill="#E9E4DA"></rect>
<rect x="40" y="46" width="22" height="5" fill="#E9E4DA"></rect><rect x="86" y="54" width="20" height="4" fill="#E9E4DA"></rect>
<rect x="23" y="86" width="94" height="11" fill="#9E978A"></rect>
<rect x="28" y="78" width="16" height="8" fill="#9E978A"></rect><rect x="31" y="74" width="10" height="4" fill="#9E978A"></rect>
<rect x="54" y="81" width="20" height="5" fill="#9E978A"></rect>
<rect x="86" y="76" width="18" height="10" fill="#9E978A"></rect><rect x="90" y="72" width="10" height="4" fill="#9E978A"></rect>
</g>` : ''}
${wx === 'regen' ? `<g>
<rect x="23" y="9" width="94" height="14" fill="#697580"></rect>
<rect x="30" y="23" width="40" height="5" fill="#697580"></rect><rect x="80" y="23" width="30" height="6" fill="#697580"></rect>
<g id="wx-drops" fill="#C3D0D8">${rainDrops(ro)}</g>
<rect x="23" y="86" width="94" height="11" fill="#56625C"></rect>
<rect x="28" y="78" width="16" height="8" fill="#56625C"></rect><rect x="31" y="74" width="10" height="4" fill="#56625C"></rect>
<rect x="54" y="81" width="20" height="5" fill="#56625C"></rect>
<rect x="86" y="76" width="18" height="10" fill="#56625C"></rect><rect x="90" y="72" width="10" height="4" fill="#56625C"></rect>
</g>` : ''}
${wx === 'schnee' ? `<g>
<rect x="28" y="78" width="16" height="10" fill="#B0B8BC"></rect><rect x="31" y="74" width="10" height="4" fill="#F4F6F8"></rect>
<rect x="86" y="76" width="18" height="12" fill="#B0B8BC"></rect><rect x="90" y="72" width="10" height="4" fill="#F4F6F8"></rect>
<rect x="23" y="88" width="94" height="9" fill="#F4F6F8"></rect>
<g id="wx-flakes" fill="#FFFFFF">${snowFlakes(so)}</g>
</g>` : ''}
${wx === 'gewitter' ? `<g>
<rect x="23" y="9" width="94" height="16" fill="#3A3F4E"></rect>
<rect x="36" y="25" width="30" height="5" fill="#3A3F4E"></rect><rect x="84" y="25" width="26" height="4" fill="#3A3F4E"></rect>
<g id="wx-bolt" fill="#FFF4B0" style="display: ${bolt ? 'inline' : 'none'}">
<rect x="72" y="26" width="3" height="6"></rect><rect x="69" y="32" width="6" height="2"></rect><rect x="70" y="34" width="3" height="6"></rect><rect x="67" y="40" width="6" height="2"></rect><rect x="68" y="42" width="3" height="8"></rect>
</g>
<g id="wx-drops" fill="#9AA6B8">${stormDrops(ro)}</g>
<rect x="23" y="86" width="94" height="11" fill="#2E343E"></rect>
<rect x="28" y="78" width="16" height="8" fill="#2E343E"></rect><rect x="31" y="74" width="10" height="4" fill="#2E343E"></rect>
<rect x="86" y="76" width="18" height="10" fill="#2E343E"></rect><rect x="90" y="72" width="10" height="4" fill="#2E343E"></rect>
</g>` : ''}
${wx === 'nacht' ? `<g>
<g fill="#FFF4D8">
<rect x="30" y="14" width="1" height="1"></rect><rect x="46" y="22" width="1" height="1"></rect><rect x="62" y="12" width="1" height="1"></rect><rect x="76" y="28" width="1" height="1"></rect>
<rect x="40" y="36" width="1" height="1"></rect><rect x="110" y="34" width="1" height="1"></rect><rect x="58" y="44" width="1" height="1"></rect>
</g>
<rect x="94" y="15" width="8" height="8" fill="#F2EAD0"></rect>
<rect x="97" y="15" width="5" height="6" fill="#1C2236"></rect>
<g fill="#121829">
<rect x="26" y="70" width="14" height="27"></rect><rect x="42" y="76" width="10" height="21"></rect><rect x="56" y="64" width="12" height="33"></rect>
<rect x="72" y="74" width="16" height="23"></rect><rect x="92" y="68" width="12" height="29"></rect><rect x="106" y="78" width="11" height="19"></rect>
<rect x="23" y="90" width="94" height="7"></rect>
</g>
<g fill="#F2B866">
<rect x="29" y="74" width="1" height="1"></rect><rect x="34" y="80" width="1" height="1"></rect><rect x="59" y="68" width="1" height="1"></rect><rect x="63" y="76" width="1" height="1"></rect>
<rect x="95" y="72" width="1" height="1"></rect><rect x="99" y="80" width="1" height="1"></rect><rect x="76" y="78" width="1" height="1"></rect><rect x="46" y="82" width="1" height="1"></rect>
</g>
</g>` : ''}
<rect x="69" y="9" width="2" height="88" fill="#2A1A18"></rect>
<rect id="blind" x="23" y="9" width="94" height="${v.blindH}" fill="url(#wn-slat-${wx})"></rect>
<rect id="blind-rail" x="22" y="${v.railY}" width="96" height="2" fill="#B8783F"></rect>
<rect id="cord" x="115" y="9" width="1" height="${v.cordH}" fill="#B8783F"></rect>
<rect id="cord-handle" x="114" y="${v.cordY}" width="3" height="3" fill="#B8783F"></rect>
<rect x="16" y="100" width="108" height="3" fill="#8A4E30"></rect>
<rect x="20" y="100" width="100" height="1" fill="${v.sillLight}"></rect>
<rect x="18" y="103" width="104" height="2" fill="#5E3320"></rect>
</svg>
</div>`;
}
