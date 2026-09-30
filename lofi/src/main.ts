import './fonts.css';
import defaultCfg from '../public/event.json';
import { Scene, fitStage, type SceneState } from './scene';
import { Clock } from './clock';
import { WeatherService } from './weather';
import { Animator } from './anim';
import { Toast, toggleFullscreen, autoHideCursor, keepFocus } from './ui';
import { resolve, hhmm, hms, calOffset, CAL_ROWS, type EventCfg, type Op, type Resolved } from './schedule';
import { toEventCfg, validData, validOrt, type HackdayData, type Ort } from './mysd';
import mysd from 'virtual:mysd';
import { DESIGN_SAMPLES, type ComputerProps } from './components/computer';
import type { CalendarProps } from './components/calendar';
import { POSTERS } from './components/poster';
import { ARMS, VIEWS, FACES, ARM_LEFT, HOLDING, type Arm, type View, type Face, type ArmLeft, type Holding } from './components/person';
import { Printer, printerTimings, OBJS, type PrinterView, type PrintState, type PrintObj } from './printer';
import { pickIdle, nextWave, nextCoffee, type IdleKind } from './idle';
import { HelpOverlay } from './ui';
import { ArcadeSession } from './arcade/session';
import { GameSequence, dashboardAction } from './arcade/keys';
import type { Screen } from './arcade/screens';
import { WEATHERS, POSES, PC_STATES, type Weather, type Pose, type PcState } from './types';

const q = new URLSearchParams(location.search);
document.body.style.cssText = 'margin: 0; background: #000; overflow: hidden';
const viewport = document.getElementById('viewport')!;
const stageEl = document.getElementById('stage')!;
const scene = new Scene(stageEl);
const toast = new Toast(stageEl);
const fit = () => fitStage(viewport, stageEl);
fit();
window.addEventListener('resize', fit);
autoHideCursor();
keepFocus();
const help = new HelpOverlay(stageEl);

// ---------- Konfiguration ----------
function validCfg(c: unknown): c is EventCfg {
  const e = c as EventCfg;
  return !!e && Array.isArray(e.phases) && e.phases.length > 0 &&
    e.phases.every((p) => typeof p.name === 'string' && /^\d{1,2}:\d{2}$/.test(p.start) && /^\d{1,2}:\d{2}$/.test(p.end));
}
// ---------- MYSD-Version: Plan live aus dem Repo, eingebetteter Stand als Rückfall ----------
const MYSD = !!mysd.data;
async function fetchJson(url: string): Promise<unknown> {
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) throw new Error(String(r.status));
  return r.json();
}
async function loadMysd(now: number): Promise<{ cfg: EventCfg; warn?: string; live: boolean }> {
  let data = mysd.data as HackdayData, ort = mysd.ort as Ort, live = false;
  if (!q.has('offline')) {
    const [d, o] = await Promise.allSettled([fetchJson(mysd.dataUrl), fetchJson(mysd.ortUrl)]);
    if (d.status === 'fulfilled' && validData(d.value)) { data = d.value; live = true; }
    if (o.status === 'fulfilled' && validOrt(o.value)) ort = o.value;
  }
  const cfg = toEventCfg(data, ort, new Date(now));
  if (cfg) return { cfg, live, warn: live ? undefined : 'Plan offline – eingebetteter Stand' };
  return { cfg: defaultCfg as EventCfg, live, warn: 'Kein Plan für heute gefunden – nutze Standardplan' };
}

async function loadCfg(): Promise<{ cfg: EventCfg; warn?: string }> {
  const alt = q.get('event');
  if (alt && /^[\w.-]+\.json$/.test(alt)) {
    try { const j = await (await fetch(alt, { cache: 'no-store' })).json(); if (validCfg(j)) return { cfg: j }; } catch { /* weiter mit Standard */ }
  }
  const w = (window as unknown as { HACKDAY_EVENT?: unknown }).HACKDAY_EVENT;
  if (w !== undefined) return validCfg(w) ? { cfg: w } : { cfg: defaultCfg as EventCfg, warn: 'event.js fehlerhaft – nutze Standardplan' };
  try {
    const r = await fetch('event.json', { cache: 'no-store' });
    const j = await r.json();
    if (validCfg(j)) return { cfg: j };
    return { cfg: defaultCfg as EventCfg, warn: 'event.json fehlerhaft – nutze Standardplan' };
  } catch {
    return { cfg: defaultCfg as EventCfg, warn: 'Keine event.js/event.json gefunden – nutze Standardplan' };
  }
}

