// @ts-nocheck
// AUTOMATISCH ERZEUGT aus design/Kollege.dc.html durch tools/gen-sprites.mjs – nicht von Hand ändern.
class DCLogic { constructor(props) { this.props = props; } }
class Component extends DCLogic {
  renderVals() {
    const view = ['front', 'back', 'right', 'left'].indexOf(this.props.view) >= 0 ? this.props.view : 'front';
    const pose = this.props.pose ?? 'stand';
    const side = view === 'right' || view === 'left';
    const sidePose = (pose === 'walkA' || pose === 'walkB') ? pose : 'stand';
    const fp = view === 'front' ? pose : 'stand';
    const ARMS = { stand: ['down', 'down'], walkA: ['down', 'down'], walkB: ['down', 'down'], waveA: ['waveA', 'down'], waveB: ['waveB', 'down'], talk: ['explain', 'mic'], point: ['down', 'point'], pointUp: ['explain', 'up'], open: ['open', 'open'], think: ['think', 'down'], clicker: ['down', 'clicker'], clap: ['clap', 'clap'] };
    const a = ARMS[fp] || ARMS.stand;
    const L = a[0], R = a[1];
    let face = this.props.face ?? 'auto';
    if (face === 'auto') face = ['talk', 'point', 'pointUp', 'open', 'clicker'].indexOf(fp) >= 0 ? 'talk' : (fp === 'think' ? 'neutral' : 'smile');
    return {
      viewFront: view === 'front', viewBack: view === 'back', viewSide: side,
      sideFlip: view === 'left' ? 'translate(44 0) scale(-1 1)' : 'translate(0 0)',
      sideBody: sidePose === 'walkB' ? 'translate(0 -1)' : 'translate(0 0)',
      sideStand: sidePose === 'stand', sideA: sidePose === 'walkA', sideB: sidePose === 'walkB',
      sideArmBack: sidePose === 'walkA', sideArmDown: sidePose !== 'walkA',
      leftArmDown: L === 'down', leftArmExplain: L === 'explain', waveA: L === 'waveA', waveB: L === 'waveB',
      leftArmOpen: L === 'open', leftArmThink: L === 'think', leftArmClap: L === 'clap',
      rightArmDown: R === 'down', rightArmMic: R === 'mic', rightArmPoint: R === 'point', rightArmUp: R === 'up',
      rightArmOpen: R === 'open', rightArmClicker: R === 'clicker', rightArmClap: R === 'clap',
      eyesOpen: face !== 'blink', eyesClosed: face === 'blink',
      mouthSmile: face === 'smile' || face === 'blink', mouthTalk: face === 'talk', mouthFlat: face === 'neutral'
    };
  }
}
export const DEFAULTS = {"view":"front","pose":"stand","face":"auto"};
export function vals(props) { return new Component({ ...DEFAULTS, ...props }).renderVals(); }
export function html(props, over = {}) {
  const v = { ...vals(props), ...over };
  return `<div style="width: 264px; height: 600px; position: relative; overflow: visible; font-family: monospace; color: #2A1A18">
<svg width="264" height="600" viewBox="0 0 44 100" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" style="display: block; overflow: visible">
<rect x="6" y="98" width="32" height="2" fill="#1A0F0D" opacity="0.35"></rect>

${v.viewFront ? `<g>
<rect x="12" y="62" width="8" height="31" fill="#2A2D2A"></rect>
<rect x="24" y="62" width="8" height="31" fill="#2A2D2A"></rect>
<rect x="30" y="62" width="2" height="31" fill="#23261F"></rect>
<rect x="10" y="93" width="11" height="4" fill="#5E3320"></rect><rect x="10" y="93" width="11" height="1" fill="#8A4E30"></rect>
<rect x="23" y="93" width="11" height="4" fill="#5E3320"></rect><rect x="23" y="93" width="11" height="1" fill="#8A4E30"></rect>
<rect x="10" y="97" width="11" height="1" fill="#3A2320"></rect><rect x="23" y="97" width="11" height="1" fill="#3A2320"></rect>
<rect x="8" y="27" width="28" height="36" fill="#1E2A3E"></rect>
<rect x="8" y="27" width="3" height="36" fill="#2A3A52"></rect>
<rect x="33" y="27" width="3" height="36" fill="#16202F"></rect>
<rect x="11" y="25" width="22" height="2" fill="#1E2A3E"></rect>
<rect x="18" y="25" width="8" height="34" fill="#F2EEE6"></rect>
<rect x="25" y="27" width="1" height="32" fill="#D8D0C4"></rect>
<rect x="18" y="57" width="8" height="1" fill="#D8D0C4"></rect>
<rect x="18" y="59" width="8" height="2" fill="#3A2320"></rect><rect x="21" y="59" width="2" height="2" fill="#B9AA8C"></rect>
<rect x="18" y="61" width="8" height="2" fill="#2A2D2A"></rect><rect x="22" y="61" width="1" height="2" fill="#23261F"></rect>
<rect x="15" y="23" width="5" height="5" fill="#F2EEE6"></rect><rect x="24" y="23" width="5" height="5" fill="#F2EEE6"></rect>
<rect x="20" y="24" width="4" height="3" fill="#C98A68"></rect>
<rect x="14" y="27" width="4" height="15" fill="#16202F"></rect><rect x="26" y="27" width="4" height="15" fill="#16202F"></rect>
<rect x="16" y="42" width="2" height="4" fill="#16202F"></rect><rect x="26" y="42" width="2" height="4" fill="#16202F"></rect>
<rect x="22" y="34" width="1" height="1" fill="#B9AA8C"></rect><rect x="22" y="42" width="1" height="1" fill="#B9AA8C"></rect><rect x="22" y="50" width="1" height="1" fill="#B9AA8C"></rect>
<rect x="27" y="31" width="2" height="2" fill="#E0A94A"></rect><rect x="28" y="31" width="1" height="1" fill="#C4493A"></rect><rect x="27" y="32" width="1" height="1" fill="#4CC8F0"></rect>
<rect x="18" y="52" width="1" height="1" fill="#16202F"></rect><rect x="18" y="56" width="1" height="1" fill="#16202F"></rect>
<rect x="19" y="20" width="6" height="4" fill="#C98A68"></rect>
<rect x="11" y="10" width="2" height="6" fill="#DDA27E"></rect><rect x="31" y="10" width="2" height="6" fill="#DDA27E"></rect>
<rect x="15" y="1" width="14" height="1" fill="#E4AE8A"></rect>
<rect x="13" y="2" width="18" height="12" fill="#E4AE8A"></rect>
<rect x="14" y="14" width="16" height="6" fill="#DDA27E"></rect>
<rect x="15" y="20" width="14" height="1" fill="#C98A68"></rect>
<rect x="17" y="3" width="6" height="2" fill="#F4CBAA"></rect><rect x="18" y="5" width="3" height="1" fill="#F4CBAA"></rect>
<rect x="13" y="7" width="1" height="6" fill="#C98A68"></rect><rect x="30" y="7" width="1" height="6" fill="#C98A68"></rect>
<rect x="14" y="15" width="3" height="5" fill="#B88468"></rect><rect x="27" y="15" width="3" height="5" fill="#B88468"></rect>
<rect x="16" y="18" width="12" height="3" fill="#B88468"></rect>
<rect x="18" y="16" width="8" height="1" fill="#B88468"></rect>
<rect x="15" y="17" width="1" height="1" fill="#9A6A52"></rect><rect x="28" y="16" width="1" height="1" fill="#9A6A52"></rect><rect x="20" y="20" width="1" height="1" fill="#9A6A52"></rect><rect x="24" y="19" width="1" height="1" fill="#9A6A52"></rect>
<rect x="16" y="7" width="4" height="1" fill="#A8836A"></rect><rect x="24" y="7" width="4" height="1" fill="#A8836A"></rect>
<g fill="#A8997A">
<rect x="16" y="8" width="5" height="1"></rect><rect x="15" y="9" width="1" height="4"></rect><rect x="21" y="9" width="1" height="4"></rect><rect x="16" y="13" width="5" height="1"></rect>
<rect x="23" y="8" width="5" height="1"></rect><rect x="22" y="9" width="1" height="4"></rect><rect x="28" y="9" width="1" height="4"></rect><rect x="23" y="13" width="5" height="1"></rect>
<rect x="21" y="10" width="1" height="1"></rect><rect x="13" y="9" width="2" height="1"></rect><rect x="29" y="9" width="2" height="1"></rect>
</g>
<rect x="16" y="9" width="5" height="4" fill="#EDE0C8" opacity="0.28"></rect><rect x="23" y="9" width="5" height="4" fill="#EDE0C8" opacity="0.28"></rect>
${v.eyesOpen ? `<g><rect x="17" y="10" width="2" height="2" fill="#2A1A18"></rect><rect x="25" y="10" width="2" height="2" fill="#2A1A18"></rect><rect x="17" y="10" width="1" height="1" fill="#EDE0C8"></rect><rect x="25" y="10" width="1" height="1" fill="#EDE0C8"></rect></g>
` : ''}
${v.eyesClosed ? `<g><rect x="17" y="11" width="3" height="1" fill="#2A1A18"></rect><rect x="24" y="11" width="3" height="1" fill="#2A1A18"></rect></g>
` : ''}
<rect x="21" y="12" width="2" height="3" fill="#D08E6C"></rect>
${v.mouthSmile ? `<g><rect x="19" y="17" width="1" height="1" fill="#6E3A28"></rect><rect x="20" y="18" width="4" height="1" fill="#6E3A28"></rect><rect x="24" y="17" width="1" height="1" fill="#6E3A28"></rect></g>
` : ''}
${v.mouthFlat ? `<g><rect x="20" y="18" width="4" height="1" fill="#6E3A28"></rect></g>
` : ''}
${v.mouthTalk ? `<g><rect x="20" y="17" width="4" height="2" fill="#5E3320"></rect><rect x="20" y="17" width="4" height="1" fill="#EDE0C8"></rect></g>
` : ''}
${v.rightArmDown ? `<g><rect x="35" y="30" width="6" height="24" fill="#1E2A3E"></rect><rect x="39" y="30" width="2" height="24" fill="#16202F"></rect><rect x="35" y="54" width="6" height="2" fill="#F2EEE6"></rect><rect x="35" y="56" width="6" height="1" fill="#D8D04A"></rect><rect x="35" y="57" width="6" height="5" fill="#DDA27E"></rect></g>
` : ''}
${v.rightArmMic ? `<g><rect x="35" y="30" width="6" height="10" fill="#1E2A3E"></rect><rect x="30" y="36" width="8" height="6" fill="#1E2A3E"></rect><rect x="28" y="36" width="2" height="6" fill="#F2EEE6"></rect><rect x="28" y="35" width="2" height="1" fill="#D8D04A"></rect>
<rect x="24" y="30" width="4" height="6" fill="#DDA27E"></rect>
<rect x="25" y="21" width="2" height="10" fill="#2A2D2A"></rect><rect x="24" y="18" width="4" height="4" fill="#3E3833"></rect><rect x="24" y="18" width="4" height="1" fill="#5E5A54"></rect><rect x="25" y="26" width="2" height="1" fill="#EDE0C8"></rect></g>
` : ''}
${v.leftArmDown ? `<g><rect x="3" y="30" width="6" height="24" fill="#1E2A3E"></rect><rect x="3" y="30" width="2" height="24" fill="#2A3A52"></rect><rect x="3" y="54" width="6" height="2" fill="#F2EEE6"></rect><rect x="3" y="56" width="6" height="6" fill="#DDA27E"></rect></g>
` : ''}
${v.leftArmExplain ? `<g><rect x="3" y="30" width="6" height="12" fill="#1E2A3E"></rect><rect x="3" y="30" width="2" height="12" fill="#2A3A52"></rect><rect x="5" y="40" width="10" height="5" fill="#1E2A3E"></rect><rect x="15" y="40" width="2" height="5" fill="#F2EEE6"></rect><rect x="17" y="40" width="5" height="5" fill="#DDA27E"></rect><rect x="18" y="44" width="2" height="1" fill="#E0A94A"></rect></g>
` : ''}
${v.waveA ? `<g><rect x="3" y="24" width="6" height="8" fill="#1E2A3E"></rect><rect x="1" y="16" width="6" height="8" fill="#1E2A3E"></rect><rect x="0" y="10" width="6" height="6" fill="#1E2A3E"></rect><rect x="0" y="8" width="6" height="2" fill="#F2EEE6"></rect><rect x="0" y="2" width="6" height="6" fill="#DDA27E"></rect><rect x="0" y="0" width="1" height="2" fill="#DDA27E"></rect><rect x="2" y="0" width="1" height="2" fill="#DDA27E"></rect><rect x="4" y="0" width="1" height="2" fill="#DDA27E"></rect><rect x="6" y="4" width="1" height="2" fill="#DDA27E"></rect></g>
` : ''}
${v.waveB ? `<g><rect x="3" y="24" width="6" height="8" fill="#1E2A3E"></rect><rect x="0" y="17" width="6" height="7" fill="#1E2A3E"></rect><rect x="-2" y="12" width="6" height="5" fill="#1E2A3E"></rect><rect x="-3" y="10" width="6" height="2" fill="#F2EEE6"></rect><rect x="-4" y="4" width="6" height="6" fill="#DDA27E"></rect><rect x="-5" y="2" width="1" height="2" fill="#DDA27E"></rect><rect x="-3" y="2" width="1" height="2" fill="#DDA27E"></rect><rect x="-1" y="2" width="1" height="2" fill="#DDA27E"></rect><rect x="2" y="6" width="1" height="2" fill="#DDA27E"></rect></g>
` : ''}
${v.rightArmPoint ? `<g><rect x="35" y="30" width="6" height="6" fill="#1E2A3E"></rect><rect x="35" y="35" width="6" height="1" fill="#16202F"></rect><rect x="41" y="31" width="6" height="5" fill="#1E2A3E"></rect><rect x="41" y="35" width="6" height="1" fill="#16202F"></rect><rect x="47" y="31" width="2" height="5" fill="#F2EEE6"></rect><rect x="49" y="31" width="1" height="5" fill="#D8D04A"></rect><rect x="50" y="32" width="4" height="4" fill="#DDA27E"></rect><rect x="54" y="32" width="3" height="1" fill="#DDA27E"></rect><rect x="51" y="31" width="2" height="1" fill="#DDA27E"></rect></g>
` : ''}
${v.rightArmUp ? `<g><rect x="35" y="26" width="6" height="8" fill="#1E2A3E"></rect><rect x="38" y="18" width="6" height="8" fill="#1E2A3E"></rect><rect x="42" y="18" width="2" height="8" fill="#16202F"></rect><rect x="40" y="10" width="6" height="8" fill="#1E2A3E"></rect><rect x="40" y="8" width="6" height="2" fill="#F2EEE6"></rect><rect x="40" y="7" width="6" height="1" fill="#D8D04A"></rect><rect x="41" y="2" width="5" height="5" fill="#DDA27E"></rect><rect x="42" y="-2" width="1" height="4" fill="#DDA27E"></rect></g>
` : ''}
${v.rightArmOpen ? `<g><rect x="35" y="30" width="6" height="10" fill="#1E2A3E"></rect><rect x="39" y="30" width="2" height="10" fill="#16202F"></rect><rect x="37" y="38" width="6" height="6" fill="#1E2A3E"></rect><rect x="40" y="43" width="6" height="5" fill="#1E2A3E"></rect><rect x="41" y="48" width="6" height="2" fill="#F2EEE6"></rect><rect x="41" y="50" width="6" height="1" fill="#D8D04A"></rect><rect x="42" y="51" width="6" height="2" fill="#DDA27E"></rect><rect x="42" y="51" width="6" height="1" fill="#E4AE8A"></rect><rect x="48" y="50" width="1" height="2" fill="#DDA27E"></rect></g>
` : ''}
${v.rightArmClicker ? `<g><rect x="35" y="30" width="6" height="12" fill="#1E2A3E"></rect><rect x="39" y="30" width="2" height="12" fill="#16202F"></rect><rect x="31" y="40" width="9" height="5" fill="#1E2A3E"></rect><rect x="31" y="44" width="9" height="1" fill="#16202F"></rect><rect x="30" y="40" width="1" height="5" fill="#D8D04A"></rect><rect x="28" y="40" width="2" height="5" fill="#F2EEE6"></rect><rect x="23" y="40" width="5" height="5" fill="#DDA27E"></rect><rect x="22" y="38" width="4" height="3" fill="#2A2D2A"></rect><rect x="23" y="38" width="1" height="1" fill="#C4493A"></rect><rect x="22" y="41" width="1" height="1" fill="#2A2D2A"></rect></g>
` : ''}
${v.rightArmClap ? `<g><rect x="35" y="30" width="6" height="10" fill="#1E2A3E"></rect><rect x="39" y="30" width="2" height="10" fill="#16202F"></rect><rect x="29" y="38" width="10" height="5" fill="#1E2A3E"></rect><rect x="29" y="42" width="10" height="1" fill="#16202F"></rect><rect x="28" y="38" width="1" height="5" fill="#D8D04A"></rect><rect x="26" y="38" width="2" height="5" fill="#F2EEE6"></rect><rect x="22" y="37" width="4" height="6" fill="#DDA27E"></rect></g>
` : ''}
${v.leftArmOpen ? `<g><rect x="3" y="30" width="6" height="10" fill="#1E2A3E"></rect><rect x="3" y="30" width="2" height="10" fill="#2A3A52"></rect><rect x="1" y="38" width="6" height="6" fill="#1E2A3E"></rect><rect x="-2" y="43" width="6" height="5" fill="#1E2A3E"></rect><rect x="-3" y="48" width="6" height="2" fill="#F2EEE6"></rect><rect x="-4" y="50" width="6" height="2" fill="#DDA27E"></rect><rect x="-4" y="50" width="6" height="1" fill="#E4AE8A"></rect><rect x="-5" y="49" width="1" height="2" fill="#DDA27E"></rect></g>
` : ''}
${v.leftArmThink ? `<g><rect x="3" y="30" width="6" height="14" fill="#1E2A3E"></rect><rect x="3" y="30" width="2" height="14" fill="#2A3A52"></rect><rect x="5" y="40" width="16" height="5" fill="#1E2A3E"></rect><rect x="5" y="44" width="16" height="1" fill="#16202F"></rect><rect x="16" y="25" width="6" height="20" fill="#1E2A3E"></rect><rect x="16" y="25" width="1" height="15" fill="#2A3A52"></rect><rect x="21" y="25" width="1" height="20" fill="#16202F"></rect><rect x="16" y="23" width="6" height="2" fill="#F2EEE6"></rect><rect x="16" y="19" width="7" height="4" fill="#E4AE8A"></rect><rect x="16" y="22" width="7" height="1" fill="#C98A68"></rect><rect x="17" y="21" width="4" height="1" fill="#DDA27E"></rect><rect x="16" y="16" width="2" height="3" fill="#E4AE8A"></rect><rect x="18" y="17" width="1" height="2" fill="#C98A68"></rect></g>
` : ''}
${v.leftArmClap ? `<g><rect x="3" y="30" width="6" height="10" fill="#1E2A3E"></rect><rect x="3" y="30" width="2" height="10" fill="#2A3A52"></rect><rect x="5" y="38" width="11" height="5" fill="#1E2A3E"></rect><rect x="5" y="42" width="11" height="1" fill="#16202F"></rect><rect x="16" y="38" width="2" height="5" fill="#F2EEE6"></rect><rect x="18" y="37" width="4" height="6" fill="#DDA27E"></rect><rect x="21" y="37" width="1" height="6" fill="#C98A68"></rect></g>
` : ''}
</g>
` : ''}

${v.viewBack ? `<g>
<rect x="12" y="62" width="8" height="31" fill="#2A2D2A"></rect><rect x="24" y="62" width="8" height="31" fill="#23261F"></rect>
<rect x="10" y="93" width="11" height="4" fill="#5E3320"></rect><rect x="23" y="93" width="11" height="4" fill="#5E3320"></rect>
<rect x="10" y="97" width="11" height="1" fill="#3A2320"></rect><rect x="23" y="97" width="11" height="1" fill="#3A2320"></rect>
<rect x="3" y="30" width="6" height="24" fill="#1E2A3E"></rect><rect x="3" y="54" width="6" height="2" fill="#F2EEE6"></rect><rect x="3" y="56" width="6" height="6" fill="#DDA27E"></rect>
<rect x="35" y="30" width="6" height="24" fill="#1E2A3E"></rect><rect x="35" y="54" width="6" height="2" fill="#F2EEE6"></rect><rect x="35" y="56" width="6" height="1" fill="#D8D04A"></rect><rect x="35" y="57" width="6" height="5" fill="#DDA27E"></rect>
<rect x="8" y="27" width="28" height="36" fill="#1E2A3E"></rect>
<rect x="8" y="27" width="3" height="36" fill="#2A3A52"></rect><rect x="33" y="27" width="3" height="36" fill="#16202F"></rect>
<rect x="11" y="25" width="22" height="2" fill="#1E2A3E"></rect>
<rect x="21" y="40" width="2" height="23" fill="#16202F"></rect>
<rect x="15" y="23" width="14" height="3" fill="#F2EEE6"></rect>
<rect x="18" y="20" width="8" height="4" fill="#C98A68"></rect>
<rect x="11" y="10" width="2" height="6" fill="#DDA27E"></rect><rect x="31" y="10" width="2" height="6" fill="#DDA27E"></rect>
<rect x="15" y="1" width="14" height="1" fill="#E4AE8A"></rect>
<rect x="13" y="2" width="18" height="18" fill="#E4AE8A"></rect>
<rect x="14" y="20" width="16" height="1" fill="#C98A68"></rect>
<rect x="18" y="3" width="6" height="3" fill="#F4CBAA"></rect>
<rect x="13" y="14" width="18" height="6" fill="#DDA27E"></rect>
<rect x="13" y="9" width="2" height="1" fill="#A8997A"></rect><rect x="29" y="9" width="2" height="1" fill="#A8997A"></rect>
</g>
` : ''}

${v.viewSide ? `<g transform="${v.sideFlip}">
<g transform="${v.sideBody}">
${v.sideStand ? `<g><rect x="16" y="62" width="10" height="31" fill="#2A2D2A"></rect><rect x="16" y="93" width="13" height="4" fill="#5E3320"></rect><rect x="16" y="93" width="13" height="1" fill="#8A4E30"></rect><rect x="16" y="97" width="13" height="1" fill="#3A2320"></rect></g>
` : ''}
${v.sideA ? `<g><rect x="15" y="62" width="7" height="12" fill="#23261F"></rect><rect x="12" y="74" width="7" height="10" fill="#23261F"></rect><rect x="10" y="84" width="7" height="9" fill="#23261F"></rect><rect x="6" y="93" width="11" height="4" fill="#3A2320"></rect>
<rect x="21" y="62" width="8" height="12" fill="#2A2D2A"></rect><rect x="24" y="74" width="8" height="10" fill="#2A2D2A"></rect><rect x="26" y="84" width="7" height="9" fill="#2A2D2A"></rect><rect x="26" y="93" width="12" height="4" fill="#5E3320"></rect><rect x="26" y="97" width="12" height="1" fill="#3A2320"></rect></g>
` : ''}
${v.sideB ? `<g><rect x="14" y="62" width="7" height="14" fill="#23261F"></rect><rect x="11" y="76" width="7" height="10" fill="#23261F"></rect><rect x="8" y="86" width="10" height="4" fill="#3A2320"></rect>
<rect x="18" y="62" width="8" height="31" fill="#2A2D2A"></rect><rect x="18" y="93" width="12" height="4" fill="#5E3320"></rect><rect x="18" y="97" width="12" height="1" fill="#3A2320"></rect></g>
` : ''}
<rect x="20" y="20" width="6" height="6" fill="#C98A68"></rect>
<rect x="13" y="26" width="19" height="37" fill="#1E2A3E"></rect>
<rect x="13" y="26" width="3" height="37" fill="#16202F"></rect>
<rect x="28" y="24" width="4" height="12" fill="#F2EEE6"></rect><rect x="26" y="26" width="2" height="10" fill="#16202F"></rect>
<rect x="30" y="30" width="2" height="2" fill="#E0A94A"></rect>
<rect x="18" y="23" width="10" height="3" fill="#F2EEE6"></rect>
<rect x="29" y="36" width="3" height="22" fill="#F2EEE6"></rect><rect x="29" y="56" width="3" height="1" fill="#D8D0C4"></rect>
<rect x="28" y="58" width="4" height="2" fill="#3A2320"></rect><rect x="31" y="58" width="1" height="2" fill="#B9AA8C"></rect>
<rect x="29" y="60" width="3" height="3" fill="#2A2D2A"></rect>
<rect x="15" y="2" width="13" height="1" fill="#E4AE8A"></rect>
<rect x="13" y="3" width="18" height="11" fill="#E4AE8A"></rect>
<rect x="14" y="14" width="18" height="6" fill="#DDA27E"></rect>
<rect x="32" y="10" width="1" height="4" fill="#DDA27E"></rect>
<rect x="17" y="4" width="7" height="2" fill="#F4CBAA"></rect>
<rect x="18" y="9" width="3" height="5" fill="#C98A68"></rect>
<rect x="21" y="15" width="11" height="5" fill="#B88468"></rect><rect x="19" y="18" width="3" height="3" fill="#B88468"></rect>
<rect x="24" y="16" width="1" height="1" fill="#9A6A52"></rect><rect x="28" y="18" width="1" height="1" fill="#9A6A52"></rect>
<rect x="29" y="16" width="2" height="1" fill="#6E3A28"></rect>
<rect x="21" y="9" width="9" height="1" fill="#A8997A"></rect><rect x="26" y="9" width="1" height="4" fill="#A8997A"></rect><rect x="30" y="9" width="1" height="4" fill="#A8997A"></rect><rect x="26" y="13" width="5" height="1" fill="#A8997A"></rect>
<rect x="27" y="10" width="3" height="3" fill="#EDE0C8" opacity="0.28"></rect>
<rect x="28" y="10" width="2" height="2" fill="#2A1A18"></rect>
<rect x="27" y="8" width="3" height="1" fill="#A8836A"></rect>
${v.sideArmBack ? `<g><rect x="16" y="29" width="6" height="12" fill="#1E2A3E"></rect><rect x="13" y="39" width="6" height="12" fill="#1E2A3E"></rect><rect x="13" y="51" width="6" height="2" fill="#F2EEE6"></rect><rect x="12" y="53" width="6" height="5" fill="#DDA27E"></rect></g>
` : ''}
${v.sideArmDown ? `<g><rect x="19" y="29" width="6" height="25" fill="#1E2A3E"></rect><rect x="19" y="29" width="1" height="25" fill="#2A3A52"></rect><rect x="19" y="54" width="6" height="2" fill="#F2EEE6"></rect><rect x="19" y="56" width="6" height="6" fill="#DDA27E"></rect></g>
` : ''}
</g>
</g>
` : ''}
</svg>
</div>`;
}
