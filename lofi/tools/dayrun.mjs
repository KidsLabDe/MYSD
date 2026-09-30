// Ganzer Tag im Testmodus: jede Zeile wird abgehakt (Strich wächst 2→62 px, Figur mitgehend, Bank bei Zeile 0/1),
// Jalousie folgt der Konfiguration und wird vor dem Tisch bedient. Aufruf: node tools/dayrun.mjs [speed] [event.json]
// MYSD-Version: MYSD_DATE=2026-09-28 BASE=http://localhost:8088/ node tools/dayrun.mjs 120 (Plan aus MYSD_DATA, offline)
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const BASE = process.env.BASE || 'http://localhost:5173/';
const speed = process.argv[2] || '120', ev = process.argv[3] || '', extra = process.argv[4] || '';
const MYSD_DATE = process.env.MYSD_DATE;
const KIND_BLINDS = { phase: 0, meal: 50, break: 50, talk: 100 };
const cfg = MYSD_DATE
  ? (() => { const d = JSON.parse(readFileSync(process.env.MYSD_DATA || '../src/data/hackday.json', 'utf8')).days.find((x) => x.date === MYSD_DATE);
      return { phases: [...d.schedule].sort((a, b) => a.start.localeCompare(b.start)).map((i) => ({ start: i.start, blinds: KIND_BLINDS[i.kind] })) }; })()
  : JSON.parse(readFileSync('public/' + (ev || 'event.json'), 'utf8'));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
const [h, m] = cfg.phases[0].start.split(':').map(Number);
const t = new Date(2000, 0, 1, h, m - 1); const now = `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
await p.goto(`${BASE}?speed=${speed}&now=${now}${ev ? '&event=' + ev : ''}${MYSD_DATE ? '&offline&date=' + MYSD_DATE : ''}${extra}`);
await p.waitForSelector('body[data-ready="1"]', { state: 'attached' });
// Zustand im Browser jede Frame mitschreiben (nichts verpassen)
await p.evaluate(() => {
  const h = window.__hackday, log = (window.__log = { rows: {}, anims: 0, xs: new Set(), blindsLayer: new Set(), blindsAt: {}, seen: [], kinds: {}, cancels: 0, maxWaitPhase: 0, cupWrong: 0, holdWrong: 0, idleLate: 0, repeats: 0, lastCat: null, maxIdleAfterPend: 0, printerStates: new Set(), objs: new Set() });
  let busy = false, last = -1, cur = null, pendingSince = null;
  const tick = () => {
    const a = h.a, d = a.draw;
    if (h.busy && !busy) log.anims++;
    busy = h.busy;
    // Protokoll: Art der Sequenz, Abbrüche, Wartezeit bis zum Abhaken, Tasse/Teil konsistent
    if (h.current !== cur) { if (cur === 'phase') log.blindsAt[a.idx] = a.blinds; if (cur && h.current && cur !== h.current) log.cancels++; if (h.current) { log.kinds[h.current] = (log.kinds[h.current] || 0) + 1; if (h.current !== 'phase' && h.current !== 'blinds') { const c = h.current.startsWith('print') ? 'printer' : h.current; if (c === log.lastCat) log.repeats++; log.lastCat = c; } } cur = h.current; }
    const pend = h.L.idx !== a.idx;
    if (pend && pendingSince === null) pendingSince = performance.now();
    if (h.current === 'phase' && pendingSince !== null) { log.maxWaitPhase = Math.max(log.maxWaitPhase, performance.now() - pendingSince); pendingSince = null; }
    if (!pend) pendingSince = null;
    const idleKind = h.current && h.current !== 'phase' && h.current !== 'blinds';
    if (pend && idleKind && pendingSince !== null) log.maxIdleAfterPend = Math.max(log.maxIdleAfterPend, performance.now() - pendingSince);
    if (h.current !== 'coffee' && !a.cupOnDesk) log.cupWrong++;
    if (!a.person.visible && a.person.holding !== 'none') log.holdWrong++;
    log.printerStates.add(h.printer.state); log.objs.add(h.printer.obj);
    if (a.person.visible) log.xs.add(a.person.x);
    if (d) { const r = (log.rows[d.row] ??= { lens: new Set(), tops: new Set(), layers: new Set() }); r.lens.add(d.len); r.tops.add(a.person.top); r.layers.add(a.person.layer); }
    if (a.holding) log.blindsLayer.add(a.person.layer);
    if (a.idx !== last) { log.seen.push(a.idx); last = a.idx; }
    requestAnimationFrame(tick);
  };
  tick();
});
for (;;) {
  const done = await p.evaluate(() => { const h = window.__hackday; return h.L.ende && h.a.struck === h.L.n && !h.busy; });
  if (done) break;
  await p.waitForTimeout(500);
}
const r = await p.evaluate(() => { const l = window.__log; return {
  maxIdleAfterPend: Math.round(l.maxIdleAfterPend), repeats: l.repeats, kinds: l.kinds, cancels: l.cancels, maxWaitPhase: Math.round(l.maxWaitPhase), cupWrong: l.cupWrong, holdWrong: l.holdWrong, printerStates: [...l.printerStates], objs: [...l.objs],
  seen: l.seen, anims: l.anims, nonGrid: [...l.xs].filter((x) => x % 6), blindsLayer: [...l.blindsLayer], blindsAt: l.blindsAt,
  rows: Object.fromEntries(Object.entries(l.rows).map(([k, v]) => { const lens = [...v.lens].sort((a, b) => a - b); return [k, { lens: `${lens.length} Schritte ${lens[0]}–${lens[lens.length - 1]}`, lückenlos: lens.length === lens[lens.length - 1] - lens[0] + 1, tops: [...v.tops], ebene: [...v.layers] }]; })) }; });
await b.close();
console.log('angezeigte Phasen:', r.seen.join(' → '), '· Animationen:', r.anims);
console.table(r.rows);
console.log('Jalousie nach dem Abhaken je Phase:', JSON.stringify(r.blindsAt), 'erwartet:', cfg.phases.map((x) => x.blinds).join(','));
console.log('Ebene beim Jalousie-Ziehen:', r.blindsLayer.join(', ') || '—');
console.log('Person-x außerhalb 6-px-Raster:', r.nonGrid.length ? r.nonGrid : 'keine');
console.log('Sequenzen:', JSON.stringify(r.kinds), '· gleiche Leerlauf-Kategorie zweimal hintereinander:', r.repeats);
console.log('längste Wartezeit Phasenwechsel → Abhaken beginnt:', r.maxWaitPhase, 'ms · Leerlauf lief nach Phasenwechsel noch max.', r.maxIdleAfterPend, 'ms');
console.log('Tasse fehlt außerhalb der Kaffeepause (Frames):', r.cupWrong, '· Figur weg, hält aber noch etwas (Frames):', r.holdWrong);
console.log('Drucker-Zustände gesehen:', r.printerStates.join(', '), '· Objekte:', r.objs.join(', '));
console.log('Fehler:', errs.length ? errs : 'keine');