// ---------- Text an Bildschirmbreite anpassen (VT323) ----------
const ctx = document.createElement('canvas').getContext('2d')!;
const SCREEN_W = 348 - 40;
function fits(text: string, px: number) { ctx.font = `${px}px VT323`; return ctx.measureText(text).width + text.length <= SCREEN_W; }
const firstFit = (px: number, c: string[]) => c.find((t) => fits(t, px)) ?? c[c.length - 1];
// Kalender: Platz für den Namen, wenn "JETZT" daneben steht (396 − Padding 36 − Zeit 56 − 2 Lücken 24 − Badge)
function calNameSize(name: string) {
  ctx.font = "16px 'Pixelify Sans'";
  const room = 396 - 36 - 56 - 24 - (ctx.measureText('JETZT').width + 16);
  for (let px = 23; px > 14; px--) { ctx.font = `${px}px 'Pixelify Sans'`; if (ctx.measureText(name).width <= room) return px === 23 ? undefined : px; }
  return 14;
}
const screenName = (p: { name: string; screen?: string }) => (p.screen ?? p.name).toUpperCase();
const pad2 = (n: number) => String(n).padStart(2, '0');
const WD = ['SO', 'MO', 'DI', 'MI', 'DO', 'FR', 'SA'];
// Kalender-Titel (Press Start 2P) auf 396 − 2·12 px einpassen
function calTitleSize(title: string) {
  for (let px = 24; px > 10; px--) { ctx.font = `${px}px 'Press Start 2P'`; if (ctx.measureText(title).width <= 372) return px === 24 ? undefined : px; }
  return 10;
}

function computerView(cfg: EventCfg, L: Resolved, now: number): ComputerProps {
  const n = L.n, total = pad2(n), clock = hhmm(now);
  if (L.ende) return { state: 'ende', num: total, total, clock, phase: screenName(cfg.phases[n - 1]), countdown: 'GESCHAFFT!', next: 'DANKE FÜRS MITHACKEN!', fill: 16 };
  const p = cfg.phases[L.idx], sl = L.slots[L.idx];
  const name = screenName(p);
  if (L.gap) { // Lücke zwischen zwei Einträgen
    const t = hhmm(sl.start);
    return { state: 'pause', num: pad2(L.idx), total, clock, phase: 'PAUSE', countdown: hms(L.remaining), next: firstFit(18, [`NÄCHSTE > ${name} · ${t}`, `> ${name} · ${t}`, `${name} · ${t}`]), fill: 0 };
  }
  if (L.waiting && L.remaining >= 24 * 3600_000) { // Plan-Tag liegt noch Tage entfernt: Datum statt Riesen-Countdown
    const d = new Date(sl.start), day = `${WD[d.getDay()]} ${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.`;
    return { state: 'pause', num: '00', total, clock, phase: firstFit(26, [name]), countdown: day, next: `START · ${day} ${hhmm(sl.start)}`, fill: 0 };
  }
  if (L.waiting) return { state: 'pause', num: '00', total, clock, phase: firstFit(26, [name]), countdown: hms(L.remaining), next: `START · ${hhmm(sl.start)}`, fill: 0 };
  const phase = L.state === 'endspurt' ? firstFit(26, [`${name} · ENDSPURT`, name]) : name;
  let next: string;
  if (L.idx + 1 < n) {
    const nn = screenName(cfg.phases[L.idx + 1]), t = hhmm(L.slots[L.idx + 1].start);
    next = firstFit(18, [`NÄCHSTE > ${nn} · ${t}`, `> ${nn} · ${t}`, `${nn} · ${t}`]);
  } else next = `NÄCHSTE > ENDE · ${hhmm(sl.end)}`;
  return { state: L.state, num: pad2(L.idx + 1), total, clock, phase, countdown: hms(L.remaining), next, fill: L.fill };
}

function subline(cfg: EventCfg) {
  const d = cfg.date && /^\d{4}-\d{2}-\d{2}$/.test(cfg.date) ? cfg.date.split('-').reverse().join('.') : (cfg.date ?? '');
  return [d, cfg.location?.name].filter(Boolean).join(' · ');
}

