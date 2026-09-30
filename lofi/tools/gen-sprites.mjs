// Erzeugt src/generated/*.ts wörtlich aus design/*.dc.html (SVG/HTML + renderVals()).
// Aufruf: node tools/gen-sprites.mjs   (nach jeder Designänderung an Person, Printer3D, Room_Front)
// Regeln: nur der ERSTE <x-dc>-Block und das ERSTE <script type="text/x-dc"> zählen (Printer3D enthält eine alte Zweitfassung).
import { readFileSync, writeFileSync } from 'node:fs';

function extract(name) {
  const src = readFileSync(`design/${name}.dc.html`, 'utf8');
  const x0 = src.indexOf('<x-dc>'), x1 = src.indexOf('</x-dc>', x0);
  let markup = src.slice(x0 + 6, x1).replace(/<helmet>[\s\S]*?<\/helmet>/, '').trim();
  const s0 = src.indexOf('<script type="text/x-dc"'), sEnd = src.indexOf('</script>', s0);
  const tag = src.slice(s0, src.indexOf('>', s0) + 1);
  const props = JSON.parse((tag.match(/data-props='([^']*)'/) || [, '{}'])[1]);
  const cls = src.slice(src.indexOf('>', s0) + 1, sEnd).trim();
  return { markup, props, cls };
}

function toTemplate(markup) {
  let m = markup.replace(/<!--[\s\S]*?-->\n?/g, '');
  if (m.includes('`') || m.includes('${')) throw new Error('Backtick im Markup');
  // Tokenweise: sc-if / sc-for (auch verschachtelt) und {{ausdruck}}; Schleifenvariablen ohne v.-Präfix
  const scope = [], stack = [];
  const ref = (e) => { e = e.trim(); const head = e.split('.')[0]; return /^[\d'"]/.test(e) || scope.includes(head) ? e : 'v.' + e; };
  m = m.replace(/<sc-if value="\{\{([^}]*)\}\}"[^>]*>\n?|<\/sc-if>|<sc-for list="\{\{([^}]*)\}\}" as="(\w+)"[^>]*>\n?|<\/sc-for>|\{\{([^}]*)\}\}/g,
    (t, ifE, forE, as, expr) => {
      if (ifE !== undefined) { stack.push('if'); return '${' + ref(ifE) + ' ? `'; }
      if (t === '</sc-if>') { stack.pop(); return "` : ''}"; }
      if (forE !== undefined) { const l = ref(forE); scope.push(as); stack.push('for'); return '${(' + l + ' || []).map((' + as + ') => `'; }
      if (t === '</sc-for>') { stack.pop(); scope.pop(); return "`).join('')}"; }
      return '${' + ref(expr) + '}';
    });
  if (stack.length || /\{\{|dc-import/.test(m)) throw new Error('Nicht unterstütztes Konstrukt');
  return m;
}

function gen(name, { patch } = {}) {
  const { markup, props, cls } = extract(name);
  let tpl = toTemplate(markup);
  if (patch) tpl = patch(tpl);
  const defaults = Object.fromEntries(Object.entries(props).filter(([k]) => !k.startsWith('$')).map(([k, d]) => [k, d.default]));
  const out = `// @ts-nocheck
// AUTOMATISCH ERZEUGT aus design/${name}.dc.html durch tools/gen-sprites.mjs – nicht von Hand ändern.
class DCLogic { constructor(props) { this.props = props; } }
${cls}
export const DEFAULTS = ${JSON.stringify(defaults)};
export function vals(props) { return new Component({ ...DEFAULTS, ...props }).renderVals(); }
export function html(props, over = {}) {
  const v = { ...vals(props), ...over };
  return \`${tpl}\`;
}
`;
  writeFileSync(`src/generated/${name}.ts`, out);
  console.log(`src/generated/${name}.ts  (${tpl.length} Zeichen, Props: ${Object.keys(defaults).join(', ')})`);
}

gen('Person', {
  // Einzige Ergänzung: Dampf über der Tasse (cupLow) wippt im 400-ms-Takt 1 px (Tafel Kaffee_Pause) → steamDy
  patch: (t) => {
    const steam = '<rect x="16" y="30" width="1" height="2" fill="#FFF4D8" opacity="0.5"></rect><rect x="18" y="28" width="1" height="2" fill="#FFF4D8" opacity="0.4"></rect>';
    if (!t.includes(steam)) throw new Error('Dampf-Pixel nicht gefunden');
    return t.replace(steam, '<g transform="translate(0 ${v.steamDy || 0})">' + steam + '</g>');
  },
});
gen('Printer3D');
gen('Room_Front');
gen('Arcade');
