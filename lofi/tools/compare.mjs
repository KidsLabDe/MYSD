// Screenshot-Vergleich: design/*.dc.html (Referenz-Renderer) vs. Build (?ref), 1920×1080
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:5173';
const out = 'tools/diff'; mkdirSync(out, { recursive: true });
const cases = [{}];
for (const weather of ['sonnig', 'bewoelkt', 'regen', 'schnee', 'gewitter', 'nacht']) cases.push({ weather });
for (const blinds of [0, 10, 70, 100]) cases.push({ blinds });
for (const pose of ['stand', 'walkA', 'walkB', 'strike', 'grab', 'pullA', 'pullB']) cases.push({ pose });
for (const state of ['endspurt', 'pause', 'ende', 'arcade']) cases.push({ state });
for (const poster of ['gerahmt', 'banner', 'duoton']) cases.push({ poster });
cases.push({ poster: 'papier', weather: 'nacht' }, { poster: 'papier', blinds: 0 }, { poster: 'gerahmt', weather: 'nacht' });
for (const pose of ['stepA', 'stepB']) cases.push({ pose }, { pose, standOn: pose === 'stepB' ? 'stufe' : 'boden', personX: 1284, layer: 'ganzVorne' });
for (const arm of ['steil', 'flach', 'waagrecht', 'leichtRunter', 'runter', 'up', 'diag', 'down']) cases.push({ pose: 'walkA', arm, armDy: -1, personX: 1188, layer: 'ganzVorne' });
cases.push({ pose: 'stand', arm: 'steil', standOn: 'bank', personX: 1236, layer: 'ganzVorne' }, { weather: 'nacht', layer: 'ganzVorne', personX: 1200, arm: 'flach' }, { layer: 'ganzVorne', personX: 462, pose: 'grab', marker: false });
// Update 2–5: Blickrichtungen, Gesicht, linker Arm, Halten, Tasse, Drucker
for (const view of ['right', 'left']) for (const pose of ['stand', 'walkA', 'walkB']) cases.push({ view, pose, layer: 'ganzVorne', personX: 1200, marker: false });
cases.push({ view: 'right', pose: 'walkA', holding: 'bulb', layer: 'ganzVorne', personX: 516 }, { view: 'left', pose: 'walkB', holding: 'cup', layer: 'ganzVorne', personX: 840 });
for (const face of ['auto', 'neutral', 'smile', 'grin', 'blink']) cases.push({ view: 'front', pose: 'stand', face, layer: 'ganzVorne', personX: 1500 });
for (const pose of ['waveA', 'waveB', 'cupLow', 'cupDrink']) cases.push({ view: 'front', pose, layer: 'ganzVorne', personX: 1500 });
for (const holding of ['none', 'bulb', 'cube', 'rocket', 'heart', 'cup']) cases.push({ armLeft: 'greifen', holding, pose: 'stand', layer: 'ganzVorne', personX: 456 });
cases.push({ armLeft: 'druecken', pose: 'stand', layer: 'ganzVorne', personX: 348 }, { cupOnDesk: false }, { weather: 'nacht', view: 'front', pose: 'waveA', layer: 'ganzVorne', personX: 1500 });
for (const printState of ['printing', 'done', 'empty']) cases.push({ printState });
for (const printLayer of [0, 1, 4, 8]) for (const printObj of ['bulb', 'rocket', 'heart', 'cube']) cases.push({ printLayer, printObj, printHeadX: printLayer - 4 });
cases.push({ struck: 0 }, { struck: 8 }, { personX: 462 }, { personX: 1386 }, { marker: false }, { showPerson: false }, { weather: 'nacht', blinds: 100 });

const browser = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const shot = async (url) => { await page.goto(url); await page.waitForSelector('body[data-ready="1"]', { state: 'attached' }); await page.waitForTimeout(150); return PNG.sync.read(await page.screenshot()); };
let fails = 0;
for (const c of cases) {
  const ref = await shot(`${BASE}/tools/ref.html?name=Main&props=${encodeURIComponent(JSON.stringify(c))}`);
  const p = new URLSearchParams({ ref: '' });
  for (const [k, v] of Object.entries(c)) p.set(k === 'personX' ? 'x' : k === 'showPerson' ? 'person' : k, typeof v === 'boolean' ? (v ? '1' : '0') : String(v));
  const mine = await shot(`${BASE}/?${p}`);
  const diff = new PNG({ width: 1920, height: 1080 });
  const n = pixelmatch(ref.data, mine.data, diff.data, 1920, 1080, { threshold: 0 });
  const name = JSON.stringify(c).replace(/[^a-z0-9]+/gi, '_') || 'default';
  if (n) { fails++; writeFileSync(`${out}/${name}.diff.png`, PNG.sync.write(diff)); writeFileSync(`${out}/${name}.ref.png`, PNG.sync.write(ref)); writeFileSync(`${out}/${name}.mine.png`, PNG.sync.write(mine)); }
  console.log(`${n === 0 ? 'OK  ' : 'DIFF'} ${String(n).padStart(7)} px  ${JSON.stringify(c)}`);
}
await browser.close();
console.log(fails ? `${fails} Abweichungen` : 'Alle deckungsgleich');
