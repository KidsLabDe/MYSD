// Spiel-Simulation „Bug-Jagd“ (rein, ohne DOM): Bewegung in 1-px-Schritten, Kollision, Bugs, Runden, Punkte.
// Koordinaten: Labyrinth-Pixel (0–167 × 0–119), Kachel = 6 Pixel. Zeichnen: Szene = OX/OY + Koordinate.
import { W, H, T, NEST, TUNNEL_ROW, walkable, cell, inTunnel, freshPickups, key, type Pickups } from './maze';
import { difficulty, modeAt, PLAYER_PX_S, CATCH_POINTS, BIT_POINTS, CUP_POINTS, EXTRA_LIFE_AT, START_LIVES } from './difficulty';

export type Dir = 'left' | 'right' | 'up' | 'down';
export const DV: Record<Dir, [number, number]> = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] };
export const OPP: Record<Dir, Dir> = { left: 'right', right: 'left', up: 'down', down: 'up' };
const ORDER: Dir[] = ['up', 'left', 'down', 'right'];
const MW = W * T; // Labyrinthbreite in Pixeln (168)

export type BugName = 'SYNTAX' | 'NULL' | 'LOOP' | 'RACE';
export const BUG_COLORS: Record<BugName, string> = { SYNTAX: '#F0A31B', NULL: '#C48BC4', LOOP: '#7FE0C2', RACE: '#4CC8F0' };
export const FRIGHT_COLOR = '#7FA58A';

export interface Actor { x: number; y: number; dir: Dir; acc: number }
export interface Bug extends Actor {
  name: BugName; state: 'nest' | 'exiting' | 'active' | 'eaten'; releaseAt: number; respawnAt: number;
  fright: boolean; home: [number, number]; wp: number;
}

// Start/Nest/Ecken (Vorschlag, im Design nicht festgelegt)
export const PLAYER_START: [number, number] = [13, 16];
const HOMES: Record<BugName, [number, number]> = { SYNTAX: [13, 8], NULL: [13, 10], LOOP: [12, 10], RACE: [15, 10] };
const RELEASE: Record<BugName, number> = { SYNTAX: 0, NULL: 2, LOOP: 6, RACE: 10 };
const CORNERS: Record<BugName, [number, number]> = { SYNTAX: [27, -2], NULL: [0, -2], LOOP: [0, 21], RACE: [27, 21] };
/** LOOP umrundet im Jagd-Modus den Block links unter dem Nest */
export const LOOP_WAYPOINTS: [number, number][] = [[1, 14], [12, 14], [9, 18], [1, 18]];
/** Wegsuche (Breitensuche) je Wegpunkt: Schrittzahl jeder Kachel bis zum Wegpunkt – damit LOOP seine Runde zuverlässig läuft */
const LOOP_DIST = LOOP_WAYPOINTS.map(([tc, tr]) => {
  const d = new Map<string, number>([[`${tc},${tr}`, 0]]), q: [number, number][] = [[tc, tr]];
  while (q.length) {
    const [c, r] = q.shift()!;
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nc = (((c + dc) % W) + W) % W, nr = r + dr, k = `${nc},${nr}`;
      if (walkable(nc, nr) && !d.has(k)) { d.set(k, d.get(`${c},${r}`)! + 1); q.push([nc, nr]); }
    }
  }
  return d;
});

