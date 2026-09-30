// Tafeln Person_Ansichten (9), Drucker_Zyklus (10), Kaffee_Pause (8): Referenz (design/) gegen Code, im Ausschnitt der Tafel
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { mkdirSync, writeFileSync } from 'node:fs';
const BASE = process.env.BASE || 'http://localhost:5173';
mkdirSync('tools/diff', { recursive: true });
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const shot = async (url, clip) => { await page.goto(url); await page.waitForSelector('body[data-ready="1"]', { state: 'attached' }); await page.waitForTimeout(150); return PNG.sync.read(await page.screenshot({ clip })); };
let fails = 0, total = 0;
const cmp = async (label, refUrl, mineUrl, clip) => {
  total++;
  const ref = await shot(refUrl, clip), mine = await shot(mineUrl, clip);
  const diff = new PNG({ width: clip.width, height: clip.height });
  const n = pixelmatch(ref.data, mine.data, diff.data, clip.width, clip.height, { threshold: 0 });
  if (n) { fails++; const f = label.replace(/[^a-z0-9]+/gi, '_'); writeFileSync(`tools/diff/${f}.ref.png`, PNG.sync.write(ref)); writeFileSync(`tools/diff/${f}.mine.png`, PNG.sync.write(mine)); writeFileSync(`tools/diff/${f}.diff.png`, PNG.sync.write(diff)); }
  console.log(`${n ? 'DIFF' : 'OK  '} ${String(n).padStart(6)} px  ${label}`);
};
// Person_Ansichten
const cells = [['left', 'walkA', 'auto'], ['left', 'walkB', 'auto'], ['left', 'stand', 'auto'], ['right', 'walkA', 'auto'], ['right', 'stand', 'auto'], ['front', 'stand', 'smile'], ['front', 'waveA', 'grin'], ['front', 'waveB', 'grin'], ['front', 'stand', 'blink']];
for (const [view, pose, face] of cells) {
  const props = encodeURIComponent(JSON.stringify({ view, pose, face }));
  await cmp(`Person_Ansichten ${view} ${pose} ${face}`, `${BASE}/tools/ref.html?name=Sprite&props=${props}`, `${BASE}/tools/ref.html?name=Sprite&mine=1&props=${props}`, { x: 0, y: 0, width: 400, height: 720 });
}
// Drucker_Zyklus (Ausschnitt x 0–130 / y 40–170 Szenenpixel) und Kaffee_Pause (x 60–190 / y 40–170)
for (const [board, count, clip] of [['Drucker_Zyklus', 10, { x: 0, y: 240, width: 780, height: 780 }], ['Kaffee_Pause', 8, { x: 360, y: 240, width: 780, height: 780 }]]) {
  for (let i = 0; i < count; i++) {
    const refUrl = `${BASE}/tools/ref.html?name=BoardFrame&board=${board}&i=${i}`;
    await page.goto(refUrl); await page.waitForSelector('body[data-ready="1"]', { state: 'attached' });
    const f = JSON.parse(await page.evaluate(() => document.body.dataset.frame));
    const p = new URLSearchParams({ ref: '', weather: 'sonnig', blinds: '40', layer: 'ganzVorne', marker: '0', pose: f.pose ?? 'stand', view: f.view ?? 'back', armLeft: f.armLeft ?? 'down', holding: f.holding ?? 'none' });
    if (board === 'Drucker_Zyklus') { p.set('printState', f.state); p.set('printLayer', f.layer); p.set('printHeadX', f.hx); p.set('printObj', f.obj); p.set('x', f.px); if (!f.person) p.set('person', '0'); }
    else { p.set('printState', 'printing'); p.set('printLayer', 4); p.set('printHeadX', 0); p.set('printObj', 'bulb'); p.set('cupOnDesk', f.cup ? '1' : '0'); p.set('face', f.face); p.set('x', f.px); }
    await cmp(`${board} ${f.title}`, refUrl, `${BASE}/?${p}`, clip);
  }
}
await b.close();
console.log(fails ? `${fails} von ${total} weichen ab` : `Alle ${total} deckungsgleich`);