// Beispieldaten des Designs (für ?ref / Screenshot-Vergleich)
const DESIGN_ROWS = [['09:00', 'Check-in & Frühstück'], ['09:30', 'Kick-off'], ['10:00', 'Teams & Ideen'], ['10:45', 'Hacking I'], ['12:30', 'Mittagessen'], ['13:15', 'Hacking II'], ['15:30', 'Pitches'], ['16:30', 'Abschluss']].map(([time, name]) => ({ time, name }));

// ---------- Debug / Referenz ----------
interface Dbg { view: View; face: Face; armLeft: ArmLeft; holding: Holding; cupOnDesk: boolean; printer: PrinterView | null; smallPlant: boolean;
  arm: Arm | null; armDy: number; top: number; layer: 'auto' | 'ganzVorne'; drawRow: number; drawLen: number; poster: string | null; on: boolean; sample: boolean; fx: boolean; weather: Weather; blinds: number; pose: Pose; marker: boolean; x: number; person: boolean; struck: number; state: PcState }
const refMode = q.has('ref');
const TOPS: Record<string, number> = { boden: 378, stufe: 324, bank: 270 };
const pick = <T extends string>(list: readonly T[], v: string | null, d: T): T => ((list as readonly string[]).includes(v ?? '') ? (v as T) : d);
const dbg: Dbg = {
  view: pick(VIEWS, q.get('view'), 'back'), face: pick(FACES, q.get('face'), 'auto'), armLeft: pick(ARM_LEFT, q.get('armLeft'), 'down'),
  holding: pick(HOLDING, q.get('holding'), 'none'), cupOnDesk: q.get('cupOnDesk') !== '0', smallPlant: q.get('smallPlant') === '1',
  // Main.dc.html-Standard: printing, Schicht 5, Kopf 0, bulb · ?printer=0 blendet aus (ältere Tafel Kalender_Abhaken)
  printer: q.get('printer') === '0' ? null : {
    state: pick(['printing', 'done', 'empty'] as const, q.get('printState'), 'printing') as PrintState, layer: Number(q.get('printLayer') ?? 5),
    headX: Number(q.get('printHeadX') ?? 0), obj: pick(OBJS, q.get('printObj'), 'bulb') as PrintObj,
  },
  arm: (ARMS as readonly string[]).includes(q.get('arm') ?? '') ? (q.get('arm') as Arm) : null,
  armDy: Number(q.get('armDy') ?? 0), top: Number(q.get('top') ?? TOPS[q.get('standOn') ?? 'boden'] ?? 378),
  layer: q.get('layer') === 'ganzVorne' ? 'ganzVorne' : 'auto',
  drawRow: Number(q.get('drawRow') ?? -1), drawLen: Number(q.get('drawLen') ?? 0),
  poster: q.get('poster'),
  on: refMode, sample: refMode, fx: !refMode,
  weather: (q.get('weather') as Weather) || 'sonnig', blinds: Number(q.get('blinds') ?? 40), pose: (q.get('pose') as Pose) || 'reach',
  marker: q.get('marker') !== '0', x: Number(q.get('x') ?? 1392), person: q.get('person') !== '0', struck: Number(q.get('struck') ?? 3),
  state: (q.get('state') as PcState) || 'laeuft',
};

