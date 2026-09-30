// Nimmt Frames auf: node tools/film.mjs "<url>" <sekunden> <intervall_ms> <ordner>
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const [,, url, secs = '12', every = '250', dir = '/tmp/frames'] = process.argv;
mkdirSync(dir, { recursive: true });
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const errs = [];
p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && !m.text().includes('404') && errs.push(m.text()));
await p.goto(url);
await p.waitForSelector('body[data-ready="1"]', { state: 'attached' });
const n = Math.round((+secs * 1000) / +every);
for (let i = 0; i < n; i++) { await p.screenshot({ path: `${dir}/f${String(i).padStart(3, '0')}.png` }); await p.waitForTimeout(+every); }
await b.close();
console.log('Fehler:', errs.length ? errs : 'keine');
