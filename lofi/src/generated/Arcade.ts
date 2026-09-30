// @ts-nocheck
// AUTOMATISCH ERZEUGT aus design/Arcade.dc.html durch tools/gen-sprites.mjs – nicht von Hand ändern.
class DCLogic { constructor(props) { this.props = props; } }
class Component extends DCLogic {
  renderVals() {
    const screen = ['title', 'play', 'name', 'board'].indexOf(this.props.screen) >= 0 ? this.props.screen : 'play';
    // Eigenes Labyrinth, 28×20 Kacheln à 6 Pixel, symmetrisch, ohne Sackgassen (geprüft: alle 214 Bits + 4 Tassen erreichbar).
    // # Wand, . Bit, o Kaffee, - Tür des Bug-Nests, Leerzeichen = frei. Zeile 10 ist der Tunnel (links/rechts offen).
    const L = ['##############', '#............#', '#.####.#####.#', '#o####.#####.#', '#.............', '#.####.##.####', '#......##....#',
               '######.#####.#', '     #.##.....', '######.##.###-', '      ....#   ', '######.##.####', '     #.##.....', '######.##.####',
               '#............#', '#.####.#####.#', '#o..##........', '#.#.##.##.####', '#......##.....', '##############'];
    const M = L.map(function (l) { return l + l.split('').reverse().join(''); });
    const OX = 12, OY = 12, T = 6;
    // Beispielzustand: schon gefressene Bits
    const eaten = {};
    for (let c = 14; c <= 26; c++) eaten['14,' + c] = true;
    for (let r = 15; r <= 18; r++) eaten[r + ',26'] = true;
    for (let c = 1; c <= 11; c++) eaten['4,' + c] = true;
    const walls = [], dots = [], powers = [], doors = [];
    M.forEach(function (row, r) {
      row.split('').forEach(function (ch, c) {
        const x = OX + c * T, y = OY + r * T;
        if (ch === '#') walls.push({ x: x, y: y, edge: r === 0 || M[r - 1][c] !== '#' });
        else if (ch === '-') doors.push({ x: x, y2: y + 2 });
        else if (ch === '.' && !eaten[r + ',' + c]) dots.push({ x2: x + 2, y2: y + 2 });
        else if (ch === 'o' && !(r === 16 && c === 26)) powers.push({ x: x, y: y });
      });
    });
    const P = function (c, r) { return { x: OX + c * T, y: OY + r * T }; };
    const pl = P(13, 14);
    const bugs = [
      Object.assign(P(9, 4), { c: '#F0A31B' }),
      Object.assign(P(21, 6), { c: '#C48BC4' }),
      Object.assign(P(12, 10), { c: '#7FE0C2' }),
      Object.assign(P(15, 10), { c: '#4CC8F0' })
    ];
    const pad = function (n) { return String(n).padStart(5, '0'); };
    const B = [['ADA', 12480], ['MAXIMUS', 9820], ['KIDSLAB', 7560], ['BITBOSS', 6300], ['NEO', 5150], ['ZOE2026', 4780], ['LABRAT', 3210], ['ELA', 2640], ['TIMO', 1800], ['SAMIRA', 970]];
    const board = B.map(function (b, i) {
      const me = i === 2;
      return { rank: i + 1, name: b[0], score: pad(b[1]), color: me ? '#0E1A14' : (i === 0 ? '#F2B866' : '#E9F7DF'), bg: me ? '#F2B866' : 'rgba(0,0,0,0)' };
    });
    // Namenseingabe: bis zu 8 Zeichen (A–Z, 0–9, Leerzeichen). Beispiel: 7 Zeichen eingegeben, Cursor auf Feld 8.
    const letters = ['K', 'I', 'D', 'S', 'L', 'A', 'B', ' '].map(function (ch, i) {
      const act = i === 7;
      return { ch: ch === ' ' ? '_' : ch, border: act ? '#F2B866' : '#3E6B55', color: act ? '#5E9A78' : '#E9F7DF', arrow: act ? '#F2B866' : 'rgba(0,0,0,0)' };
    });
    return {
      isTitle: screen === 'title', isPlay: screen === 'play', isName: screen === 'name', isBoard: screen === 'board',
      walls: walls, dots: dots, powers: powers, doors: doors,
      player: { x: pl.x, y: pl.y, e1: 1, e2: 3 },
      bugs: bugs,
      score: pad(7560), hi: pad(12480), lives: [{}, {}], rank: 3,
      legend: [{ c: '#F0A31B', name: 'SYNTAX' }, { c: '#C48BC4', name: 'NULL' }, { c: '#7FE0C2', name: 'LOOP' }, { c: '#4CC8F0', name: 'RACE' }],
      top3: board.slice(0, 3),
      board: board, letters: letters
    };
  }
}
export const DEFAULTS = {"screen":"play"};
export function vals(props) { return new Component({ ...DEFAULTS, ...props }).renderVals(); }
export function html(props, over = {}) {
  const v = { ...vals(props), ...over };
  return `<div style="width: 1152px; height: 792px; position: relative; overflow: hidden; background: #0E1A14; font-family: 'VT323', monospace; color: #E9F7DF">

${v.isPlay ? `<div style="position: absolute; left: 0px; top: 0px; width: 1152px; height: 792px">
<svg width="1152" height="792" viewBox="0 0 192 132" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" style="position: absolute; left: 0px; top: 0px; display: block">
${(v.walls || []).map((w) => `<g>
<rect x="${w.x}" y="${w.y}" width="6" height="6" fill="#2F5A46"></rect>
${w.edge ? `<rect x="${w.x}" y="${w.y}" width="6" height="1" fill="#5E9A78"></rect>
` : ''}
</g>
`).join('')}
${(v.doors || []).map((d) => `<rect x="${d.x}" y="${d.y2}" width="6" height="2" fill="#F07A7A"></rect>
`).join('')}
${(v.dots || []).map((d) => `<rect x="${d.x2}" y="${d.y2}" width="2" height="2" fill="#E9F7DF"></rect>
`).join('')}
${(v.powers || []).map((p) => `<g transform="translate(${p.x} ${p.y})">
<rect x="1" y="2" width="3" height="3" fill="#EDE0C8"></rect>
<rect x="1" y="2" width="3" height="1" fill="#5E3320"></rect>
<rect x="4" y="3" width="1" height="1" fill="#EDE0C8"></rect>
<rect x="2" y="0" width="1" height="1" fill="#F2B866"></rect>
<rect x="3" y="1" width="1" height="1" fill="#F2B866"></rect>
</g>
`).join('')}
<g transform="translate(${v.player.x} ${v.player.y})">
<rect x="0" y="0" width="6" height="6" fill="#FCE680" opacity="0.18"></rect>
<rect x="1" y="0" width="4" height="1" fill="#FCE680"></rect>
<rect x="0" y="1" width="6" height="3" fill="#FCE680"></rect>
<rect x="1" y="4" width="4" height="1" fill="#FCE680"></rect>
<rect x="${v.player.e1}" y="1" width="1" height="2" fill="#1A1512"></rect>
<rect x="${v.player.e2}" y="1" width="1" height="2" fill="#1A1512"></rect>
<rect x="2" y="5" width="2" height="1" fill="#F0A31B"></rect>
</g>
${(v.bugs || []).map((b) => `<g transform="translate(${b.x} ${b.y})">
<rect x="1" y="0" width="1" height="1" fill="${b.c}"></rect>
<rect x="4" y="0" width="1" height="1" fill="${b.c}"></rect>
<rect x="1" y="1" width="4" height="4" fill="${b.c}"></rect>
<rect x="0" y="2" width="1" height="1" fill="${b.c}"></rect><rect x="5" y="2" width="1" height="1" fill="${b.c}"></rect>
<rect x="0" y="4" width="1" height="1" fill="${b.c}"></rect><rect x="5" y="4" width="1" height="1" fill="${b.c}"></rect>
<rect x="1" y="5" width="1" height="1" fill="${b.c}"></rect><rect x="4" y="5" width="1" height="1" fill="${b.c}"></rect>
<rect x="2" y="2" width="1" height="1" fill="#EDE0C8"></rect><rect x="3" y="2" width="1" height="1" fill="#1A1512"></rect>
</g>
`).join('')}
</svg>
<div style="position: absolute; left: 0px; top: 0px; width: 1152px; height: 72px; box-sizing: border-box; padding: 0px 36px; display: flex; align-items: center; justify-content: space-between; font-family: 'Press Start 2P', monospace; font-size: 26px">
<div style="display: flex; gap: 18px"><span style="color: #7FA58A">SCORE</span><span>${v.score}</span></div>
<div style="display: flex; gap: 18px"><span style="color: #7FA58A">HI</span><span style="color: #F2B866">${v.hi}</span></div>
<div style="display: flex; gap: 12px; align-items: center">
${(v.lives || []).map((l) => `<svg width="36" height="42" viewBox="0 0 6 7" shape-rendering="crispEdges" style="display: block"><rect x="1" y="0" width="4" height="1" fill="#FCE680"></rect><rect x="0" y="1" width="6" height="4" fill="#FCE680"></rect><rect x="1" y="5" width="4" height="1" fill="#FCE680"></rect><rect x="2" y="6" width="2" height="1" fill="#F0A31B"></rect></svg>
`).join('')}
</div>
</div>
</div>
` : ''}

${v.isTitle ? `<div style="position: absolute; left: 0px; top: 0px; width: 1152px; height: 792px; box-sizing: border-box; padding: 84px 72px 60px; display: flex; flex-direction: column; align-items: center; gap: 30px">
<div style="font-family: 'Press Start 2P', monospace; font-size: 76px; line-height: 1; color: #F2B866; text-shadow: 0 0 18px rgba(242,184,102,0.5)">BUG-JAGD</div>
<div style="font-size: 36px; color: #7FA58A">Ein Hackday-Spiel aus dem KidsLab</div>
<div style="display: flex; gap: 56px; align-items: flex-end; margin-top: 22px">
<div style="display: flex; flex-direction: column; align-items: center; gap: 12px"><svg width="64" height="64" viewBox="0 0 8 8" shape-rendering="crispEdges" style="display: block"><rect x="2" y="0" width="4" height="1" fill="#FCE680"></rect><rect x="1" y="1" width="6" height="4" fill="#FCE680"></rect><rect x="2" y="5" width="4" height="1" fill="#FCE680"></rect><rect x="3" y="2" width="1" height="2" fill="#1A1512"></rect><rect x="5" y="2" width="1" height="2" fill="#1A1512"></rect><rect x="3" y="6" width="2" height="1" fill="#F0A31B"></rect><rect x="3" y="7" width="2" height="1" fill="#4CC8F0"></rect></svg><div style="font-size: 30px; color: #FCE680">DU</div></div>
<div style="display: flex; flex-direction: column; align-items: center; gap: 12px"><svg width="64" height="64" viewBox="0 0 8 8" shape-rendering="crispEdges" style="display: block"><rect x="2" y="3" width="4" height="4" fill="#EDE0C8"></rect><rect x="2" y="3" width="4" height="1" fill="#5E3320"></rect><rect x="6" y="4" width="1" height="2" fill="#EDE0C8"></rect><rect x="3" y="1" width="1" height="1" fill="#F2B866"></rect><rect x="4" y="0" width="1" height="1" fill="#F2B866"></rect></svg><div style="font-size: 30px; color: #EDE0C8">KAFFEE</div></div>
${(v.legend || []).map((g) => `<div style="display: flex; flex-direction: column; align-items: center; gap: 12px"><svg width="64" height="64" viewBox="0 0 8 8" shape-rendering="crispEdges" style="display: block"><rect x="2" y="0" width="1" height="1" fill="${g.c}"></rect><rect x="5" y="0" width="1" height="1" fill="${g.c}"></rect><rect x="3" y="1" width="2" height="1" fill="${g.c}"></rect><rect x="2" y="2" width="4" height="5" fill="${g.c}"></rect><rect x="1" y="3" width="6" height="3" fill="${g.c}"></rect><rect x="3" y="3" width="1" height="1" fill="#EDE0C8"></rect><rect x="5" y="3" width="1" height="1" fill="#EDE0C8"></rect><rect x="0" y="3" width="1" height="1" fill="${g.c}"></rect><rect x="7" y="3" width="1" height="1" fill="${g.c}"></rect><rect x="0" y="5" width="1" height="1" fill="${g.c}"></rect><rect x="7" y="5" width="1" height="1" fill="${g.c}"></rect><rect x="1" y="7" width="1" height="1" fill="${g.c}"></rect><rect x="6" y="7" width="1" height="1" fill="${g.c}"></rect></svg><div style="font-size: 30px; color: ${g.c}">${g.name}</div></div>
`).join('')}
</div>
<div style="font-size: 30px; color: #B8E0A8; text-align: center; line-height: 1.3">Sammle alle Bits. Weich den Bugs aus.<br>Kaffee macht die Bugs für 8 Sekunden fangbar.</div>
<div style="display: flex; gap: 40px; font-family: 'Press Start 2P', monospace; font-size: 20px; color: #7FA58A">
${(v.top3 || []).map((t) => `<span>${t.rank}. ${t.name} ${t.score}</span>
`).join('')}
</div>
<div style="margin-top: auto; font-family: 'Press Start 2P', monospace; font-size: 30px; color: #F2B866">ENTER = START</div>
<div style="font-size: 28px; color: #7FA58A">Pfeiltasten laufen · P Pause · ESC zurück zum Dashboard</div>
</div>
` : ''}

${v.isName ? `<div style="position: absolute; left: 0px; top: 0px; width: 1152px; height: 792px; box-sizing: border-box; padding: 96px 72px 64px; display: flex; flex-direction: column; align-items: center; gap: 34px">
<div style="font-family: 'Press Start 2P', monospace; font-size: 64px; color: #F07A7A; text-shadow: 0 0 16px rgba(240,122,122,0.5)">GAME OVER</div>
<div style="font-family: 'Press Start 2P', monospace; font-size: 34px">SCORE ${v.score}</div>
<div style="font-size: 40px; color: #F2B866">Platz ${v.rank} in der Rangliste – trag dich ein!</div>
<div style="display: flex; gap: 14px; margin-top: 16px">
${(v.letters || []).map((l) => `<div style="display: flex; flex-direction: column; align-items: center; gap: 10px">
<div style="font-size: 30px; color: ${l.arrow}">▲</div>
<div style="width: 104px; height: 120px; box-sizing: border-box; border: 6px solid ${l.border}; display: flex; align-items: center; justify-content: center; font-family: 'Press Start 2P', monospace; font-size: 56px; color: ${l.color}">${l.ch}</div>
<div style="font-size: 30px; color: ${l.arrow}">▼</div>
</div>
`).join('')}
</div>
<div style="margin-top: auto; font-size: 30px; color: #7FA58A">Name bis 8 Zeichen · ↑ ↓ Zeichen · ← → Feld · ENTER speichern · ESC ohne Eintrag</div>
</div>
` : ''}

${v.isBoard ? `<div style="position: absolute; left: 0px; top: 0px; width: 1152px; height: 792px; box-sizing: border-box; padding: 64px 150px 48px; display: flex; flex-direction: column; gap: 14px">
<div style="font-family: 'Press Start 2P', monospace; font-size: 52px; color: #F2B866; text-align: center; margin-bottom: 18px">RANGLISTE</div>
${(v.board || []).map((r) => `<div style="display: flex; justify-content: space-between; font-family: 'Press Start 2P', monospace; font-size: 30px; line-height: 1.45; color: ${r.color}; background: ${r.bg}; padding: 0px 16px">
<span style="width: 90px">${r.rank}.</span><span style="flex-grow: 1">${r.name}</span><span>${r.score}</span>
</div>
`).join('')}
<div style="margin-top: auto; font-size: 28px; color: #7FA58A; text-align: center">Gespeichert auf diesem Gerät · ENTER nochmal · ESC zurück</div>
</div>
` : ''}

<div style="position: absolute; left: 0px; top: 0px; width: 1152px; height: 792px; pointer-events: none; background: repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 3px, rgba(0,0,0,0) 3px, rgba(0,0,0,0) 6px)"></div>
</div>`;
}