async function boot() {
  const clock = new Clock(q);
  const loaded = MYSD ? await loadMysd(clock.now()) : await loadCfg();
  const { cfg, warn } = loaded;
  // Fonts vor dem Messen laden (Canvas-Messung braucht sie)
  await Promise.all(["23px 'Pixelify Sans'", '26px VT323', "24px 'Press Start 2P'"].map((f) => document.fonts.load(f).catch(() => null)));
  const weather = new WeatherService(cfg.location?.latitude ?? 48.3705, cfg.location?.longitude ?? 10.8978, q.get('weather'));
  if (!refMode) weather.start();

  // ---- Eingriffe (localStorage) ----
  const dayKey = new Date(clock.now()).toISOString().slice(0, 10);
  const LS = clock.test ? 'hackday:test:ops' : `hackday:ops:${cfg.title}:${dayKey}`;
  let ops: Op[] = [];
  try { if (clock.test) localStorage.removeItem(LS); else ops = JSON.parse(localStorage.getItem(LS) || '[]'); } catch { ops = []; }
  const save = () => { try { localStorage.setItem(LS, JSON.stringify(ops)); } catch { /* ohne Speicher weiter */ } };

  const printTest = Number(q.get('print')) || null;
  const printer = new Printer(printerTimings(printTest));
  const anim = new Animator(printer);
  const a = anim.a;
  // ---- Easter Egg „Bug-Jagd“ ----
  const arcade = new ArcadeSession(stageEl, { toast: (t, ms) => toast.show(t, ms) });
  const gameSeq = new GameSequence();
  let arcadeRequested = false, arcadeInstant = false, arcadeToastShown = false;
  if (q.has('arcade')) {
    arcadeRequested = true; arcadeInstant = true;
    const scr = q.get('arcade') as Screen;
    if (q.has('demo') && ['title', 'play', 'name', 'board'].includes(scr)) { arcade.demo = scr; arcade.demoCanvas = q.get('demo') === 'canvas'; }
  }
  // ---- Leerlauf-Animationen ----
  const waveTest = Number(q.get('wave')) || null, coffeeTest = Number(q.get('coffee')) || null;
  let waveAt = performance.now() + nextWave(waveTest), coffeeAt = performance.now() + nextCoffee(coffeeTest);
  let lastIdle: IdleKind | null = null;
  const LS_IDLE = 'hackday:idle';
  let idleOn = true;
  try { idleOn = localStorage.getItem(LS_IDLE) !== '0'; } catch { /* Standard: an */ }
  const manual: IdleKind[] = [];   // D/K/H, eingereiht
  const idleSeq: Record<IdleKind, [() => Promise<void>, () => void]> = {
    wave: [() => anim.wave(), () => {}],
    coffee: [() => anim.coffee(), () => anim.coffeeEnd()],
    printFetch: [() => anim.printFetch(), () => anim.printFetchEnd()],
    printStart: [() => anim.printStart(), () => anim.printStartEnd()],
  };
  const runIdle = (k: IdleKind) => {
    const [seq, end] = idleSeq[k];
    lastIdle = k;
    const t = performance.now();
    if (k === 'wave') waveAt = t + nextWave(waveTest);
    if (k === 'coffee') coffeeAt = t + nextCoffee(coffeeTest);
    anim.run(k, seq, end);
  };
  let L = resolve(cfg, ops, clock.now());
  const snap = (r: Resolved) => { a.idx = r.idx; a.struck = r.struck; a.blinds = r.blinds; anim.hide(); a.handleY = null; a.cupOnDesk = true; };
  snap(L); // beim Laden: keine nachgeholten Animationen

  // ---- Wetter-Effekte ----
  let rainOff = 0, snowOff = 0, lastRain = 0, lastSnow = 0, nextBolt = performance.now() + 6000, boltT = -1e9;
  const fx = (t: number) => {
    if (t - lastRain >= 40) { rainOff++; lastRain = t; }
    if (t - lastSnow >= 200) { snowOff++; lastSnow = t; }
    if (t >= nextBolt) { boltT = t; nextBolt = t + 6000 + Math.random() * 6000; }
    const e = t - boltT;
    return (e >= 0 && e < 90) || (e >= 180 && e < 270);
  };

  const nameSizes = cfg.phases.map((p) => calNameSize(p.name));
  const calTitle = (cfg.title || 'Hackday').toUpperCase(), titleSize = calTitleSize(calTitle);
  let lastPc: ComputerProps | null = null, frozenPc: ComputerProps | null = null;

  const loop = (t: number) => {
    const now = clock.now();
    L = resolve(cfg, ops, now);
    // ---- Controller: logischer Zustand → angezeigter Zustand ----
    printer.tick(t);
    const pending = L.idx !== a.idx || L.blinds !== a.blinds;   // Abhaken/Jalousie steht an
    if (anim.idleRunning && (pending || arcadeRequested)) anim.cancelIdle(); // Vorrang: Leerlauf sofort beenden
    arcade.phaseOver = arcade.open && L.idx !== a.idx;            // „PHASE VORBEI“ im HUD
    if (!anim.busy && !dbg.on) {
      if (arcadeRequested && (!pending || arcadeInstant)) {
        arcadeRequested = false;
        const instant = arcadeInstant; arcadeInstant = false;
        if (!instant && !arcadeToastShown) toast.show('G · A · M · E · Bug-Jagd startet', 1500);
        arcadeToastShown = false;
        anim.run('arcade', async () => {
          await anim.arcade(arcade, instant);
          const t2 = performance.now(); waveAt = t2 + nextWave(waveTest); coffeeAt = t2 + nextCoffee(coffeeTest); // Leerlauf pausierte
        });
      } else if (L.idx === a.idx) {
        if (L.blinds !== a.blinds) anim.run('blinds', () => anim.blindsTo(L.blinds));
        else if (manual.length) runIdle(manual.shift()!);
        else {
          const due: IdleKind[] = [];
          if (printer.state === 'done' && t >= printer.fetchAt) due.push('printFetch');
          if (printer.state === 'empty' && t >= printer.startAt) due.push('printStart');
          if (t >= waveAt) due.push('wave');
          if (t >= coffeeAt) due.push('coffee');
          const k = pickIdle({ enabled: idleOn, queueEmpty: true, phaseChangePending: false, remainingMs: L.ende ? Infinity : L.remaining, due, last: lastIdle });
          if (k) runIdle(k);
        }
      } else if (L.idx === a.idx + 1) {
        const prev = a.idx;
        anim.run('phase', () => anim.phaseDone(prev, () => (L.idx === prev + 1 ? L.blinds : a.blinds), calOffset(prev, L.n)));
      } else snap(L); // Sprung (Neuladen, ←, Laptop geschlafen, Stau): Endzustand direkt
    }
    anim.tick(t);
    const bolt = fx(t);

    let pc = computerView(cfg, L, now);
    if (a.pcArcade) pc = { state: 'arcade', num: '--', total: pad2(L.n), clock: 'G·A·M·E', phase: 'BUG-JAGD', countdown: 'READY?', next: 'ENTER = START', fill: 16 };
    if (a.freezePc) { frozenPc ??= { ...(lastPc ?? pc), countdown: '00:00:00', fill: 16 }; pc = frozenPc; } else frozenPc = null;
    lastPc = pc;
    // Mehr als 8 Einträge: Fenster wandert mit dem Abhaken (Zeilenindizes im Fenster)
    const off = calOffset(a.struck, L.n);
    const nowAbs = a.idx >= L.n || (L.waiting && a.idx === L.idx) ? -1 : a.idx;
    const cal: CalendarProps = {
      title: calTitle, titleSize, subline: subline(cfg),
      rows: cfg.phases.slice(off, off + CAL_ROWS).map((p, i) => ({ time: hhmm(L.slots[off + i].start), name: p.name, size: nameSizes[off + i] })),
      struck: a.struck - off, nowRow: nowAbs < 0 ? -1 : nowAbs - off, draw: a.draw,
    };
    let s: SceneState = {
      weather: weather.current, blinds: a.blinds, poster: dbg.poster ?? cfg.poster ?? 'papier', handleY: a.handleY, rainOff, snowOff, bolt: bolt,
      calendar: cal, computer: { ...pc, dark: a.dark }, person: { ...a.person },
      cupOnDesk: a.cupOnDesk, printer: printer.view(t),
    };
    if (dbg.on) s = applyDbg(s, cfg, L, now);
    scene.render(s);
    if (dbgInfo) dbgInfo.textContent = `${new Date(now).toLocaleTimeString('de-DE')} · Phase ${L.idx + 1}/${L.n}${L.waiting ? ' (wartet)' : ''} · ${L.state} · Rest ${hms(L.remaining)} · Jalousie ${L.blinds} % · Wetter ${weather.current} [${weather.status}]${anim.busy ? ' · läuft: ' + anim.current : ''} · Drucker ${printer.state} ${printer.layer}/8 ${printer.obj} · Leerlauf ${idleOn ? 'an' : 'aus'}`;
    requestAnimationFrame(loop);
  };

  function applyDbg(s: SceneState, cfg: EventCfg, L: Resolved, now: number): SceneState {
    const pc = dbg.sample ? { state: dbg.state, ...DESIGN_SAMPLES[dbg.state] } : { ...computerView(cfg, L, now), state: dbg.state };
    return {
      ...s,
      weather: dbg.weather, blinds: dbg.blinds, handleY: null,
      rainOff: dbg.fx ? s.rainOff : 0, snowOff: dbg.fx ? s.snowOff : 0, bolt: dbg.fx ? s.bolt : true,
      calendar: dbg.sample
        ? { title: 'HACKDAY', subline: '[DATUM] · [ORT]', rows: DESIGN_ROWS, struck: dbg.struck, nowRow: dbg.struck, draw: dbg.drawRow >= 0 ? { row: dbg.drawRow, len: dbg.drawLen } : null }
        : { ...s.calendar, struck: dbg.struck, nowRow: dbg.struck, draw: dbg.drawRow >= 0 ? { row: dbg.drawRow, len: dbg.drawLen } : null },
      computer: pc,
      person: { visible: dbg.person, x: dbg.x, pose: dbg.pose, marker: dbg.marker, layer: dbg.layer, top: dbg.top, arm: dbg.arm, armDy: dbg.armDy, view: dbg.view, face: dbg.face, armLeft: dbg.armLeft, holding: dbg.holding, steamDy: 0 },
      cupOnDesk: dbg.cupOnDesk, printer: dbg.printer, smallPlant: dbg.smallPlant,
    };
  }

  // ---- Tastenkürzel ----
  let resetArmed = -Infinity;
  window.addEventListener('keydown', (e) => {
    if ((e.target as HTMLElement).closest?.('#debug')) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    // Solange das Spiel offen ist, gehören alle Tasten dem Spiel – kein Dashboard-Kürzel greift
    if (arcade.open) { arcade.key(e); e.preventDefault(); return; }
    if (gameSeq.push(e.key, performance.now())) {
      arcadeRequested = true;
      arcadeToastShown = !(anim.busy && !anim.idleRunning);
      toast.show(arcadeToastShown ? 'G · A · M · E · Bug-Jagd startet' : 'Bug-Jagd kommt gleich', 1500);
      e.preventDefault(); return;
    }
    const act = dashboardAction(e.key);
    if (!act) return;
    const now = clock.now();
    const k = e.key;
    if (k === 'ArrowRight') {
      ops.push({ t: 'skip', at: now }); save();
      const r = resolve(cfg, ops, now);
      toast.show(r.ende ? '→ Tag beendet' : `→ Jetzt: ${cfg.phases[r.idx].name}`);
    } else if (k === 'ArrowLeft') {
      if (L.idx === 0) { toast.show('← Schon bei der ersten Phase'); return; }
      ops.push({ t: 'back', at: now }); save();
      toast.show(`← Zurück: ${cfg.phases[resolve(cfg, ops, now).idx].name}`);
    } else if (k === '+' || k === '=' || k === 'Add') {
      if (L.ende) return;
      ops.push({ t: 'extend', at: now, ms: 5 * 60_000 }); save();
      const r = resolve(cfg, ops, now);
      toast.show(L.waiting ? `+5 min · Start ${hhmm(r.slots[r.idx].start)}` : `+5 min · endet ${hhmm(r.slots[r.idx].end)}`);
    } else if (k === '-' || k === 'Subtract') {
      if (L.ende) return;
      ops.push({ t: 'extend', at: now, ms: -5 * 60_000 }); save();
      const r = resolve(cfg, ops, now);
      toast.show(L.waiting ? `−5 min · Start ${hhmm(r.slots[r.idx].start)}` : `−5 min · endet ${hhmm(r.slots[r.idx].end)}`);
    } else if (k === 'p' || k === 'P') {
      const open = ops.find((o) => o.t === 'pause' && o.to === null) as Extract<Op, { t: 'pause' }> | undefined;
      if (open) { open.to = now; toast.show('▶ Countdown läuft weiter'); } else { ops.push({ t: 'pause', from: now, to: null }); toast.show('❚❚ Countdown pausiert'); }
      save();
    } else if (k === 'j' || k === 'J') {
      const v = L.blinds > 0 ? 0 : 100;
      ops.push({ t: 'blinds', at: now, value: v }); save();
      toast.show(v ? 'Jalousie zu' : 'Jalousie auf');
    } else if (k === 'w' || k === 'W') {
      toast.show('Wetter: ' + weather.cycle());
    } else if (k === 'f' || k === 'F') {
      toggleFullscreen();
    } else if (k === '?' || (k === 'Escape' && help.open)) {
      help.toggle(k === '?' ? undefined : false);
    } else if (k === 'd' || k === 'D') {
      if (printer.state === 'printing') { printer.finishNow(performance.now()); toast.show('Drucker: sofort fertig'); }
      else { manual.push(printer.state === 'done' ? 'printFetch' : 'printStart'); toast.show(anim.busy ? 'Drucker: kommt gleich' : printer.state === 'done' ? 'Drucker: Teil abholen' : 'Drucker: neuen Druck starten'); }
    } else if (k === 'k' || k === 'K') {
      manual.push('coffee'); toast.show(anim.busy ? 'Kaffeepause: kommt gleich' : 'Kaffeepause');
    } else if (k === 'h' || k === 'H') {
      manual.push('wave'); toast.show(anim.busy ? 'Hallo: kommt gleich' : 'Hallo!');
    } else if (k === 'l' || k === 'L') {
      idleOn = !idleOn;
      try { localStorage.setItem(LS_IDLE, idleOn ? '1' : '0'); } catch { /* egal */ }
      toast.show(idleOn ? 'Leerlauf-Animationen an' : 'Leerlauf-Animationen aus (Drucker druckt weiter)');
    } else if (k === 'r' || k === 'R') {
      if (performance.now() - resetArmed < 3000) {
        ops = []; save(); resetArmed = -Infinity; toast.show('Zurückgesetzt auf den Plan');
      } else { resetArmed = performance.now(); toast.show('Zurücksetzen? Nochmal R drücken', 3000); }
    } else return;
    e.preventDefault();
  });

  let dbgInfo: HTMLElement | null = null;
  if (q.has('debug')) dbgInfo = buildDebug();
  if (warn) toast.show(warn, 8000);
  // MYSD: Plan regelmäßig neu laden; ändert er sich (oder beginnt ein neuer Tag), Seite neu aufbauen.
  // Eingriffe liegen in localStorage und bleiben erhalten, nachgeholte Animationen gibt es nicht.
  if (MYSD && !clock.test && !q.has('offline')) {
    const key = JSON.stringify(cfg);
    setInterval(async () => {
      const r = await loadMysd(clock.now()).catch(() => null);
      if (r && (r.live || r.cfg.day !== cfg.day) && JSON.stringify(r.cfg) !== key) location.reload();
    }, 5 * 60_000);
  }
  // Test-Hook (nur lesend)
  (window as unknown as { __hackday: unknown }).__hackday = { get L() { return L; }, get a() { return anim.a; }, get ops() { return ops; }, get busy() { return anim.busy; }, get current() { return anim.current; }, printer, weather, arcade, get idleOn() { return idleOn; }, cfg, live: 'live' in loaded ? loaded.live : null };
  requestAnimationFrame(loop);
  document.body.dataset.ready = '1';
}

