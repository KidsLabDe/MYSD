import { chromium } from 'playwright';
const [,, url, file, w='1920', h='1080', wait='300'] = process.argv;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
p.on('console', m => console.log('console:', m.text())); p.on('pageerror', e => console.log('ERR', e.message));
await p.goto(url); await p.waitForTimeout(+wait); await p.screenshot({ path: file }); await b.close();
