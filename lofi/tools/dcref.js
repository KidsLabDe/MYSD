// Referenz-Renderer für design/*.dc.html (nur für Tests).
// Führt renderVals() aus und löst {{…}}, sc-if, sc-for und dc-import auf –
// so, wie der Design-Canvas es tut. support.js liegt nicht im Handoff.
const SVGNS = 'http://www.w3.org/2000/svg';
const cache = {};

export const opts = { overlay: true };

// Nur für Tests: design/ ist noch nicht mit design-update/ zusammengeführt. Poster (Room_Back) und
// Hoodie-Logo (Person) werden hier im Speicher ergänzt, damit der Vergleich zum Code (der beides hat) passt.
async function withOverlay(name, txt) {
  if (!opts.overlay) return txt;
  if (name === 'Room_Back' && !txt.includes('name="Poster"')) {
    const poster = '<div style="position: absolute; left: 972px; top: 30px">\n<dc-import name="Poster" variant="{{poster}}" hint-size="378px,288px"></dc-import>\n</div>\n';
    txt = txt.replace('<div style="position: absolute; left: 0px; top: 0px">\n<dc-import name="Window"', poster + '<div style="position: absolute; left: 0px; top: 0px">\n<dc-import name="Window"');
    txt = txt.replace("blinds: this.props.blinds ?? 40 }", "blinds: this.props.blinds ?? 40, poster: this.props.poster ?? 'papier' }");
  }
  if (name === 'Person' && !txt.includes('hoodie-logo')) {
    const upd = await (await fetch('/design-update/Person.dc.html')).text();
    const logo = upd.match(/<g id="hoodie-logo">[\s\S]*?\n<\/g>\n(?=<rect x="10" y="11")/)[0];
    txt = txt.replace('<rect x="17" y="38" width="10" height="7" fill="#E0A94A"></rect>\n<rect x="19" y="41" width="6" height="1" fill="#C4493A"></rect>\n', logo);
  }
  return txt;
}

async function load(name) {
  if (!cache[name]) {
    // design/Poster.dc.html lädt ./assets/… (relativ zu design/) → hier aus public/assets (gleiche PNGs)
    const txt = await withOverlay(name, (await (await fetch(`/design/${name}.dc.html`)).text()).replaceAll('./assets/', '/assets/'));
    const doc = new DOMParser().parseFromString(txt, 'text/html');
    const xdc = doc.querySelector('x-dc');
    const script = doc.querySelector('script[type="text/x-dc"]');
    const defs = JSON.parse(script.getAttribute('data-props') || '{}');
    const Base = class { constructor(p) { this.props = p; } };
    const Cls = new Function('DCLogic', script.textContent + '\nreturn Component;')(Base);
    cache[name] = { xdc, Cls, defs };
  }
  return cache[name];
}

function ev(expr, scope) {
  return new Function('s', `with (s) { return (${expr}); }`)(scope);
}
function subst(str, scope) {
  const m = str.match(/^\s*\{\{([\s\S]+?)\}\}\s*$/);
  if (m) return ev(m[1], scope);
  return str.replace(/\{\{([\s\S]+?)\}\}/g, (_, e) => String(ev(e, scope)));
}

async function kids(src, dst, scope) {
  for (const ch of [...src.childNodes]) await expand(ch, dst, scope);
}

async function expand(n, dst, scope) {
  if (n.nodeType === 3) {
    dst.appendChild(document.createTextNode(n.nodeValue.replace(/\{\{([\s\S]+?)\}\}/g, (_, e) => String(ev(e, scope)))));
    return;
  }
  if (n.nodeType !== 1) return;
  const tag = n.localName;
  if (tag === 'helmet') return;
  if (tag === 'sc-if') { if (subst(n.getAttribute('value'), scope)) await kids(n, dst, scope); return; }
  if (tag === 'sc-for') {
    const list = subst(n.getAttribute('list'), scope);
    const as = n.getAttribute('as');
    for (const it of list) await kids(n, dst, { ...scope, [as]: it });
    return;
  }
  if (tag === 'dc-import') {
    const props = {};
    for (const a of n.attributes) {
      if (a.name === 'name' || a.name.startsWith('hint-')) continue;
      props[a.name.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = subst(a.value, scope);
    }
    dst.appendChild(await renderDc(n.getAttribute('name'), props));
    return;
  }
  const el = n.namespaceURI === SVGNS ? document.createElementNS(SVGNS, tag) : document.createElement(tag);
  for (const a of n.attributes) el.setAttribute(a.name, String(subst(a.value, scope)));
  await kids(n, el, scope);
  dst.appendChild(el);
}

export async function logic(name, props = {}) {
  const c = await load(name);
  return new c.Cls(props).renderVals();
}

export async function renderDc(name, props = {}) {
  const c = await load(name);
  const p = {};
  for (const [k, d] of Object.entries(c.defs)) if (!k.startsWith('$')) p[k] = d.default;
  Object.assign(p, props);
  const vals = new c.Cls(p).renderVals();
  const frag = document.createDocumentFragment();
  await kids(c.xdc, frag, vals);
  return frag.firstElementChild;
}