export function mulberry32(seed: number) {
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const aligned = (a: { x: number; y: number }) => a.x % T === 0 && a.y % T === 0;
const tileOf = (a: { x: number; y: number }) => [Math.round(a.x / T), Math.round(a.y / T)] as [number, number];
/** horizontale Distanz mit Tunnel-Wrap */
export const dxWrap = (a: number, b: number) => { const d = Math.abs(a - b) % MW; return Math.min(d, MW - d); };
/** Berühren sich zwei 6×6-Figuren? (Abstand < 4 Pixel in beiden Achsen) */
export const collide = (a: { x: number; y: number }, b: { x: number; y: number }) => dxWrap(a.x, b.x) < 4 && Math.abs(a.y - b.y) < 4;

export type Phase = 'ready' | 'play' | 'dying' | 'clear' | 'over';

export class Game {
  score = 0; lives = START_LIVES; round = 1; phase: Phase = 'ready'; phaseT = 0;
  pick: Pickups = freshPickups();
  player!: Actor; queued: Dir | null = null;
  bugs: Bug[] = [];
  t = 0;             // Sekunden seit Start des Lebens/der Runde (Nest-Freigabe)
  modeT = 0;         // Wellen-Uhr (steht während Kaffee)
  frightUntil = -1; chain = 0; extraGiven = false;
  playTime = 0; timeLimit = 300; lastLife = false;
  private lastMode: 'scatter' | 'chase' = 'scatter';
  constructor(public rng: () => number = Math.random) { this.resetActors(); }

  get diff() { return difficulty(this.round); }
  get mode() { return modeAt(this.modeT); }
  get frightened() { return this.t < this.frightUntil; }

  resetActors() {
    const [pc, pr] = PLAYER_START;
    this.player = { x: pc * T, y: pr * T, dir: 'left', acc: 0 };
    this.queued = null;
    this.bugs = (Object.keys(HOMES) as BugName[]).map((name) => {
      const [c, r] = HOMES[name];
      return { name, x: c * T, y: r * T, dir: 'left', acc: 0, state: name === 'SYNTAX' ? 'active' : 'nest', releaseAt: RELEASE[name], respawnAt: 0, fright: false, home: [c, r], wp: 0 };
    });
    this.t = 0; this.modeT = 0; this.frightUntil = -1; this.lastMode = 'scatter';
    this.phase = 'ready'; this.phaseT = 0;
  }

  input(d: Dir) {
    this.queued = d;
    if (this.player.dir && d === OPP[this.player.dir]) this.player.dir = d; // Umkehren geht sofort
  }

  /** dt in Sekunden */
  step(dt: number) {
    this.phaseT += dt;
    if (this.phase === 'ready') { if (this.phaseT >= 1) { this.phase = 'play'; this.phaseT = 0; } return; }
    if (this.phase === 'dying') {
      if (this.phaseT >= 0.9) {
        this.lives--;
        if (this.lives <= 0 || this.lastLife) { this.phase = 'over'; this.phaseT = 0; }
        else this.resetActors();
      }
      return;
    }
    if (this.phase === 'clear') {
      if (this.phaseT >= 1.2) { this.round++; this.pick = freshPickups(); this.resetActors(); }
      return;
    }
    if (this.phase !== 'play') return;

    this.t += dt; this.playTime += dt;
    if (this.playTime >= this.timeLimit) this.lastLife = true;   // nach 5 min: laufendes Leben noch zu Ende
    if (!this.frightened) {
      this.modeT += dt;
      for (const b of this.bugs) b.fright = false;
      const m = this.mode;
      if (m !== this.lastMode) { this.lastMode = m; for (const b of this.bugs) if (b.state === 'active') b.dir = OPP[b.dir]; }
    }

    // Spielfigur
    this.player.acc += PLAYER_PX_S * dt;
    while (this.player.acc >= 1) { this.player.acc -= 1; this.stepPlayer(); if (this.phase !== 'play') return; }

    // Bugs
    const d = this.diff;
    for (const b of this.bugs) {
      if (b.state === 'nest') { if (this.t >= b.releaseAt) b.state = 'exiting'; else continue; }
      if (b.state === 'eaten') { if (this.t >= b.respawnAt) { [b.x, b.y] = [b.home[0] * T, NEST.row * T]; b.state = 'exiting'; b.fright = false; } else continue; }
      const [c, r] = tileOf(b);
      let sp = PLAYER_PX_S * d.bugSpeed;
      if (b.fright) sp = PLAYER_PX_S * 0.5;
      if (b.state === 'exiting') sp = PLAYER_PX_S * 0.5;
      if (inTunnel(c, r)) sp *= 0.5;                              // im Tunnel halbe Geschwindigkeit
      b.acc += sp * dt;
      while (b.acc >= 1) { b.acc -= 1; this.stepBug(b); }
    }
    this.checkCollisions();
    if (this.frightened === false && this.frightUntil > 0 && this.t >= this.frightUntil) for (const b of this.bugs) b.fright = false;
  }

  private stepPlayer() {
    const p = this.player;
    if (aligned(p)) {
      const [c, r] = tileOf(p);
      this.eat(c, r);
      if (this.phase !== 'play') return;
      if (this.queued && walkable(c + DV[this.queued][0], r + DV[this.queued][1])) p.dir = this.queued;
      if (!walkable(c + DV[p.dir][0], r + DV[p.dir][1])) return;  // steht vor der Wand
    }
    p.x = (p.x + DV[p.dir][0] + MW) % MW;
    p.y += DV[p.dir][1];
    if (aligned(p)) { const [c, r] = tileOf(p); this.eat(c, r); }
  }

  private eat(c: number, r: number) {
    const k = key(((c % W) + W) % W, r);
    if (this.pick.dots.delete(k)) this.addScore(BIT_POINTS);
    else if (this.pick.powers.delete(k)) {
      this.addScore(CUP_POINTS);
      const sec = this.diff.coffeeSec;
      if (sec > 0) {
        this.frightUntil = this.t + sec; this.chain = 0;
        for (const b of this.bugs) if (b.state !== 'eaten') { if (b.state === 'active' && !b.fright) b.dir = OPP[b.dir]; b.fright = true; }
      }
    }
    if (this.pick.dots.size === 0 && this.pick.powers.size === 0) { this.phase = 'clear'; this.phaseT = 0; }
  }

  addScore(n: number) {
    this.score += n;
    if (!this.extraGiven && this.score >= EXTRA_LIFE_AT) { this.extraGiven = true; this.lives++; }
  }

  /** Durchgang für Bugs: Wände nie, Tür nur beim Verlassen des Nests */
  private bugPass(c: number, r: number, b: Bug) { const ch = cell(c, r); return ch !== '#' && (ch !== '-' || b.state === 'exiting'); }

  private target(b: Bug): [number, number] | null {
    const [pc, pr] = tileOf(this.player);
    if (b.fright) return null;                                  // gefangbar: zufällig
    if (this.mode === 'scatter') return CORNERS[b.name];
    switch (b.name) {
      case 'SYNTAX': return [pc, pr];                           // jagt direkt
      case 'NULL': { const [dx, dy] = DV[this.player.dir]; return [pc + 4 * dx, pr + 4 * dy]; } // 4 Kacheln vor die Figur
      case 'LOOP': {                                            // umrundet einen Bereich
        const [bc, br] = tileOf(b), w = LOOP_WAYPOINTS[b.wp];
        if (Math.abs(bc - w[0]) + Math.abs(br - w[1]) <= 1) b.wp = (b.wp + 1) % LOOP_WAYPOINTS.length;
        return LOOP_WAYPOINTS[b.wp];
      }
      case 'RACE': return null;                                 // an Kreuzungen zufällig
    }
  }

  private stepBug(b: Bug) {
    if (b.state === 'exiting') {                                // Nest verlassen: zur Türspalte, dann hoch
      const ex = NEST.exit.c * T, ey = NEST.exit.r * T;
      if (b.x !== ex) b.x += Math.sign(ex - b.x);
      else if (b.y > ey) b.y -= 1;
      else { b.state = 'active'; b.dir = 'left'; }
      return;
    }
    if (aligned(b)) {
      const [c, r] = tileOf(b);
      const opts = ORDER.filter((d) => d !== OPP[b.dir] && this.bugPass(c + DV[d][0], r + DV[d][1], b));
      const choices = opts.length ? opts : [OPP[b.dir]];
      const tgt = this.target(b);
      if (b.name === 'LOOP' && tgt && !b.fright && this.mode === 'chase') {
        const dm = LOOP_DIST[b.wp];
        b.dir = choices.reduce((best, d) => ((dm.get(`${(((c + DV[d][0]) % W) + W) % W},${r + DV[d][1]}`) ?? 1e9) < (dm.get(`${(((c + DV[best][0]) % W) + W) % W},${r + DV[best][1]}`) ?? 1e9) ? d : best), choices[0]);
      } else if (!tgt) b.dir = choices[Math.floor(this.rng() * choices.length)];
      else {
        let best = choices[0], bd = Infinity;
        for (const d of choices) {
          const nc = c + DV[d][0], nr = r + DV[d][1];
          const dist = (nc - tgt[0]) ** 2 + (nr - tgt[1]) ** 2;
          if (dist < bd) { bd = dist; best = d; }
        }
        b.dir = best;
      }
    }
    b.x = (b.x + DV[b.dir][0] + MW) % MW;
    b.y += DV[b.dir][1];
  }

  private checkCollisions() {
    for (const b of this.bugs) {
      if (b.state !== 'active' && b.state !== 'exiting') continue;
      if (!collide(this.player, b)) continue;
      if (b.fright) {
        this.addScore(CATCH_POINTS[Math.min(this.chain, CATCH_POINTS.length - 1)]);
        this.chain++; b.state = 'eaten'; b.fright = false; b.respawnAt = this.t + 3;
      } else { this.phase = 'dying'; this.phaseT = 0; return; }
    }
  }
}
export { H, TUNNEL_ROW };
