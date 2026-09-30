// dist/index.html per file:// öffnen: online (Wetter), offline, und Pixelvergleich mit der Referenz
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { resolve } from 'node:path';
const file = 'file://' + resolve('dist/index.html');
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
for (const offline of [false, true]) {
  const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 } });
  if (offline) await ctx.route(/^https?:/, (r) => r.abort());
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(file + '?now=10:10'); await p.waitForTimeout(4000);
  const s = await p.evaluate(() => ({ phases: window.__hackday.L.n, idx: window.__hackday.L.idx, w: window.__hackday.weather.status, fonts: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family).join(',') }));
  console.log(offline ? 'OFFLINE' : 'ONLINE ', JSON.stringify(s), 'Fehler:', errs.length ? errs : 'keine');
  await p.screenshot({ path: offline ? '/tmp/file-off.png' : '/tmp/file-on.png' });
  await ctx.close();
}
// Pixelvergleich: Build (file://?ref) gegen Referenz-Renderer (Dev-Server)
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto(file + '?ref'); await p.waitForTimeout(1500);
const mine = PNG.sync.read(await p.screenshot());
await p.goto('http://localhost:5173/tools/ref.html?name=Main'); await p.waitForSelector('body[data-ready="1"]', { state: 'attached' }); await p.waitForTimeout(300);
const ref = PNG.sync.read(await p.screenshot());
console.log('Build vs. Main.dc.html:', pixelmatch(ref.data, mine.data, null, 1920, 1080, { threshold: 0 }), 'Pixel Unterschied');
await b.close();
