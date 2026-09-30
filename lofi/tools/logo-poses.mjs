// Hoodie-Logo in allen Posen: gleich viele Logo-Pixel, Versatz = Körper-Versatz der Pose
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
const COLORS = ['F0A31B', 'C48BC4', 'F07A7A', '7FE0C2', '4CC8F0', 'FCE680', 'E83030', '1A2E2D'];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const out = [];
const V = [...['stand', 'walkA', 'walkB', 'reach', 'strike', 'grab', 'pullA', 'pullB', 'stepA', 'stepB'].map((p) => [p, '']), ...['steil', 'flach', 'waagrecht', 'leichtRunter', 'runter'].flatMap((a) => [['stand', a], ['walkA', a], ['walkB', a]])];
for (const [pose, arm] of V) {
  await p.goto(`http://localhost:5173/?ref&pose=${pose}&x=1392&blinds=100${arm ? '&arm=' + arm : ''}`);
  await p.waitForSelector('body[data-ready="1"]', { state: 'attached' }); await p.waitForTimeout(300);
  // Kalender & Streifen aus dem Bild nehmen, nur Person zählen
  await p.addStyleTag({ content: '#l-cal,#l-back,#l-front{visibility:hidden}' }); await p.waitForTimeout(100);
  const img = PNG.sync.read(await p.screenshot({ clip: { x: 1392, y: 378, width: 264, height: 600 } }));
  let n = 0, minX = 1e9, minY = 1e9;
  for (let y = 0; y < 600; y++) for (let x = 0; x < 264; x++) {
    const i = (y * 264 + x) * 4;
    const hex = [0, 1, 2].map((k) => img.data[i + k].toString(16).padStart(2, '0')).join('').toUpperCase();
    if (COLORS.includes(hex)) { n++; minX = Math.min(minX, x); minY = Math.min(minY, y); }
  }
  out.push({ pose: pose + (arm ? ' + ' + arm : ''), logoPx: n, oben: minY / 6, links: minX / 6 });
}
console.table(out);
await b.close();
