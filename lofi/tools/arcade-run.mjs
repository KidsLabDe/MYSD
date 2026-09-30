// Bug-Jagd komplett durchspielen: G·A·M·E → Figur → Zoom → Spielen → Game Over → Namen → Rangliste → ESC → raus.
// Danach: Phasenwechsel während des Spiels (?speed=120) → „PHASE VORBEI“, Abhaken direkt nach dem Schließen.
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:5173/';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 } });
const p = await ctx.newPage();
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
const st = () => p.evaluate(() => { const h = window.__hackday, a = h.arcade, g = a.game;
  return { open: a.open, screen: a.screen, anim: h.current, person: h.a.person.visible ? `${h.a.person.x}/${h.a.person.view}` : '-', pc: h.a.pcArcade,
    game: g ? `${g.phase} r${g.round} ${g.score}P ${g.lives}L bits ${g.pick.dots.size}` : '-', ops: h.ops.length, list: a.list.map((e) => e.name + ':' + e.score).join(' '),
    toast: [...document.querySelectorAll('#stage > div')].find((d) => d.style.top === '978px')?.textContent, phaseOver: a.phaseOver }; });
const log = async (l) => console.log(l.padEnd(26), JSON.stringify(await st()));
const ready = async () => { await p.waitForSelector('body[data-ready="1"]', { state: 'attached' }); await p.waitForTimeout(300); };
await p.goto(BASE + '?wave=9999&coffee=9999'); await ready();
await p.evaluate(() => localStorage.removeItem('hackday.bugjagd.v1')); await p.reload(); await ready();
// einzelne Buchstaben lösen nichts aus
for (const k of ['g', 'a', 'm']) await p.keyboard.press(k);
await p.waitForTimeout(2200); await p.keyboard.press('e'); await p.waitForTimeout(200); await log('g,a,m … 2,2 s … e');
for (const k of ['G', 'a', 'M', 'e']) { await p.keyboard.press(k); await p.waitForTimeout(150); }
await p.waitForTimeout(300); await log('G·A·M·E');
await p.waitForTimeout(2500); await log('+2,8 s: Figur läuft');
await p.waitForFunction(() => window.__hackday.arcade.open, null, { timeout: 15000 });
await p.waitForTimeout(700); await log('Zoom fertig (Titel)');
await p.screenshot({ path: '/tmp/arc-title.png' });
// Dashboard-Tasten wirken nicht
for (const k of ['j', 'ArrowRight', '+', 'w', 'r', 'd', 'k', 'h', 'l']) await p.keyboard.press(k);
await p.waitForTimeout(200); await log('Dashboard-Tasten gedrückt');
await p.keyboard.press('Enter'); await p.waitForTimeout(1500); await log('ENTER → Spiel');
const dirs = ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'];
for (let i = 0; i < 40; i++) { await p.keyboard.press(dirs[Math.floor(Math.random() * 4)]); await p.waitForTimeout(250); }
await p.screenshot({ path: '/tmp/arc-play.png' });
await log('10 s gespielt');
await p.keyboard.press('p'); await p.waitForTimeout(600); const s1 = await st(); await p.waitForTimeout(600); const s2 = await st();
console.log('P Pause'.padEnd(26), 'Score/Stand unverändert:', s1.game === s2.game); await p.keyboard.press('p');
// schneller zum Game Over: nur noch 1 Leben, Figur in einen Bug stellen
await p.evaluate(() => { const g = window.__hackday.arcade.game; g.lives = 1; const bg = g.bugs[0]; bg.state = 'active'; bg.fright = false; g.frightUntil = -1; bg.x = g.player.x; bg.y = g.player.y; });
await p.waitForFunction(() => window.__hackday.arcade.screen !== 'play', null, { timeout: 10000 });
await log('Game Over');
await p.keyboard.type('Zoe 26x'); await p.keyboard.press('ArrowUp'); await p.waitForTimeout(200);
await p.screenshot({ path: '/tmp/arc-name.png' });
await p.keyboard.press('Enter'); await p.waitForTimeout(300); await log('Name gespeichert → Rangliste');
await p.screenshot({ path: '/tmp/arc-board.png' });
const stored = await p.evaluate(() => localStorage.getItem('hackday.bugjagd.v1')); console.log('localStorage'.padEnd(26), stored);
await p.keyboard.press('Escape'); await p.waitForTimeout(700); await log('ESC → Zoom zurück');
await p.waitForFunction(() => !window.__hackday.busy, null, { timeout: 15000 }); await log('Figur raus, Queue leer');
await p.reload(); await ready(); await log('nach Neuladen');
// Phasenwechsel während des Spiels
await p.goto(BASE + '?speed=120&now=10:25&wave=9999&coffee=9999'); await ready();
for (const k of ['g', 'a', 'm', 'e']) await p.keyboard.press(k);
await p.waitForFunction(() => window.__hackday.arcade.open, null, { timeout: 15000 });
await p.waitForTimeout(600); // Tasten gelten erst nach dem Zoom
await p.keyboard.press('Enter');
await p.waitForFunction(() => window.__hackday.arcade.phaseOver, null, { timeout: 60000 });
await p.waitForTimeout(400); await log('Phase vorbei im Spiel');
await p.screenshot({ path: '/tmp/arc-phase.png' });
await p.keyboard.press('Escape');
const t0 = Date.now();
await p.waitForFunction(() => window.__hackday.current === 'phase', null, { timeout: 20000 });
console.log('Abhaken beginnt'.padEnd(26), (Date.now() - t0) + ' ms nach ESC (inkl. Zoom zurück + Figur raus)');
// 45 s ohne Eingabe auf dem Titel → schließt von selbst
await p.goto(BASE + '?arcade&wave=9999&coffee=9999'); await ready();
const tOpen = Date.now();
await p.waitForFunction(() => !window.__hackday.arcade.open, null, { timeout: 60000, polling: 500 });
console.log('Auto-Schließen'.padEnd(26), Math.round((Date.now() - tOpen) / 1000) + ' s ohne Eingabe');
console.log('Fehler:', errs.length ? errs : 'keine');
await b.close();
