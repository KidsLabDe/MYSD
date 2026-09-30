// @ts-nocheck
// AUTOMATISCH ERZEUGT aus design/Room_Front.dc.html durch tools/gen-sprites.mjs – nicht von Hand ändern.
class DCLogic { constructor(props) { this.props = props; } }
class Component extends DCLogic {
  renderVals() {
    const L = { sonnig: 0.22, bewoelkt: 0.09, regen: 0.04, schnee: 0.12, gewitter: 0.02, nacht: 0 };
    const w = L[this.props.weather] !== undefined ? L[this.props.weather] : L.sonnig;
    const b = Math.max(0, Math.min(100, this.props.blinds ?? 40));
    // NEU: Pflanzen einzeln ausblendbar (für die 3D-Drucker-Vorschläge). Default: alle sichtbar.
    return { light: String(b >= 100 ? w * 0.3 : w), stripes: b > 0, solid: b === 0, showTallPlant: this.props.tallPlant ?? true, showSmallPlant: this.props.smallPlant ?? true, showFern: this.props.fern ?? true, showCup: this.props.cup ?? true, saucerOnly: !(this.props.cup ?? true) };
  }
}
export const DEFAULTS = {"weather":"sonnig","blinds":40,"tallPlant":true,"smallPlant":true,"fern":true,"cup":true};
export function vals(props) { return new Component({ ...DEFAULTS, ...props }).renderVals(); }
export function html(props, over = {}) {
  const v = { ...vals(props), ...over };
  return `<div style="width: 1920px; height: 1080px; position: relative; overflow: hidden; font-family: monospace; color: #2A1A18">
<svg width="1920" height="1080" viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" style="display: block">
<defs>
<g id="rf-strap"><rect x="0" y="0" width="2" height="1"></rect><rect x="1" y="1" width="3" height="1"></rect><rect x="2" y="2" width="4" height="2"></rect><rect x="4" y="4" width="4" height="2"></rect><rect x="6" y="6" width="5" height="2"></rect><rect x="9" y="8" width="5" height="2"></rect></g>
<g id="rf-up"><rect x="1" y="0" width="1" height="2"></rect><rect x="1" y="2" width="2" height="3"></rect><rect x="0" y="5" width="3" height="5"></rect><rect x="1" y="10" width="2" height="4"></rect></g>
</defs>

${v.stripes ? `<g id="floor-light" fill="#FFD89A" opacity="${v.light}">
<rect x="84" y="164" width="60" height="2"></rect><rect x="90" y="167" width="60" height="2"></rect><rect x="96" y="170" width="60" height="2"></rect><rect x="102" y="173" width="60" height="2"></rect><rect x="108" y="176" width="60" height="2"></rect>
</g>
` : ''}
${v.solid ? `<g fill="#FFD89A" opacity="${v.light}">
<rect x="84" y="164" width="60" height="3"></rect><rect x="90" y="167" width="60" height="3"></rect><rect x="96" y="170" width="60" height="3"></rect><rect x="102" y="173" width="60" height="3"></rect><rect x="108" y="176" width="60" height="4"></rect>
</g>
` : ''}

${v.showSmallPlant ? `<g id="small-plant" transform="translate(-8 -24)">
<rect x="97" y="112" width="1" height="18" fill="#2F5530"></rect>
<rect x="94" y="118" width="1" height="12" fill="#2F5530"></rect>
<rect x="101" y="116" width="1" height="14" fill="#2F5530"></rect>
<rect x="95" y="106" width="3" height="6" fill="#78A04E"></rect><rect x="96" y="104" width="1" height="2" fill="#78A04E"></rect>
<rect x="91" y="113" width="3" height="5" fill="#4F7A3E"></rect><rect x="90" y="112" width="2" height="1" fill="#4F7A3E"></rect>
<rect x="102" y="111" width="3" height="5" fill="#78A04E"></rect><rect x="104" y="110" width="2" height="1" fill="#78A04E"></rect>
<rect x="98" y="116" width="2" height="3" fill="#4F7A3E"></rect>
<rect x="89" y="130" width="18" height="3" fill="#F2EEE6"></rect>
<rect x="90" y="133" width="16" height="11" fill="#D8D0C4"></rect>
<rect x="100" y="133" width="6" height="11" fill="#B8B0A4"></rect>
<rect x="93" y="137" width="4" height="1" fill="#9A9288"></rect>
</g>
` : ''}

<g id="desk">
<rect x="16" y="114" width="212" height="10" fill="#B8703F"></rect>
<rect x="16" y="114" width="212" height="1" fill="#8A4E30"></rect>
<rect x="16" y="118" width="212" height="1" fill="#A8663A"></rect>
<rect x="16" y="121" width="212" height="1" fill="#A8663A"></rect>
<rect x="70" y="115" width="1" height="3" fill="#A8663A"></rect><rect x="170" y="119" width="1" height="2" fill="#A8663A"></rect><rect x="120" y="122" width="1" height="2" fill="#A8663A"></rect>
</g>
${v.stripes ? `<g id="desk-light" fill="#FFD89A" opacity="${v.light}">
<rect x="20" y="115" width="96" height="2"></rect><rect x="23" y="118" width="96" height="2"></rect><rect x="26" y="121" width="96" height="2"></rect>
</g>
` : ''}
${v.solid ? `<g fill="#FFD89A" opacity="${v.light}">
<rect x="20" y="115" width="96" height="3"></rect><rect x="23" y="118" width="96" height="3"></rect><rect x="26" y="121" width="96" height="3"></rect>
</g>
` : ''}
<g id="desk-front">
<rect x="14" y="124" width="216" height="5" fill="#8A4E30"></rect>
<rect x="14" y="124" width="216" height="1" fill="#A8683E"></rect>
<rect x="14" y="129" width="216" height="1" fill="#5E3320"></rect>
<rect x="20" y="130" width="58" height="34" fill="#744024"></rect>
<rect x="20" y="130" width="2" height="34" fill="#8A4E30"></rect>
<rect x="23" y="133" width="52" height="13" fill="#8A4E30"></rect>
<rect x="23" y="133" width="52" height="1" fill="#A8683E"></rect>
<rect x="45" y="138" width="8" height="2" fill="#3A2320"></rect>
<rect x="23" y="149" width="52" height="12" fill="#8A4E30"></rect>
<rect x="23" y="149" width="52" height="1" fill="#A8683E"></rect>
<rect x="45" y="154" width="8" height="2" fill="#3A2320"></rect>
<rect x="212" y="130" width="10" height="34" fill="#744024"></rect>
<rect x="212" y="130" width="2" height="34" fill="#8A4E30"></rect>
<rect x="18" y="164" width="62" height="2" fill="#1A0F0D" opacity="0.5"></rect>
<rect x="210" y="164" width="14" height="2" fill="#1A0F0D" opacity="0.5"></rect>
</g>

<g id="desk-props">
${v.showCup ? `<g id="cup">
<rect x="104" y="119" width="22" height="2" fill="#E8E2D8"></rect>
<rect x="106" y="121" width="18" height="1" fill="#B8B0A4"></rect>
<rect x="108" y="111" width="13" height="8" fill="#F2EEE6"></rect>
<rect x="118" y="111" width="3" height="8" fill="#D8D0C4"></rect>
<rect x="109" y="111" width="11" height="1" fill="#5E3320"></rect>
<rect x="121" y="113" width="2" height="1" fill="#F2EEE6"></rect><rect x="122" y="114" width="1" height="2" fill="#F2EEE6"></rect><rect x="121" y="116" width="2" height="1" fill="#F2EEE6"></rect>
<rect x="111" y="107" width="1" height="2" fill="#FFF4D8" opacity="0.5"></rect><rect x="113" y="104" width="1" height="2" fill="#FFF4D8" opacity="0.4"></rect>
</g>
` : ''}
${v.saucerOnly ? `<g>
<rect x="104" y="119" width="22" height="2" fill="#E8E2D8"></rect>
<rect x="106" y="121" width="18" height="1" fill="#B8B0A4"></rect>
</g>
` : ''}
</g>

${v.showTallPlant ? `<g id="tall-plant" transform="translate(12 -35)">
<rect x="17" y="70" width="1" height="56" fill="#2F5530"></rect>
<rect x="13" y="86" width="1" height="40" fill="#2F5530"></rect>
<rect x="22" y="80" width="1" height="46" fill="#2F5530"></rect>
<use href="#rf-up" x="15" y="56" fill="#78A04E"></use>
<use href="#rf-up" x="20" y="66" fill="#4F7A3E"></use>
<use href="#rf-up" x="11" y="72" fill="#2F5530"></use>
<use href="#rf-strap" x="3" y="66" fill="#4F7A3E"></use>
<use href="#rf-strap" transform="translate(31 72) scale(-1 1)" fill="#78A04E"></use>
<use href="#rf-strap" x="-1" y="82" fill="#78A04E"></use>
<use href="#rf-strap" transform="translate(36 80) scale(-1 1)" fill="#4F7A3E"></use>
<use href="#rf-strap" x="-1" y="94" fill="#2F5530"></use>
<use href="#rf-strap" transform="translate(36 92) scale(-1 1)" fill="#78A04E"></use>
<use href="#rf-strap" x="-1" y="106" fill="#4F7A3E"></use>
<use href="#rf-strap" transform="translate(36 104) scale(-1 1)" fill="#2F5530"></use>
<rect x="3" y="126" width="30" height="3" fill="#F2EEE6"></rect>
<rect x="5" y="129" width="26" height="26" fill="#D8D0C4"></rect>
<rect x="22" y="129" width="9" height="26" fill="#B8B0A4"></rect>
<rect x="7" y="155" width="22" height="2" fill="#A8A096"></rect>
<g fill="#9A9288">
<rect x="9" y="134" width="3" height="1"></rect><rect x="8" y="135" width="1" height="2"></rect><rect x="9" y="137" width="3" height="1"></rect><rect x="12" y="136" width="1" height="1"></rect>
<rect x="16" y="140" width="3" height="1"></rect><rect x="15" y="141" width="1" height="2"></rect><rect x="16" y="143" width="3" height="1"></rect><rect x="19" y="142" width="1" height="1"></rect>
<rect x="9" y="146" width="3" height="1"></rect><rect x="8" y="147" width="1" height="2"></rect><rect x="9" y="149" width="3" height="1"></rect><rect x="12" y="148" width="1" height="1"></rect>
<rect x="24" y="135" width="3" height="1"></rect><rect x="24" y="146" width="3" height="1"></rect>
</g>
</g>
` : ''}



${v.showFern ? `<g id="fern" transform="translate(-10 -35)">
<g fill="#3F6B3E">
<rect x="214" y="96" width="20" height="3"></rect><rect x="210" y="99" width="28" height="4"></rect><rect x="206" y="103" width="36" height="5"></rect>
<rect x="204" y="108" width="42" height="6"></rect><rect x="204" y="114" width="44" height="8"></rect><rect x="206" y="122" width="40" height="8"></rect>
<rect x="202" y="110" width="4" height="2"></rect><rect x="248" y="112" width="4" height="2"></rect><rect x="200" y="118" width="5" height="2"></rect><rect x="248" y="120" width="4" height="2"></rect>
<rect x="212" y="93" width="3" height="3"></rect><rect x="234" y="94" width="3" height="3"></rect>
</g>
<g fill="#6E9A4E">
<rect x="210" y="104" width="4" height="1"></rect><rect x="214" y="106" width="4" height="1"></rect><rect x="226" y="104" width="4" height="1"></rect><rect x="232" y="108" width="5" height="1"></rect>
<rect x="208" y="112" width="5" height="1"></rect><rect x="220" y="112" width="4" height="1"></rect><rect x="238" y="114" width="5" height="1"></rect><rect x="212" y="118" width="4" height="1"></rect>
<rect x="228" y="118" width="5" height="1"></rect><rect x="242" y="120" width="4" height="1"></rect><rect x="216" y="124" width="4" height="1"></rect><rect x="234" y="124" width="4" height="1"></rect>
<rect x="203" y="110" width="2" height="1"></rect><rect x="249" y="112" width="2" height="1"></rect>
</g>
<g fill="#2F5530">
<rect x="218" y="100" width="2" height="2"></rect><rect x="236" y="104" width="2" height="2"></rect><rect x="206" y="116" width="2" height="2"></rect><rect x="224" y="116" width="2" height="2"></rect><rect x="244" y="116" width="2" height="2"></rect><rect x="210" y="126" width="2" height="2"></rect><rect x="240" y="126" width="2" height="2"></rect>
</g>
<g fill="#E0909E">
<rect x="216" y="98" width="2" height="2"></rect><rect x="220" y="96" width="2" height="2"></rect><rect x="226" y="99" width="2" height="2"></rect><rect x="230" y="97" width="2" height="2"></rect>
<rect x="223" y="102" width="2" height="2"></rect><rect x="234" y="101" width="2" height="2"></rect><rect x="218" y="104" width="2" height="2"></rect><rect x="212" y="101" width="2" height="2"></rect>
</g>
<g fill="#B8606E">
<rect x="222" y="98" width="1" height="1"></rect><rect x="228" y="101" width="1" height="1"></rect><rect x="215" y="102" width="1" height="1"></rect><rect x="232" y="99" width="1" height="1"></rect>
</g>
<rect x="210" y="128" width="32" height="3" fill="#CC6A48"></rect>
<rect x="212" y="131" width="28" height="24" fill="#B8583A"></rect>
<rect x="230" y="131" width="10" height="24" fill="#8E3F2A"></rect>
<rect x="212" y="131" width="3" height="24" fill="#D07048"></rect>
<rect x="214" y="155" width="24" height="2" fill="#7A3524"></rect>
</g>
` : ''}
</svg>
</div>`;
}
