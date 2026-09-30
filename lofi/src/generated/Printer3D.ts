// @ts-nocheck
// AUTOMATISCH ERZEUGT aus design/Printer3D.dc.html durch tools/gen-sprites.mjs – nicht von Hand ändern.
class DCLogic { constructor(props) { this.props = props; } }
class Component extends DCLogic {
  renderVals() {
    const v = this.props.variant === 'box' ? 'box' : 'open';
    // Variante box: wie bisher (nur printing an/aus)
    const printingBox = this.props.printing ?? true;
    // Variante open: state printing | done | empty, layer 0–8 = gedruckte Pixelzeilen, headX = Druckkopf-Versatz
    const state = ['printing', 'done', 'empty'].indexOf(this.props.state) >= 0 ? this.props.state : 'printing';
    const H = { bulb: 8, cube: 6, rocket: 8, heart: 6 };
    const obj = H[this.props.obj] ? this.props.obj : 'bulb';
    const layer = state === 'done' ? 8 : Math.max(0, Math.min(8, this.props.layer ?? 5));
    const parked = state !== 'printing';
    const gy = parked ? 14 : 31 - layer;
    const hx = parked ? 8 : Math.max(-4, Math.min(4, this.props.headX ?? 0));
    const clipH = Math.max(1, layer);
    const led = v === 'box' ? (printingBox ? '#7BD389' : '#5E5A54') : (state === 'printing' ? '#7BD389' : state === 'done' ? '#F2B866' : '#5E5A54');
    return {
      isBox: v === 'box', isOpen: v === 'open', printing: printingBox, led: led,
      hasObj: state !== 'empty' && layer > 0,
      clipY: 38 - clipH, clipH: clipH,
      objCube: obj === 'cube', objBulb: obj === 'bulb', objRocket: obj === 'rocket', objHeart: obj === 'heart',
      gy: gy, hx: hx, carY: gy - 4, fanY: gy - 2, nozY: gy + 5, glowY: gy + 7, glow: state === 'printing'
    };
  }
}
export const DEFAULTS = {"variant":"open","state":"printing","layer":5,"headX":0,"obj":"bulb","printing":true};
export function vals(props) { return new Component({ ...DEFAULTS, ...props }).renderVals(); }
export function html(props, over = {}) {
  const v = { ...vals(props), ...over };
  return `<div style="width: 276px; height: 276px; position: relative; overflow: visible; font-family: monospace; color: #2A1A18">
<svg width="276" height="276" viewBox="0 0 46 46" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" style="display: block; overflow: visible">
${v.isBox ? `<g transform="translate(0 4)">
<rect x="1" y="39" width="32" height="1" fill="#1A0F0D" opacity="0.45"></rect>
<rect x="10" y="0" width="12" height="4" fill="#3E7C7A"></rect>
<rect x="10" y="0" width="1" height="4" fill="#2F2A26"></rect>
<rect x="21" y="0" width="1" height="4" fill="#2F2A26"></rect>
<rect x="14" y="1" width="4" height="2" fill="#2F2A26"></rect>
<rect x="0" y="4" width="32" height="36" fill="#2F2A26"></rect>
<rect x="0" y="4" width="32" height="2" fill="#3E3833"></rect>
<rect x="0" y="4" width="1" height="36" fill="#3E3833"></rect>
<rect x="3" y="8" width="26" height="25" fill="#1E2436"></rect>
${v.printing ? `<g>
<rect x="4" y="9" width="24" height="23" fill="#3A3E4C"></rect>
<rect x="4" y="9" width="24" height="1" fill="#F2E6C8"></rect>
</g>
` : ''}
<rect x="4" y="15" width="24" height="2" fill="#3E3833"></rect>
<rect x="11" y="13" width="10" height="5" fill="#D8CBB0"></rect>
<rect x="11" y="13" width="10" height="1" fill="#EDE0C8"></rect>
<rect x="15" y="18" width="2" height="2" fill="#2A1A18"></rect>
${v.printing ? `<rect x="15" y="20" width="2" height="1" fill="#F2B866"></rect>
` : ''}
<rect x="13" y="22" width="6" height="7" fill="#E0A94A"></rect>
<rect x="13" y="24" width="6" height="1" fill="#C4893A"></rect>
<rect x="13" y="27" width="6" height="1" fill="#C4893A"></rect>
<rect x="5" y="29" width="22" height="2" fill="#B9AA8C"></rect>
<rect x="22" y="10" width="2" height="1" fill="#EDE0C8" opacity="0.35"></rect>
<rect x="23" y="11" width="2" height="1" fill="#EDE0C8" opacity="0.35"></rect>
<rect x="24" y="12" width="2" height="1" fill="#EDE0C8" opacity="0.35"></rect>
<rect x="0" y="34" width="32" height="6" fill="#3E3833"></rect>
<rect x="3" y="35" width="9" height="3" fill="#1E2E26"></rect>
<rect x="4" y="36" width="6" height="1" fill="#7FA58A"></rect>
<rect x="27" y="36" width="2" height="2" fill="${v.led}"></rect>
</g>
` : ''}
${v.isOpen ? `<g>
<rect x="1" y="45" width="44" height="1" fill="#1A0F0D" opacity="0.45"></rect>
<rect x="16" y="0" width="12" height="5" fill="#C4493A"></rect>
<rect x="16" y="0" width="1" height="5" fill="#2F2A26"></rect>
<rect x="27" y="0" width="1" height="5" fill="#2F2A26"></rect>
<rect x="20" y="1" width="4" height="3" fill="#2F2A26"></rect>
<rect x="21" y="5" width="2" height="1" fill="#2F2A26"></rect>
<rect x="4" y="6" width="38" height="4" fill="#2F2A26"></rect>
<rect x="4" y="6" width="38" height="1" fill="#3E3833"></rect>
<rect x="4" y="6" width="5" height="36" fill="#2F2A26"></rect>
<rect x="37" y="6" width="5" height="36" fill="#2F2A26"></rect>
<rect x="4" y="6" width="1" height="36" fill="#3E3833"></rect>
<rect x="11" y="10" width="1" height="30" fill="#B9AA8C"></rect>
<rect x="34" y="10" width="1" height="30" fill="#B9AA8C"></rect>
<rect x="8" y="38" width="30" height="2" fill="#B9AA8C"></rect>
<rect x="10" y="40" width="26" height="2" fill="#3E3833"></rect>
<rect x="2" y="42" width="42" height="2" fill="#2F2A26"></rect>
<rect x="0" y="44" width="46" height="1" fill="#3E3833"></rect>
${v.hasObj ? `<svg x="8" y="${v.clipY}" width="30" height="${v.clipH}" viewBox="8 ${v.clipY} 30 ${v.clipH}" overflow="hidden">
${v.objCube ? `<g><rect x="19" y="32" width="6" height="6" fill="#3E7C7A"></rect><rect x="19" y="34" width="6" height="1" fill="#2C5C5A"></rect><rect x="19" y="32" width="6" height="1" fill="#4A8C89"></rect></g>
` : ''}
${v.objBulb ? `<g><rect x="20" y="30" width="5" height="1" fill="#FCE680"></rect><rect x="19" y="31" width="7" height="3" fill="#FCE680"></rect><rect x="20" y="34" width="5" height="1" fill="#FCE680"></rect><rect x="22" y="32" width="1" height="1" fill="#F07A7A"></rect><rect x="21" y="35" width="3" height="1" fill="#F0A31B"></rect><rect x="21" y="36" width="3" height="1" fill="#F07A7A"></rect><rect x="21" y="37" width="3" height="1" fill="#4CC8F0"></rect></g>
` : ''}
${v.objRocket ? `<g><rect x="22" y="30" width="1" height="1" fill="#C4493A"></rect><rect x="21" y="31" width="3" height="1" fill="#C4493A"></rect><rect x="21" y="32" width="3" height="4" fill="#EDE0C8"></rect><rect x="22" y="33" width="1" height="1" fill="#4CC8F0"></rect><rect x="20" y="35" width="1" height="3" fill="#C4493A"></rect><rect x="24" y="35" width="1" height="3" fill="#C4493A"></rect><rect x="21" y="36" width="3" height="2" fill="#2F2A26"></rect></g>
` : ''}
${v.objHeart ? `<g><rect x="19" y="32" width="2" height="1" fill="#F07A7A"></rect><rect x="23" y="32" width="2" height="1" fill="#F07A7A"></rect><rect x="18" y="33" width="8" height="2" fill="#F07A7A"></rect><rect x="19" y="35" width="6" height="1" fill="#F07A7A"></rect><rect x="20" y="36" width="4" height="1" fill="#F07A7A"></rect><rect x="21" y="37" width="2" height="1" fill="#F07A7A"></rect><rect x="19" y="33" width="1" height="1" fill="#FCE680"></rect></g>
` : ''}
</svg>
` : ''}
<rect x="9" y="${v.gy}" width="28" height="2" fill="#B9AA8C"></rect>
<g transform="translate(${v.hx} 0)">
<rect x="18" y="${v.carY}" width="8" height="9" fill="#2F2A26"></rect>
<rect x="19" y="${v.fanY}" width="5" height="4" fill="#E0A94A"></rect>
<rect x="21" y="${v.nozY}" width="2" height="2" fill="#2A1A18"></rect>
${v.glow ? `<rect x="21" y="${v.glowY}" width="2" height="1" fill="#F2B866"></rect>
` : ''}
</g>
<rect x="0" y="24" width="6" height="8" fill="#3E3833"></rect>
<rect x="1" y="26" width="4" height="3" fill="#1E2E26"></rect>
<rect x="2" y="27" width="2" height="1" fill="#7FA58A"></rect>
<rect x="2" y="30" width="2" height="1" fill="${v.led}"></rect>
</g>
` : ''}
</svg>
</div>`;
}
