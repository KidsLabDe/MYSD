// Bug-Jagd: Bildschirme (Beispielzustand) und Zoom-Endbild gegen design/Arcade.dc.html + Arcade_Ablauf
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { mkdirSync, writeFileSync } from 'node:fs';
const BASE = process.env.BASE || 'http://localhost:5173';
mkdirSync('tools/diff', { recursive: true });
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const shot = async (url, clip, wait = 700) => { await page.goto(url); await page.waitForSelector('body[data-ready="1"]', { state: 'attached' }); await page.waitForTimeout(wait); return PNG.sync.read(await page.screenshot({ clip })); };
let fails = 0, total = 0;
const cmp = async (label, a, b2) => {
  total++;
  const diff = new PNG({ width: a.width, height: a.height });
  const n = pixelmatch(a.data, b2.data, diff.data, a.width, a.height, { threshold: 0 });
  let maxd = 0; for (let i = 0; i < a.data.length; i += 4) for (let k = 0; k < 3; k++) maxd = Math.max(maxd, Math.abs(a.data[i + k] - b2.data[i + k]));
  if (maxd > 2) { fails++; const f = label.replace(/[^a-z0-9]+/gi, '_'); writeFileSync(`tools/diff/${f}.ref.png`, PNG.sync.write(a)); writeFileSync(`tools/diff/${f}.mine.png`, PNG.sync.write(b2)); writeFileSync(`tools/diff/${f}.diff.png`, PNG.sync.write(diff)); }
  console.log(`${maxd > 2 ? 'DIFF' : 'OK  '} ${String(n).padStart(6)} px, max. Farbabweichung ${maxd}/255  ${label}`);
};
// Sichtbarer Bereich im Rahmen: 1152×768 (Innenrand schneidet unten 24 px ab, wie im Design)
const IN = { x: 384, y: 144, width: 1152, height: 768 };
for (const s of ['title', 'play', 'name', 'board']) {
  const ref = await shot(`${BASE}/tools/ref.html?name=ArcadeScreen&screen=${s}`, IN, 200);
  await cmp(`Arcade ${s}`, ref, await shot(`${BASE}/?arcade=${s}&demo`, IN));
}
// Spielfeld per Canvas (Beispielzustand) gegen das SVG des Designs – nur das Labyrinth unter dem HUD
// (über einem Canvas glättet Chromium den HUD-Text in Graustufen statt farbiger Subpixel-Kanten; das HUD ist oben schon geprüft)
{
  const MAZE = { x: 384, y: 144 + 72, width: 1152, height: 768 - 72 };
  const ref = await shot(`${BASE}/tools/ref.html?name=ArcadeScreen&screen=play`, MAZE, 200);
  await cmp('Arcade play · Canvas (Labyrinth)', ref, await shot(`${BASE}/?arcade=play&demo=canvas`, MAZE));
}
// Zoom-Endbild: kompletter Monitor-Rahmen 1248×888 bei 336/96
{
  const clip = { x: 336, y: 96, width: 1248, height: 888 };
  await cmp('Zoom-Rahmen (Titel)', await shot(`${BASE}/tools/ref.html?name=ArcadeFrame&screen=title`, clip, 200), await shot(`${BASE}/?arcade=title&demo`, clip));
}
await b.close();
console.log(fails ? `${fails} von ${total} weichen ab` : `Alle ${total} deckungsgleich`);
