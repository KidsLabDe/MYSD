// Tafel design/Kalender_Abhaken.dc.html: 16 Frames (8 Zeilen × Anfang/Ende) + 7 Auf-/Absteige-Frames, 1:1 gegen den Code
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { mkdirSync, writeFileSync } from 'node:fs';
const BASE = process.env.BASE || 'http://localhost:5173';
mkdirSync('tools/diff', { recursive: true });
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const shot = async (url) => { await page.goto(url); await page.waitForSelector('body[data-ready="1"]', { state: 'attached' }); await page.waitForTimeout(150); return PNG.sync.read(await page.screenshot()); };
let fails = 0;
for (const [kind, count] of [['frame', 16], ['step', 7]]) {
  for (let i = 0; i < count; i++) {
    const ref = await shot(`${BASE}/tools/ref.html?name=AbhakenFrame&kind=${kind}&i=${i}`);
    const f = JSON.parse(await page.evaluate(() => document.body.dataset.frame));
    const p = new URLSearchParams({ ref: '', weather: 'sonnig', blinds: '40', state: 'laeuft', layer: 'ganzVorne', marker: '1', printer: '0', smallPlant: '1' });
    if (kind === 'frame') { p.set('struck', f.row); p.set('drawRow', f.row); p.set('drawLen', f.n); p.set('pose', 'stand'); p.set('arm', f.arm); p.set('armDy', f.armDy); p.set('x', f.leftPx); p.set('top', f.topPx); }
    else { p.set('struck', 0); p.set('pose', f.pose); p.set('x', 1284); p.set('top', f.topPx); }
    const mine = await shot(`${BASE}/?${p}`);
    const diff = new PNG({ width: 1920, height: 1080 });
    const n = pixelmatch(ref.data, mine.data, diff.data, 1920, 1080, { threshold: 0 });
    if (n) { fails++; writeFileSync(`tools/diff/abhaken_${kind}${i}.diff.png`, PNG.sync.write(diff)); writeFileSync(`tools/diff/abhaken_${kind}${i}.ref.png`, PNG.sync.write(ref)); writeFileSync(`tools/diff/abhaken_${kind}${i}.mine.png`, PNG.sync.write(mine)); }
    console.log(`${n ? 'DIFF' : 'OK  '} ${String(n).padStart(6)} px  ${f.title}  ${f.info}`);
  }
}
await b.close();
console.log(fails ? `${fails} Abweichungen` : 'Alle 23 Frames deckungsgleich');
