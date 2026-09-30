import { chromium } from 'playwright';
import { resolve } from 'node:path';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
for (const [w, h, dpr] of [[1440, 900, 2], [1366, 768, 1], [3840, 2160, 1]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: dpr });
  await p.goto('file://' + resolve('dist/index.html') + '?now=10:10&weather=regen'); await p.waitForTimeout(1200);
  const t = await p.evaluate(() => document.getElementById('stage').style.transform + ' ' + document.getElementById('viewport').style.cssText);
  console.log(`${w}×${h}@${dpr}x →`, t);
  if (w === 1440) await p.screenshot({ path: '/tmp/laptop.png' });
  await p.close();
}
await b.close();
