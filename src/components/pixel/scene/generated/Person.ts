// @ts-nocheck
// AUTOMATISCH ERZEUGT aus design/Person.dc.html durch tools/gen-sprites.mjs – nicht von Hand ändern.
class DCLogic { constructor(props) { this.props = props; } }
class Component extends DCLogic {
  renderVals() {
    const z = 'translate(0 0)';
    const P = {
      stand:  { body: z, legL: z, legR: z, armL: z, armR: z, arm: 'down' },
      walkA:  { body: z, legL: 'translate(0 -3)', legR: z, armL: 'translate(0 1)', armR: 'translate(0 -1)', arm: 'down' },
      walkB:  { body: 'translate(0 -1)', legL: z, legR: 'translate(0 -3)', armL: 'translate(0 -1)', armR: 'translate(0 1)', arm: 'down' },
      reach:  { body: z, legL: z, legR: 'translate(0 -1)', armL: z, armR: z, arm: 'up' },
      grab:   { body: z, legL: z, legR: z, armL: 'translate(0 1)', armR: z, arm: 'up' },
      pullA:  { body: 'translate(0 1)', legL: z, legR: z, armL: 'translate(0 1)', armR: 'translate(0 8)', arm: 'up' },
      pullB:  { body: 'translate(0 2)', legL: z, legR: z, armL: 'translate(0 2)', armR: 'translate(0 16)', arm: 'up' },
      strike: { body: 'translate(1 0)', legL: z, legR: 'translate(0 -1)', armL: z, armR: z, arm: 'diag' },
      // NEU: Aufsteigen auf die Bank. stepA bei top 63 (rechtes Bein 9 px angehoben),
      // stepB bei top 54 (rechter Fuß auf der Bank y 143, linker Fuß noch am Boden y 161 → Bein verlängert)
      stepA:  { body: z, legL: z, legR: 'translate(0 -9)', armL: 'translate(0 1)', armR: z, arm: 'down' },
      stepB:  { body: z, legL: 'translate(0 9)', legR: 'translate(0 -9)', armL: 'translate(0 -1)', armR: z, arm: 'down', legLLong: true }
    };
    const pose = P[this.props.pose] ? this.props.pose : 'stand';
    const p = Object.assign({ legLLong: false }, P[pose]);
    // NEU: Prop arm überschreibt die Armvariante der Pose (Beine der Pose bleiben).
    // Dann kein Körper-Wippen und der Arm hält still; armDy verschiebt nur den rechten Arm (Stufen der Strichlinie).
    const ARMS = ['down', 'up', 'diag', 'steil', 'flach', 'waagrecht', 'leichtRunter', 'runter'];
    const armProp = this.props.arm;
    if (ARMS.indexOf(armProp) >= 0) {
      p.arm = armProp;
      p.body = z;
      p.armR = 'translate(0 ' + (this.props.armDy ?? 0) + ')';
    }
    // NEU: Blickrichtung. back = bisherige Rückenansicht (alle Posen), right/left = Seitenansicht beim Laufen,
    // front = zum Publikum (stand, waveA, waveB). left ist die gespiegelte right-Ansicht.
    const view = ['back', 'right', 'left', 'front'].indexOf(this.props.view) >= 0 ? this.props.view : 'back';
    const side = view === 'right' || view === 'left';
    const sidePose = (pose === 'walkA' || pose === 'walkB') ? pose : 'stand';
    const rawPose = this.props.pose;
    const wave = view === 'front' && (rawPose === 'waveA' || rawPose === 'waveB') ? rawPose : null;
    // NEU: linker Arm (Rückenansicht) für den Drucker, holding = Druckteil in der Hand (greifen hinten, tragen seitlich)
    const armLeft = ['down', 'greifen', 'druecken'].indexOf(this.props.armLeft) >= 0 ? this.props.armLeft : 'down';
    const holding = ['bulb', 'cube', 'rocket', 'heart', 'cup'].indexOf(this.props.holding) >= 0 ? this.props.holding : 'none';
    // NEU Kaffee: cupLow = Tasse vor der Brust, cupDrink = Tasse am Mund (nur view front)
    const cupPose = view === 'front' && (rawPose === 'cupLow' || rawPose === 'cupDrink') ? rawPose : null;
    let face = this.props.face ?? 'auto';
    if (face === 'auto') face = wave ? 'grin' : cupPose === 'cupDrink' ? 'blink' : 'smile';
    const blindsPose = pose === 'grab' || pose === 'pullA' || pose === 'pullB';
    const showMarker = !blindsPose && (this.props.marker ?? true);
    return Object.assign({}, p, {
      armDown: p.arm === 'down', armUp: p.arm === 'up', armDiag: p.arm === 'diag',
      armSteil: p.arm === 'steil', armFlach: p.arm === 'flach', armWaagrecht: p.arm === 'waagrecht',
      armLeicht: p.arm === 'leichtRunter', armRunter: p.arm === 'runter',
      showMarker: showMarker,
      viewBack: view === 'back', viewSide: side, viewFront: view === 'front',
      sideFlip: view === 'left' ? 'translate(44 0) scale(-1 1)' : 'translate(0 0)',
      sideBody: sidePose === 'walkB' ? 'translate(0 -1)' : 'translate(0 0)',
      sideStand: sidePose === 'stand', sideA: sidePose === 'walkA', sideB: sidePose === 'walkB',
      sideArmCarry: holding !== 'none', sideArmBack: holding === 'none' && sidePose === 'walkA', sideArmDown: holding === 'none' && sidePose !== 'walkA',
      armLDown: armLeft === 'down', armLGreifen: armLeft === 'greifen', armLDruecken: armLeft === 'druecken',
      holdBulb: holding === 'bulb', holdCube: holding === 'cube', holdRocket: holding === 'rocket', holdHeart: holding === 'heart', holdCup: holding === 'cup',
      sideMarker: this.props.marker ?? true,
      frontArmDown: !wave && !cupPose, frontCupLow: cupPose === 'cupLow', frontCupDrink: cupPose === 'cupDrink', frontWaveA: wave === 'waveA', frontWaveB: wave === 'waveB',
      eyesOpen: face !== 'blink' && face !== 'grin', eyesClosed: face === 'blink' || face === 'grin',
      mouthNeutral: face === 'neutral', mouthSmile: face === 'smile' || face === 'blink', mouthGrin: face === 'grin',
      blush: face === 'smile' || face === 'grin' || face === 'blink'
    });
  }
}
export const DEFAULTS = {"pose":"stand","view":"back","face":"auto","marker":true,"armLeft":"down","holding":"none","arm":"auto","armDy":0};
export function vals(props) { return new Component({ ...DEFAULTS, ...props }).renderVals(); }
export function html(props, over = {}) {
  const v = { ...vals(props), ...over };
  return `<div style="width: 264px; height: 600px; position: relative; overflow: visible; font-family: monospace; color: #2A1A18">
<svg width="264" height="600" viewBox="0 0 44 100" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" style="display: block; overflow: visible">
<rect x="6" y="98" width="32" height="2" fill="#1A0F0D" opacity="0.35"></rect>
${v.viewBack ? `<g id="body" transform="${v.body}">
${v.legLLong ? `<g>
<rect x="12" y="62" width="8" height="10" fill="#2A2D2A"></rect>
<rect x="12" y="62" width="2" height="10" fill="#353935"></rect>
</g>
` : ''}
<g id="legL" transform="${v.legL}">
<rect x="12" y="62" width="8" height="32" fill="#2A2D2A"></rect>
<rect x="12" y="62" width="2" height="32" fill="#353935"></rect>
<rect x="10" y="93" width="11" height="4" fill="#EDE0C8"></rect>
<rect x="10" y="97" width="11" height="1" fill="#B9AA8C"></rect>
</g>
<g id="legR" transform="${v.legR}">
<rect x="24" y="62" width="8" height="32" fill="#23261F"></rect>
<rect x="23" y="93" width="11" height="4" fill="#EDE0C8"></rect>
<rect x="23" y="97" width="11" height="1" fill="#B9AA8C"></rect>
</g>
<g id="armL" transform="${v.armL}">
${v.armLDown ? `<g>
<rect x="3" y="30" width="6" height="25" fill="#2C5C5A"></rect>
<rect x="3" y="30" width="2" height="25" fill="#357170"></rect>
<rect x="3" y="55" width="6" height="2" fill="#24504E"></rect>
<rect x="3" y="57" width="6" height="5" fill="#D99A76"></rect>
</g>
` : ''}
${v.armLGreifen ? `<g>
<rect x="3" y="30" width="6" height="10" fill="#2C5C5A"></rect>
<rect x="3" y="30" width="2" height="10" fill="#357170"></rect>
<rect x="2" y="38" width="6" height="4" fill="#2C5C5A"></rect>
<rect x="2" y="42" width="6" height="2" fill="#24504E"></rect>
<rect x="2" y="44" width="6" height="5" fill="#D99A76"></rect>
<g transform="translate(2 38)">
${v.holdBulb ? `<g><rect x="1" y="0" width="4" height="1" fill="#FCE680"></rect><rect x="0" y="1" width="6" height="3" fill="#FCE680"></rect><rect x="1" y="4" width="4" height="1" fill="#FCE680"></rect><rect x="2" y="5" width="2" height="1" fill="#F0A31B"></rect></g>` : ''}
${v.holdCube ? `<g><rect x="0" y="1" width="5" height="5" fill="#3E7C7A"></rect><rect x="0" y="1" width="5" height="1" fill="#4A8C89"></rect></g>` : ''}
${v.holdRocket ? `<g><rect x="2" y="0" width="1" height="1" fill="#C4493A"></rect><rect x="1" y="1" width="3" height="1" fill="#C4493A"></rect><rect x="1" y="2" width="3" height="3" fill="#EDE0C8"></rect><rect x="0" y="4" width="1" height="2" fill="#C4493A"></rect><rect x="4" y="4" width="1" height="2" fill="#C4493A"></rect></g>` : ''}
${v.holdCup ? `<g><rect x="0" y="1" width="5" height="5" fill="#F2EEE6"></rect><rect x="0" y="1" width="5" height="1" fill="#5E3320"></rect><rect x="4" y="2" width="1" height="4" fill="#D8D0C4"></rect><rect x="5" y="2" width="1" height="1" fill="#F2EEE6"></rect><rect x="6" y="3" width="1" height="2" fill="#F2EEE6"></rect><rect x="5" y="5" width="1" height="1" fill="#F2EEE6"></rect></g>` : ''}
${v.holdHeart ? `<g><rect x="0" y="1" width="2" height="1" fill="#F07A7A"></rect><rect x="3" y="1" width="2" height="1" fill="#F07A7A"></rect><rect x="0" y="2" width="5" height="1" fill="#F07A7A"></rect><rect x="1" y="3" width="3" height="1" fill="#F07A7A"></rect><rect x="2" y="4" width="1" height="1" fill="#F07A7A"></rect></g>` : ''}
</g>
</g>
` : ''}
${v.armLDruecken ? `<g>
<rect x="3" y="30" width="6" height="4" fill="#2C5C5A"></rect>
<rect x="3" y="30" width="2" height="4" fill="#357170"></rect>
<rect x="2" y="34" width="6" height="2" fill="#24504E"></rect>
<rect x="2" y="36" width="6" height="5" fill="#D99A76"></rect>
<rect x="1" y="37" width="1" height="2" fill="#D99A76"></rect>
</g>
` : ''}
</g>
<rect x="18" y="20" width="8" height="6" fill="#C0845F"></rect>
<rect x="11" y="25" width="22" height="2" fill="#3E7C7A"></rect>
<rect x="8" y="27" width="28" height="33" fill="#3E7C7A"></rect>
<rect x="8" y="27" width="3" height="33" fill="#4A8C89"></rect>
<rect x="32" y="27" width="4" height="33" fill="#357170"></rect>
<rect x="9" y="60" width="26" height="4" fill="#2C5C5A"></rect>
<rect x="14" y="24" width="16" height="7" fill="#2C5C5A"></rect>
<rect x="16" y="31" width="12" height="2" fill="#2C5C5A"></rect>
<g id="hoodie-logo">
<g transform="translate(1 1)" fill="#1A2E2D">
<rect x="10" y="36" width="1" height="5"></rect><rect x="12" y="36" width="1" height="2"></rect><rect x="11" y="38" width="1" height="1"></rect><rect x="12" y="39" width="1" height="2"></rect>
<rect x="14" y="36" width="3" height="1"></rect><rect x="15" y="37" width="1" height="3"></rect><rect x="14" y="40" width="3" height="1"></rect>
<rect x="18" y="36" width="2" height="1"></rect><rect x="18" y="37" width="1" height="3"></rect><rect x="20" y="37" width="1" height="3"></rect><rect x="18" y="40" width="2" height="1"></rect>
<rect x="22" y="36" width="3" height="1"></rect><rect x="22" y="37" width="1" height="1"></rect><rect x="22" y="38" width="3" height="1"></rect><rect x="24" y="39" width="1" height="1"></rect><rect x="22" y="40" width="3" height="1"></rect>
<rect x="16" y="43" width="1" height="4"></rect><rect x="16" y="47" width="3" height="1"></rect>
<rect x="21" y="43" width="1" height="1"></rect><rect x="20" y="44" width="1" height="4"></rect><rect x="22" y="44" width="1" height="4"></rect><rect x="21" y="45" width="1" height="1"></rect>
<rect x="24" y="43" width="1" height="5"></rect><rect x="25" y="43" width="1" height="1"></rect><rect x="26" y="44" width="1" height="1"></rect><rect x="25" y="45" width="1" height="1"></rect><rect x="26" y="46" width="1" height="1"></rect><rect x="25" y="47" width="1" height="1"></rect>
<rect x="27" y="31" width="4" height="1"></rect><rect x="26" y="32" width="6" height="3"></rect><rect x="27" y="35" width="4" height="1"></rect><rect x="28" y="36" width="2" height="3"></rect>
</g>
<g fill="#F0A31B"><rect x="10" y="36" width="1" height="5"></rect><rect x="12" y="36" width="1" height="2"></rect><rect x="11" y="38" width="1" height="1"></rect><rect x="12" y="39" width="1" height="2"></rect></g>
<g fill="#C48BC4"><rect x="14" y="36" width="3" height="1"></rect><rect x="15" y="37" width="1" height="3"></rect><rect x="14" y="40" width="3" height="1"></rect></g>
<g fill="#F07A7A"><rect x="18" y="36" width="2" height="1"></rect><rect x="18" y="37" width="1" height="3"></rect><rect x="20" y="37" width="1" height="3"></rect><rect x="18" y="40" width="2" height="1"></rect></g>
<g fill="#7FE0C2"><rect x="22" y="36" width="3" height="1"></rect><rect x="22" y="37" width="1" height="1"></rect><rect x="22" y="38" width="3" height="1"></rect><rect x="24" y="39" width="1" height="1"></rect><rect x="22" y="40" width="3" height="1"></rect></g>
<g fill="#4CC8F0"><rect x="16" y="43" width="1" height="4"></rect><rect x="16" y="47" width="3" height="1"></rect></g>
<g fill="#FCE680"><rect x="21" y="43" width="1" height="1"></rect><rect x="20" y="44" width="1" height="4"></rect><rect x="22" y="44" width="1" height="4"></rect><rect x="21" y="45" width="1" height="1"></rect></g>
<g fill="#E83030"><rect x="24" y="43" width="1" height="5"></rect><rect x="25" y="43" width="1" height="1"></rect><rect x="26" y="44" width="1" height="1"></rect><rect x="25" y="45" width="1" height="1"></rect><rect x="26" y="46" width="1" height="1"></rect><rect x="25" y="47" width="1" height="1"></rect></g>
<g fill="#FCE680"><rect x="27" y="31" width="4" height="1"></rect><rect x="26" y="32" width="6" height="3"></rect><rect x="27" y="35" width="4" height="1"></rect></g>
<rect x="28" y="33" width="2" height="1" fill="#F07A7A"></rect>
<rect x="28" y="36" width="2" height="1" fill="#F0A31B"></rect>
<rect x="28" y="37" width="2" height="1" fill="#F07A7A"></rect>
<rect x="28" y="38" width="2" height="1" fill="#4CC8F0"></rect>
</g>
<rect x="10" y="11" width="2" height="5" fill="#D99A76"></rect>
<rect x="32" y="11" width="2" height="5" fill="#D99A76"></rect>
<rect x="14" y="2" width="16" height="2" fill="#2A1A18"></rect>
<rect x="12" y="4" width="20" height="16" fill="#2A1A18"></rect>
<rect x="13" y="20" width="18" height="2" fill="#2A1A18"></rect>
<rect x="16" y="4" width="8" height="1" fill="#46302A"></rect>
<rect x="14" y="6" width="3" height="1" fill="#46302A"></rect>
<g id="armR" transform="${v.armR}">
${v.armDown ? `<g>
<rect x="35" y="30" width="6" height="25" fill="#2C5C5A"></rect>
<rect x="35" y="55" width="6" height="2" fill="#24504E"></rect>
<rect x="35" y="57" width="6" height="5" fill="#D99A76"></rect>
${v.showMarker ? `<g>
<rect x="36" y="62" width="4" height="7" fill="#C4493A"></rect>
<rect x="37" y="69" width="2" height="2" fill="#2A1A18"></rect>
</g>
` : ''}
</g>
` : ''}
${v.armUp ? `<g>
<rect x="35" y="6" width="6" height="26" fill="#2C5C5A"></rect>
<rect x="35" y="6" width="6" height="2" fill="#24504E"></rect>
<rect x="35" y="0" width="6" height="6" fill="#D99A76"></rect>
${v.showMarker ? `<g>
<rect x="36" y="-6" width="4" height="6" fill="#C4493A"></rect>
<rect x="37" y="-8" width="2" height="2" fill="#2A1A18"></rect>
</g>
` : ''}
</g>
` : ''}
${v.armDiag ? `<g>
<rect x="34" y="26" width="7" height="7" fill="#2C5C5A"></rect>
<rect x="38" y="22" width="7" height="7" fill="#2C5C5A"></rect>
<rect x="42" y="18" width="7" height="7" fill="#2C5C5A"></rect>
<rect x="46" y="14" width="7" height="7" fill="#2C5C5A"></rect>
<rect x="50" y="12" width="3" height="5" fill="#24504E"></rect>
<rect x="52" y="9" width="6" height="6" fill="#D99A76"></rect>
<rect x="56" y="5" width="3" height="5" fill="#C4493A"></rect>
</g>
` : ''}
${v.armSteil ? `<g>
<rect x="35" y="20" width="6" height="13" fill="#2C5C5A"></rect>
<rect x="35" y="14" width="6" height="6" fill="#2C5C5A"></rect>
<rect x="36" y="8" width="6" height="6" fill="#2C5C5A"></rect>
<rect x="36" y="6" width="6" height="2" fill="#24504E"></rect>
<rect x="37" y="0" width="6" height="6" fill="#D99A76"></rect>
${v.showMarker ? `<g>
<rect x="43" y="2" width="2" height="2" fill="#C4493A"></rect>
<rect x="45" y="2" width="2" height="2" fill="#2A1A18"></rect>
</g>
` : ''}
</g>
` : ''}
${v.armFlach ? `<g>
<rect x="35" y="24" width="6" height="9" fill="#2C5C5A"></rect>
<rect x="39" y="19" width="6" height="7" fill="#2C5C5A"></rect>
<rect x="44" y="16" width="2" height="6" fill="#24504E"></rect>
<rect x="45" y="14" width="5" height="6" fill="#D99A76"></rect>
${v.showMarker ? `<g>
<rect x="50" y="14" width="2" height="2" fill="#C4493A"></rect>
<rect x="52" y="14" width="2" height="2" fill="#2A1A18"></rect>
</g>
` : ''}
</g>
` : ''}
${v.armWaagrecht ? `<g>
<rect x="35" y="25" width="6" height="8" fill="#2C5C5A"></rect>
<rect x="41" y="24" width="5" height="7" fill="#2C5C5A"></rect>
<rect x="46" y="24" width="2" height="6" fill="#24504E"></rect>
<rect x="48" y="23" width="5" height="6" fill="#D99A76"></rect>
${v.showMarker ? `<g>
<rect x="53" y="24" width="2" height="2" fill="#C4493A"></rect>
<rect x="55" y="24" width="2" height="2" fill="#2A1A18"></rect>
</g>
` : ''}
</g>
` : ''}
${v.armLeicht ? `<g>
<rect x="35" y="28" width="6" height="8" fill="#2C5C5A"></rect>
<rect x="38" y="34" width="6" height="6" fill="#2C5C5A"></rect>
<rect x="44" y="34" width="2" height="6" fill="#24504E"></rect>
<rect x="46" y="33" width="5" height="6" fill="#D99A76"></rect>
${v.showMarker ? `<g>
<rect x="51" y="34" width="2" height="2" fill="#C4493A"></rect>
<rect x="53" y="34" width="2" height="2" fill="#2A1A18"></rect>
</g>
` : ''}
</g>
` : ''}
${v.armRunter ? `<g>
<rect x="35" y="30" width="6" height="12" fill="#2C5C5A"></rect>
<rect x="38" y="40" width="6" height="6" fill="#2C5C5A"></rect>
<rect x="44" y="41" width="2" height="6" fill="#24504E"></rect>
<rect x="46" y="41" width="5" height="6" fill="#D99A76"></rect>
${v.showMarker ? `<g>
<rect x="51" y="44" width="2" height="2" fill="#C4493A"></rect>
<rect x="53" y="44" width="2" height="2" fill="#2A1A18"></rect>
</g>
` : ''}
</g>
` : ''}
</g>
</g>
` : ''}
${v.viewSide ? `<g id="side" transform="${v.sideFlip}">
<g transform="${v.sideBody}">
${v.sideStand ? `<g>
<rect x="16" y="62" width="10" height="31" fill="#2A2D2A"></rect>
<rect x="16" y="62" width="2" height="31" fill="#353935"></rect>
<rect x="16" y="93" width="13" height="4" fill="#EDE0C8"></rect>
<rect x="16" y="97" width="13" height="1" fill="#B9AA8C"></rect>
</g>
` : ''}
${v.sideA ? `<g>
<rect x="15" y="62" width="7" height="12" fill="#23261F"></rect>
<rect x="12" y="74" width="7" height="10" fill="#23261F"></rect>
<rect x="10" y="84" width="7" height="9" fill="#23261F"></rect>
<rect x="6" y="93" width="11" height="4" fill="#B9AA8C"></rect>
<rect x="6" y="97" width="11" height="1" fill="#A8997A"></rect>
<rect x="21" y="62" width="8" height="12" fill="#2A2D2A"></rect>
<rect x="24" y="74" width="8" height="10" fill="#2A2D2A"></rect>
<rect x="26" y="84" width="7" height="9" fill="#2A2D2A"></rect>
<rect x="26" y="93" width="12" height="4" fill="#EDE0C8"></rect>
<rect x="26" y="97" width="12" height="1" fill="#B9AA8C"></rect>
</g>
` : ''}
${v.sideB ? `<g>
<rect x="14" y="62" width="7" height="14" fill="#23261F"></rect>
<rect x="11" y="76" width="7" height="10" fill="#23261F"></rect>
<rect x="8" y="86" width="10" height="4" fill="#B9AA8C"></rect>
<rect x="18" y="62" width="8" height="31" fill="#2A2D2A"></rect>
<rect x="18" y="62" width="2" height="31" fill="#353935"></rect>
<rect x="18" y="93" width="12" height="4" fill="#EDE0C8"></rect>
<rect x="18" y="97" width="12" height="1" fill="#B9AA8C"></rect>
</g>
` : ''}
<rect x="20" y="20" width="6" height="6" fill="#C0845F"></rect>
<rect x="11" y="22" width="8" height="9" fill="#2C5C5A"></rect>
<rect x="13" y="26" width="18" height="34" fill="#3E7C7A"></rect>
<rect x="13" y="26" width="3" height="34" fill="#357170"></rect>
<rect x="29" y="28" width="2" height="30" fill="#4A8C89"></rect>
<rect x="10" y="26" width="4" height="8" fill="#2C5C5A"></rect>
<rect x="27" y="29" width="1" height="7" fill="#EDE0C8"></rect>
<rect x="22" y="46" width="9" height="7" fill="#357170"></rect>
<rect x="22" y="46" width="9" height="1" fill="#2C5C5A"></rect>
<rect x="13" y="60" width="18" height="4" fill="#2C5C5A"></rect>
<rect x="21" y="6" width="11" height="15" fill="#D99A76"></rect>
<rect x="32" y="12" width="1" height="3" fill="#D99A76"></rect>
<rect x="22" y="20" width="9" height="1" fill="#C0845F"></rect>
<rect x="15" y="2" width="14" height="2" fill="#2A1A18"></rect>
<rect x="13" y="4" width="18" height="4" fill="#2A1A18"></rect>
<rect x="13" y="8" width="9" height="12" fill="#2A1A18"></rect>
<rect x="14" y="20" width="7" height="2" fill="#2A1A18"></rect>
<rect x="29" y="8" width="2" height="1" fill="#2A1A18"></rect>
<rect x="17" y="4" width="6" height="1" fill="#46302A"></rect>
<rect x="22" y="11" width="2" height="4" fill="#C0845F"></rect>
<rect x="28" y="11" width="2" height="2" fill="#2A1A18"></rect>
<rect x="29" y="17" width="2" height="1" fill="#8A4E30"></rect>
${v.sideArmBack ? `<g>
<rect x="16" y="29" width="6" height="12" fill="#2C5C5A"></rect>
<rect x="13" y="39" width="6" height="12" fill="#2C5C5A"></rect>
<rect x="13" y="51" width="6" height="2" fill="#24504E"></rect>
<rect x="12" y="53" width="6" height="5" fill="#D99A76"></rect>
${v.sideMarker ? `<g><rect x="13" y="58" width="4" height="5" fill="#C4493A"></rect><rect x="14" y="63" width="2" height="2" fill="#2A1A18"></rect></g>
` : ''}
</g>
` : ''}
${v.sideArmCarry ? `<g>
<rect x="18" y="29" width="6" height="10" fill="#2C5C5A"></rect>
<rect x="21" y="37" width="6" height="4" fill="#2C5C5A"></rect>
<rect x="27" y="37" width="2" height="4" fill="#24504E"></rect>
<rect x="29" y="36" width="4" height="5" fill="#D99A76"></rect>
<g transform="translate(28 30)">
${v.holdBulb ? `<g><rect x="1" y="0" width="4" height="1" fill="#FCE680"></rect><rect x="0" y="1" width="6" height="3" fill="#FCE680"></rect><rect x="1" y="4" width="4" height="1" fill="#FCE680"></rect><rect x="2" y="5" width="2" height="1" fill="#F0A31B"></rect></g>` : ''}
${v.holdCube ? `<g><rect x="0" y="1" width="5" height="5" fill="#3E7C7A"></rect><rect x="0" y="1" width="5" height="1" fill="#4A8C89"></rect></g>` : ''}
${v.holdRocket ? `<g><rect x="2" y="0" width="1" height="1" fill="#C4493A"></rect><rect x="1" y="1" width="3" height="1" fill="#C4493A"></rect><rect x="1" y="2" width="3" height="3" fill="#EDE0C8"></rect><rect x="0" y="4" width="1" height="2" fill="#C4493A"></rect><rect x="4" y="4" width="1" height="2" fill="#C4493A"></rect></g>` : ''}
${v.holdCup ? `<g><rect x="0" y="1" width="5" height="5" fill="#F2EEE6"></rect><rect x="0" y="1" width="5" height="1" fill="#5E3320"></rect><rect x="4" y="2" width="1" height="4" fill="#D8D0C4"></rect><rect x="5" y="2" width="1" height="1" fill="#F2EEE6"></rect><rect x="6" y="3" width="1" height="2" fill="#F2EEE6"></rect><rect x="5" y="5" width="1" height="1" fill="#F2EEE6"></rect></g>` : ''}
${v.holdHeart ? `<g><rect x="0" y="1" width="2" height="1" fill="#F07A7A"></rect><rect x="3" y="1" width="2" height="1" fill="#F07A7A"></rect><rect x="0" y="2" width="5" height="1" fill="#F07A7A"></rect><rect x="1" y="3" width="3" height="1" fill="#F07A7A"></rect><rect x="2" y="4" width="1" height="1" fill="#F07A7A"></rect></g>` : ''}
</g>
</g>
` : ''}
${v.sideArmDown ? `<g>
<rect x="18" y="29" width="6" height="26" fill="#2C5C5A"></rect>
<rect x="18" y="55" width="6" height="2" fill="#24504E"></rect>
<rect x="18" y="57" width="6" height="5" fill="#D99A76"></rect>
${v.sideMarker ? `<g><rect x="19" y="62" width="4" height="6" fill="#C4493A"></rect><rect x="20" y="68" width="2" height="2" fill="#2A1A18"></rect></g>
` : ''}
</g>
` : ''}
</g>
</g>
` : ''}
${v.viewFront ? `<g id="front">
<rect x="12" y="62" width="8" height="31" fill="#2A2D2A"></rect>
<rect x="12" y="62" width="2" height="31" fill="#353935"></rect>
<rect x="24" y="62" width="8" height="31" fill="#2A2D2A"></rect>
<rect x="30" y="62" width="2" height="31" fill="#23261F"></rect>
<rect x="10" y="93" width="11" height="4" fill="#EDE0C8"></rect>
<rect x="10" y="97" width="11" height="1" fill="#B9AA8C"></rect>
<rect x="23" y="93" width="11" height="4" fill="#EDE0C8"></rect>
<rect x="23" y="97" width="11" height="1" fill="#B9AA8C"></rect>
<rect x="19" y="20" width="6" height="4" fill="#C0845F"></rect>
<rect x="11" y="25" width="22" height="2" fill="#3E7C7A"></rect>
<rect x="8" y="27" width="28" height="33" fill="#3E7C7A"></rect>
<rect x="8" y="27" width="3" height="33" fill="#4A8C89"></rect>
<rect x="32" y="27" width="4" height="33" fill="#357170"></rect>
<rect x="13" y="23" width="18" height="4" fill="#2C5C5A"></rect>
<rect x="19" y="24" width="6" height="3" fill="#C0845F"></rect>
<rect x="18" y="27" width="1" height="7" fill="#EDE0C8"></rect>
<rect x="25" y="27" width="1" height="7" fill="#EDE0C8"></rect>
<rect x="13" y="46" width="18" height="8" fill="#357170"></rect>
<rect x="13" y="46" width="18" height="1" fill="#2C5C5A"></rect>
<rect x="9" y="60" width="26" height="4" fill="#2C5C5A"></rect>
<g id="chest-logo">
<g transform="translate(1 1)" fill="#1A2E2D"><rect x="29" y="35" width="3" height="1"></rect><rect x="28" y="36" width="5" height="3"></rect><rect x="29" y="39" width="3" height="1"></rect><rect x="29" y="40" width="3" height="3"></rect></g>
<g fill="#FCE680"><rect x="29" y="35" width="3" height="1"></rect><rect x="28" y="36" width="5" height="3"></rect><rect x="29" y="39" width="3" height="1"></rect></g>
<rect x="30" y="37" width="1" height="1" fill="#F07A7A"></rect>
<rect x="29" y="40" width="3" height="1" fill="#F0A31B"></rect>
<rect x="29" y="41" width="3" height="1" fill="#F07A7A"></rect>
<rect x="29" y="42" width="3" height="1" fill="#4CC8F0"></rect>
</g>
<rect x="10" y="11" width="2" height="5" fill="#D99A76"></rect>
<rect x="32" y="11" width="2" height="5" fill="#D99A76"></rect>
<rect x="14" y="7" width="16" height="14" fill="#D99A76"></rect>
<rect x="15" y="20" width="14" height="1" fill="#C0845F"></rect>
<rect x="14" y="2" width="16" height="2" fill="#2A1A18"></rect>
<rect x="12" y="4" width="20" height="5" fill="#2A1A18"></rect>
<rect x="12" y="9" width="3" height="11" fill="#2A1A18"></rect>
<rect x="29" y="9" width="3" height="11" fill="#2A1A18"></rect>
<rect x="15" y="9" width="4" height="1" fill="#2A1A18"></rect>
<rect x="24" y="9" width="3" height="1" fill="#2A1A18"></rect>
<rect x="16" y="4" width="8" height="1" fill="#46302A"></rect>
${v.eyesOpen ? `<g>
<rect x="17" y="12" width="2" height="3" fill="#2A1A18"></rect>
<rect x="25" y="12" width="2" height="3" fill="#2A1A18"></rect>
<rect x="18" y="12" width="1" height="1" fill="#EDE0C8"></rect>
<rect x="26" y="12" width="1" height="1" fill="#EDE0C8"></rect>
</g>
` : ''}
${v.eyesClosed ? `<g>
<rect x="16" y="14" width="1" height="1" fill="#2A1A18"></rect><rect x="17" y="13" width="2" height="1" fill="#2A1A18"></rect><rect x="19" y="14" width="1" height="1" fill="#2A1A18"></rect>
<rect x="24" y="14" width="1" height="1" fill="#2A1A18"></rect><rect x="25" y="13" width="2" height="1" fill="#2A1A18"></rect><rect x="27" y="14" width="1" height="1" fill="#2A1A18"></rect>
</g>
` : ''}
${v.mouthNeutral ? `<rect x="20" y="18" width="4" height="1" fill="#8A4E30"></rect>
` : ''}
${v.mouthSmile ? `<g>
<rect x="18" y="17" width="1" height="1" fill="#8A4E30"></rect>
<rect x="19" y="18" width="6" height="1" fill="#8A4E30"></rect>
<rect x="25" y="17" width="1" height="1" fill="#8A4E30"></rect>
</g>
` : ''}
${v.mouthGrin ? `<g>
<rect x="18" y="17" width="8" height="1" fill="#5E3320"></rect>
<rect x="19" y="18" width="6" height="1" fill="#5E3320"></rect>
<rect x="19" y="17" width="6" height="1" fill="#EDE0C8"></rect>
</g>
` : ''}
${v.blush ? `<g>
<rect x="15" y="16" width="2" height="1" fill="#E0909E"></rect>
<rect x="27" y="16" width="2" height="1" fill="#E0909E"></rect>
</g>
` : ''}
<rect x="35" y="30" width="6" height="25" fill="#2C5C5A"></rect>
<rect x="39" y="30" width="2" height="25" fill="#24504E"></rect>
<rect x="35" y="55" width="6" height="2" fill="#24504E"></rect>
<rect x="35" y="57" width="6" height="5" fill="#D99A76"></rect>
${v.frontCupLow ? `<g>
<rect x="3" y="30" width="6" height="10" fill="#2C5C5A"></rect>
<rect x="3" y="30" width="2" height="10" fill="#357170"></rect>
<rect x="5" y="38" width="8" height="5" fill="#2C5C5A"></rect>
<rect x="13" y="38" width="2" height="5" fill="#24504E"></rect>
<rect x="15" y="39" width="5" height="4" fill="#D99A76"></rect>
<rect x="15" y="33" width="5" height="6" fill="#F2EEE6"></rect>
<rect x="15" y="33" width="5" height="1" fill="#5E3320"></rect>
<rect x="19" y="34" width="1" height="5" fill="#D8D0C4"></rect>
<rect x="20" y="35" width="1" height="1" fill="#F2EEE6"></rect><rect x="21" y="36" width="1" height="2" fill="#F2EEE6"></rect><rect x="20" y="38" width="1" height="1" fill="#F2EEE6"></rect>
<g transform="translate(0 ${v.steamDy || 0})"><rect x="16" y="30" width="1" height="2" fill="#FFF4D8" opacity="0.5"></rect><rect x="18" y="28" width="1" height="2" fill="#FFF4D8" opacity="0.4"></rect></g>
</g>
` : ''}
${v.frontCupDrink ? `<g>
<rect x="3" y="26" width="6" height="8" fill="#2C5C5A"></rect>
<rect x="3" y="26" width="2" height="8" fill="#357170"></rect>
<rect x="6" y="21" width="6" height="7" fill="#2C5C5A"></rect>
<rect x="11" y="20" width="2" height="5" fill="#24504E"></rect>
<rect x="13" y="20" width="4" height="5" fill="#D99A76"></rect>
<rect x="16" y="15" width="6" height="6" fill="#F2EEE6"></rect>
<rect x="16" y="15" width="1" height="6" fill="#D8D0C4"></rect>
<rect x="22" y="16" width="1" height="1" fill="#F2EEE6"></rect><rect x="23" y="17" width="1" height="2" fill="#F2EEE6"></rect><rect x="22" y="19" width="1" height="1" fill="#F2EEE6"></rect>
</g>
` : ''}
${v.frontArmDown ? `<g>
<rect x="3" y="30" width="6" height="25" fill="#2C5C5A"></rect>
<rect x="3" y="30" width="2" height="25" fill="#357170"></rect>
<rect x="3" y="55" width="6" height="2" fill="#24504E"></rect>
<rect x="3" y="57" width="6" height="5" fill="#D99A76"></rect>
</g>
` : ''}
${v.frontWaveA ? `<g>
<rect x="3" y="24" width="6" height="8" fill="#2C5C5A"></rect>
<rect x="1" y="16" width="6" height="8" fill="#2C5C5A"></rect>
<rect x="0" y="10" width="6" height="6" fill="#2C5C5A"></rect>
<rect x="0" y="8" width="6" height="2" fill="#24504E"></rect>
<rect x="0" y="2" width="6" height="6" fill="#D99A76"></rect>
<rect x="0" y="0" width="1" height="2" fill="#D99A76"></rect><rect x="2" y="0" width="1" height="2" fill="#D99A76"></rect><rect x="4" y="0" width="1" height="2" fill="#D99A76"></rect>
<rect x="6" y="4" width="1" height="2" fill="#D99A76"></rect>
</g>
` : ''}
${v.frontWaveB ? `<g>
<rect x="3" y="24" width="6" height="8" fill="#2C5C5A"></rect>
<rect x="0" y="17" width="6" height="7" fill="#2C5C5A"></rect>
<rect x="-2" y="12" width="6" height="5" fill="#2C5C5A"></rect>
<rect x="-3" y="10" width="6" height="2" fill="#24504E"></rect>
<rect x="-4" y="4" width="6" height="6" fill="#D99A76"></rect>
<rect x="-5" y="2" width="1" height="2" fill="#D99A76"></rect><rect x="-3" y="2" width="1" height="2" fill="#D99A76"></rect><rect x="-1" y="2" width="1" height="2" fill="#D99A76"></rect>
<rect x="2" y="6" width="1" height="2" fill="#D99A76"></rect>
</g>
` : ''}
</g>
` : ''}
</svg>
</div>`;
}
