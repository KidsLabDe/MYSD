// Quellen: design/Room_Back.dc.html und design/Room_Front.dc.html (SVG wörtlich)
import type { Weather } from '../types';
import { html as roomFrontGen } from '../generated/Room_Front';

/** Ebene 1 ohne Fenster und Poster. Poster in #poster-slot (972/30), Fenster in #window-slot (0/0). */
export const roomBackHtml = () => `<div style="width: 1920px; height: 1080px; position: relative; overflow: hidden; font-family: monospace; color: #2A1A18">
<svg width="1920" height="1080" viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" style="position: absolute; left: 0px; top: 0px; display: block">
<rect x="0" y="0" width="320" height="180" fill="#4A2E2B"></rect>
<rect x="312" y="0" width="8" height="180" fill="#3E2623"></rect>
<g id="floor">
<rect x="0" y="160" width="320" height="2" fill="#5E3320"></rect>
<rect x="0" y="162" width="320" height="18" fill="#33201C"></rect>
<rect x="0" y="168" width="320" height="1" fill="#26171A"></rect>
<rect x="0" y="174" width="320" height="1" fill="#26171A"></rect>
<rect x="36" y="162" width="1" height="6" fill="#26171A"></rect><rect x="140" y="162" width="1" height="6" fill="#26171A"></rect><rect x="250" y="162" width="1" height="6" fill="#26171A"></rect>
<rect x="88" y="169" width="1" height="5" fill="#26171A"></rect><rect x="196" y="169" width="1" height="5" fill="#26171A"></rect><rect x="296" y="169" width="1" height="5" fill="#26171A"></rect>
<rect x="24" y="175" width="1" height="5" fill="#26171A"></rect><rect x="170" y="175" width="1" height="5" fill="#26171A"></rect>
</g>
<!-- Holzbank unter dem Kalender (design/Room_Back.dc.html #bench): Sitzfläche y 143, Figur darauf top 45 -->
<g id="bench">
<rect x="210" y="161" width="104" height="2" fill="#1A0F0D" opacity="0.5"></rect>
<rect x="212" y="143" width="100" height="3" fill="#A8663A"></rect>
<rect x="212" y="143" width="100" height="1" fill="#B8703F"></rect>
<rect x="213" y="146" width="98" height="1" fill="#5E3320"></rect>
<rect x="214" y="147" width="96" height="12" fill="#8A4E30"></rect>
<rect x="214" y="147" width="96" height="1" fill="#A8683E"></rect>
<rect x="214" y="147" width="2" height="12" fill="#A8683E"></rect>
<rect x="220" y="150" width="40" height="7" fill="#744024"></rect>
<rect x="266" y="150" width="40" height="7" fill="#744024"></rect>
<rect x="238" y="152" width="4" height="2" fill="#3A2320"></rect>
<rect x="284" y="152" width="4" height="2" fill="#3A2320"></rect>
<rect x="214" y="159" width="96" height="1" fill="#5E3320"></rect>
<rect x="215" y="160" width="5" height="1" fill="#744024"></rect>
<rect x="304" y="160" width="5" height="1" fill="#744024"></rect>
</g>
<g fill="#452A27">
<rect x="150" y="10" width="2" height="1"></rect><rect x="176" y="30" width="2" height="1"></rect><rect x="160" y="70" width="2" height="1"></rect><rect x="232" y="18" width="2" height="1"></rect><rect x="198" y="88" width="2" height="1"></rect><rect x="226" y="60" width="2" height="1"></rect>
</g>
<rect x="0" y="10" width="14" height="20" fill="#2A1A18"></rect>
<rect x="1" y="11" width="12" height="18" fill="#3E7C7A"></rect>
<rect x="4" y="17" width="6" height="6" fill="#EDE0C8"></rect>
<rect x="0" y="36" width="12" height="16" fill="#2A1A18"></rect>
<rect x="1" y="37" width="10" height="14" fill="#C4493A"></rect>
<rect x="3" y="44" width="6" height="5" fill="#E0A94A"></rect>
<rect x="127" y="0" width="1" height="54" fill="#2F5530"></rect>
<rect x="132" y="0" width="1" height="38" fill="#2F5530"></rect>
<rect x="137" y="0" width="1" height="26" fill="#2F5530"></rect>
<g fill="#78A04E">
<rect x="126" y="0" width="2" height="2"></rect><rect x="126" y="6" width="2" height="2"></rect><rect x="127" y="12" width="2" height="2"></rect><rect x="127" y="18" width="2" height="2"></rect><rect x="126" y="27" width="2" height="2"></rect><rect x="126" y="36" width="2" height="2"></rect><rect x="128" y="42" width="2" height="2"></rect><rect x="126" y="48" width="2" height="2"></rect>
<rect x="131" y="3" width="2" height="2"></rect><rect x="132" y="12" width="2" height="2"></rect><rect x="131" y="21" width="2" height="2"></rect><rect x="133" y="30" width="2" height="2"></rect>
<rect x="136" y="6" width="2" height="2"></rect><rect x="137" y="18" width="2" height="2"></rect>
</g>
<g fill="#4F7A3E">
<rect x="127" y="3" width="2" height="2"></rect><rect x="128" y="9" width="2" height="2"></rect><rect x="126" y="15" width="2" height="2"></rect><rect x="128" y="21" width="2" height="2"></rect><rect x="127" y="24" width="2" height="2"></rect><rect x="128" y="30" width="2" height="2"></rect><rect x="127" y="33" width="2" height="2"></rect><rect x="127" y="39" width="2" height="2"></rect><rect x="127" y="45" width="2" height="2"></rect><rect x="127" y="51" width="2" height="2"></rect>
<rect x="132" y="6" width="2" height="2"></rect><rect x="131" y="9" width="2" height="2"></rect><rect x="133" y="15" width="2" height="2"></rect><rect x="132" y="18" width="2" height="2"></rect><rect x="131" y="24" width="2" height="2"></rect><rect x="132" y="27" width="2" height="2"></rect><rect x="132" y="33" width="2" height="2"></rect><rect x="131" y="36" width="2" height="2"></rect>
<rect x="137" y="0" width="2" height="2"></rect><rect x="136" y="3" width="2" height="2"></rect><rect x="138" y="9" width="2" height="2"></rect><rect x="136" y="12" width="2" height="2"></rect><rect x="137" y="15" width="2" height="2"></rect><rect x="136" y="21" width="2" height="2"></rect><rect x="137" y="24" width="2" height="2"></rect>
</g>
</svg>
<!-- Poster VOR dem Fenster im DOM: die Lichtstreifen des Fensters fallen darüber -->
<div id="poster-slot" style="position: absolute; left: 972px; top: 30px"></div>
<div id="window-slot" style="position: absolute; left: 0px; top: 0px"></div>
</div>`;

/** Ebene 4 (design/Room_Front.dc.html, erzeugt): kleine Pflanze aus (Drucker steht dort), Tasse per cup. */
export function roomFrontHtml(weather: Weather, blinds: number, o: { cup?: boolean; smallPlant?: boolean } = {}): string {
  return roomFrontGen({ weather, blinds, cup: o.cup ?? true, smallPlant: o.smallPlant ?? false, tallPlant: true, fern: true });
}