// ---------- Debug-Panel (?debug) ----------
function buildDebug(): HTMLElement {
  const box = document.createElement('div');
  box.id = 'debug';
  box.style.cssText = 'position: fixed; left: 8px; bottom: 8px; z-index: 1000; width: 280px; max-height: calc(100vh - 16px); overflow: auto; background: rgba(20,12,10,0.92); color: #EDE0C8; font: 12px/1.4 system-ui, sans-serif; padding: 10px; border-radius: 6px; cursor: auto';
  const row = (label: string, el: HTMLElement) => { const l = document.createElement('label'); l.style.cssText = 'display: flex; justify-content: space-between; align-items: center; gap: 8px; margin: 4px 0'; l.append(label, el); box.appendChild(l); return el; };
  const sel = (opts: readonly string[], v: string, on: (v: string) => void) => { const s = document.createElement('select'); for (const o of opts) s.add(new Option(o, o)); s.value = v; s.onchange = () => on(s.value); return s; };
  const rng = (min: number, max: number, step: number, v: number, on: (v: number) => void) => {
    const w = document.createElement('span'); const r = document.createElement('input'); const o = document.createElement('span');
    Object.assign(r, { type: 'range', min, max, step, value: String(v) }); r.style.width = '120px'; o.textContent = String(v); o.style.cssText = 'display:inline-block;width:36px;text-align:right';
    r.oninput = () => { o.textContent = r.value; on(Number(r.value)); }; w.append(r, o); return w;
  };
  const chk = (v: boolean, on: (v: boolean) => void) => { const c = document.createElement('input'); c.type = 'checkbox'; c.checked = v; c.onchange = () => on(c.checked); return c; };
  const h = document.createElement('div'); h.textContent = 'Debug'; h.style.cssText = 'font-weight: 700; margin-bottom: 6px'; box.appendChild(h);
  row('Manuell übersteuern', chk(dbg.on, (v) => (dbg.on = v)));
  row('Design-Beispieltexte', chk(dbg.sample, (v) => (dbg.sample = v)));
  row('Wetter-Animation', chk(dbg.fx, (v) => (dbg.fx = v)));
  row('Poster', sel(POSTERS, dbg.poster ?? 'papier', (v) => (dbg.poster = v)));
  row('Wetter', sel(WEATHERS, dbg.weather, (v) => (dbg.weather = v as Weather)));
  row('Jalousie %', rng(0, 100, 10, dbg.blinds, (v) => (dbg.blinds = v)));
  row('Person', chk(dbg.person, (v) => (dbg.person = v)));
  row('Pose', sel(POSES, dbg.pose, (v) => (dbg.pose = v as Pose)));
  row('Stift', chk(dbg.marker, (v) => (dbg.marker = v)));
  row('Blickrichtung', sel(VIEWS, dbg.view, (v) => (dbg.view = v as View)));
  row('Gesicht', sel(FACES, dbg.face, (v) => (dbg.face = v as Face)));
  row('Arm links', sel(ARM_LEFT, dbg.armLeft, (v) => (dbg.armLeft = v as ArmLeft)));
  row('Hält', sel(HOLDING, dbg.holding, (v) => (dbg.holding = v as Holding)));
  row('Tasse auf Tisch', chk(dbg.cupOnDesk, (v) => (dbg.cupOnDesk = v)));
  const pr = () => (dbg.printer ??= { state: 'printing', layer: 5, headX: 0, obj: 'bulb' });
  row('Drucker', sel(['printing', 'done', 'empty'], dbg.printer?.state ?? 'printing', (v) => (pr().state = v as PrintState)));
  row('Drucker Schicht', rng(0, 8, 1, dbg.printer?.layer ?? 5, (v) => (pr().layer = v)));
  row('Drucker Kopf', rng(-4, 4, 1, dbg.printer?.headX ?? 0, (v) => (pr().headX = v)));
  row('Drucker Objekt', sel(OBJS, dbg.printer?.obj ?? 'bulb', (v) => (pr().obj = v as PrintObj)));
  row('Arm', sel(['auto', ...ARMS], dbg.arm ?? 'auto', (v) => (dbg.arm = v === 'auto' ? null : (v as Arm))));
  row('armDy', rng(-4, 4, 1, dbg.armDy, (v) => (dbg.armDy = v)));
  row('Standfläche', sel(['boden', 'stufe', 'bank'], 'boden', (v) => (dbg.top = TOPS[v])));
  row('Ebene', sel(['auto', 'ganzVorne'], dbg.layer, (v) => (dbg.layer = v as 'auto' | 'ganzVorne')));
  row('Strich Zeile', rng(-1, 7, 1, dbg.drawRow, (v) => (dbg.drawRow = v)));
  row('Strich Länge', rng(0, 62, 1, dbg.drawLen, (v) => (dbg.drawLen = v)));
  row('Person x', rng(0, 1968, 6, dbg.x, (v) => (dbg.x = v)));
  row('Phase (struck)', rng(0, 8, 1, dbg.struck, (v) => (dbg.struck = v)));
  row('Computer', sel(PC_STATES, dbg.state, (v) => (dbg.state = v as PcState)));
  const info = document.createElement('div'); info.style.cssText = 'margin-top: 8px; opacity: 0.8; white-space: normal'; box.appendChild(info);
  const help = document.createElement('div'); help.style.cssText = 'margin-top: 8px; opacity: 0.6';
  help.textContent = 'Ohne „übersteuern“ läuft die Automatik. Tasten: ? zeigt alle.';
  box.appendChild(help);
  document.body.appendChild(box);
  return info;
}

void boot();
