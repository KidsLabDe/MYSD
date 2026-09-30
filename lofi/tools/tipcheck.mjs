// Unabhängige Prüfung: Liegt die Stiftspitze am Linienende genau auf der Linie? (Farbe am Szenenpixel ablesen)
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
const BASE = process.env.BASE || 'http://localhost:5173';
const ARMS = ['up', 'steil', 'up', 'diag', 'flach', 'waagrecht', 'leichtRunter', 'runter'];
const TIP = { up: [38, -8], steil: [46, 2], diag: [58, 5], flach: [53, 14], waagrecht: [56, 24], leichtRunter: [54, 34], runter: [54, 44] };
const segY = (l) => (l < 16 || (l >= 36 && l < 52) ? 5 : 4);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const hex = (img, x, y) => { const i = (y * 1920 + x) * 4; return [0, 1, 2].map((k) => img.data[i + k].toString(16).padStart(2, '0')).join('').toUpperCase(); };
for (let i = 0; i < 8; i++) for (const n of [2, 20, 40, 62]) {
  const arm = ARMS[i], [tx, tt] = TIP[arm], bench = i < 2, top = bench ? 45 : 63;
  const xEnd = 250 + n, lineTop = 32 + 10 * i + segY(xEnd - 249), armDy = lineTop - (top + tt);
  const q = new URLSearchParams({ ref: '', struck: i, drawRow: i, drawLen: n, pose: 'stand', arm, armDy, x: (xEnd - tx) * 6, top: top * 6, layer: 'ganzVorne', blinds: 40 });
  await page.goto(`${BASE}/?${q}`); await page.waitForSelector('body[data-ready="1"]', { state: 'attached' }); await page.waitForTimeout(120);
  const img = PNG.sync.read(await page.screenshot());
  const at = hex(img, xEnd * 6 + 3, lineTop * 6 + 3);          // Pixel der Spitze = Oberkante Linie am Linienende
  const want = arm === 'diag' ? 'C4493A' : '2A1A18';
  console.log(`Zeile ${i} n=${String(n).padStart(2)}  Linienende x ${xEnd}, y ${lineTop}: #${at} ${at === want ? '✓ Spitze' : '✗ erwartet #' + want}`);
}
await b.close();
