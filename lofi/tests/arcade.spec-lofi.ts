import { describe, it, expect } from 'vitest';
import { ROWS, W, H, freshPickups, reachable, walkable, key, TUNNEL_ROW } from '../src/arcade/maze';
import { difficulty, modeAt } from '../src/arcade/difficulty';
import { Game, collide, mulberry32, PLAYER_START } from '../src/arcade/game';
import { parse, insert, qualifies, cleanName, sort, type Entry } from '../src/arcade/leaderboard';
import { GameSequence, dashboardAction, route } from '../src/arcade/keys';

describe('Labyrinth', () => {
  it('28×20, 214 Bits + 4 Tassen', () => {
    expect(ROWS.length).toBe(H); expect(ROWS.every((r) => r.length === W)).toBe(true);
    const p = freshPickups(); expect(p.dots.size).toBe(214); expect(p.powers.size).toBe(4);
  });
  it('alle Bits und Tassen erreichbar (ab Startkachel)', () => {
    const r = reachable(...PLAYER_START); const p = freshPickups();
    expect([...p.dots, ...p.powers].every((k) => r.has(k))).toBe(true);
  });
  it('Startkachel ist begehbar, keine Sackgassen', () => {
    expect(walkable(...PLAYER_START)).toBe(true);
    for (const k of reachable(...PLAYER_START)) {
      const [c, r] = k.split(',').map(Number);
      const n = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dc, dr]) => walkable(c + dc, r + dr)).length;
      expect(n, k).toBeGreaterThanOrEqual(2);
    }
  });
  it('Tunnel in Zeile 10 wrappt', () => {
    expect(walkable(-1, TUNNEL_ROW)).toBe(true); expect(walkable(W, TUNNEL_ROW)).toBe(true);
    const g = new Game(mulberry32(1)); g.phase = 'play';
    g.player = { x: 0, y: TUNNEL_ROW * 6, dir: 'left', acc: 0 }; g.bugs = [];
    g.step(0.05); expect(g.player.x).toBeGreaterThan(160);
  });
});
describe('Kollision', () => {
  it('Überlappung < 4 px zählt, auch über den Tunnel', () => {
    expect(collide({ x: 60, y: 60 }, { x: 63, y: 60 })).toBe(true);
    expect(collide({ x: 60, y: 60 }, { x: 64, y: 60 })).toBe(false);
    expect(collide({ x: 0, y: 60 }, { x: 166, y: 60 })).toBe(true);
  });
  it('Bug trifft Figur → Leben weg; gefangbarer Bug → Punkte 200/400', () => {
    const g = new Game(mulberry32(2)); g.phase = 'play';
    g.bugs[0].x = g.player.x + 2; g.bugs[0].y = g.player.y; g.step(0.001);
    expect(g.phase).toBe('dying');
    const h = new Game(mulberry32(3)); h.phase = 'play'; h.frightUntil = 99;
    for (const b of h.bugs) { b.state = 'active'; b.fright = true; b.x = h.player.x; b.y = h.player.y; }
    h.step(0.001); expect(h.score).toBe(200 + 400 + 800 + 1600);
  });
});
describe('Schwierigkeit', () => {
  it('Tabelle Arcade_Ablauf', () => {
    expect(difficulty(1)).toEqual({ bugSpeed: 0.75, coffeeSec: 6 });
    expect(difficulty(2)).toEqual({ bugSpeed: 0.85, coffeeSec: 5 });
    expect(difficulty(4)).toEqual({ bugSpeed: 0.85, coffeeSec: 3 });
    expect(difficulty(5)).toEqual({ bugSpeed: 0.95, coffeeSec: 2 });
    expect(difficulty(8)).toEqual({ bugSpeed: 0.95, coffeeSec: 1 });
    expect(difficulty(9)).toEqual({ bugSpeed: 0.95, coffeeSec: 0 });
    expect(difficulty(20).coffeeSec).toBe(0);
  });
  it('Wellen: Streuen 7 s / Jagen 20 s, 4×, danach nur Jagen', () => {
    expect(modeAt(0)).toBe('scatter'); expect(modeAt(7)).toBe('chase'); expect(modeAt(27)).toBe('scatter');
    expect(modeAt(4 * 27 - 1)).toBe('chase'); expect(modeAt(1000)).toBe('chase');
  });
  it('Kaffee in Runde 9 macht nichts fangbar', () => {
    const g = new Game(mulberry32(4)); g.round = 9; g.phase = 'play';
    g.pick.powers.add(key(13, 16)); g.step(0.03);
    expect(g.bugs.some((b) => b.fright)).toBe(false);
  });
});
describe('Tastenfolge G·A·M·E', () => {
  it('innerhalb von 2 s → Start, Groß/klein egal', () => {
    const s = new GameSequence();
    expect([s.push('g', 0), s.push('A', 500), s.push('m', 1000), s.push('E', 1900)]).toEqual([false, false, false, true]);
  });
  it('zu langsam oder unterbrochen → nichts', () => {
    const s = new GameSequence();
    ['g', 'a', 'm'].forEach((k, i) => s.push(k, i * 800)); expect(s.push('e', 2100)).toBe(false);
    const u = new GameSequence(); u.push('g', 0); u.push('a', 100); u.push('x', 200); u.push('m', 300); expect(u.push('e', 400)).toBe(false);
  });
  it('G, A, M, E einzeln lösen im Dashboard nichts aus', () => {
    for (const k of ['g', 'a', 'm', 'e', 'G', 'A', 'M', 'E']) expect(dashboardAction(k)).toBeNull();
  });
  it('solange das Spiel offen ist, gehen alle Tasten ans Spiel', () => {
    for (const k of ['ArrowRight', 'ArrowLeft', '+', '-', 'p', 'j', 'w', 'f', 'r', 'd', 'k', 'h', 'l', '?']) {
      expect(dashboardAction(k)).not.toBeNull();
      expect(route(true)).toBe('arcade');
    }
    expect(route(false)).toBe('dashboard');
  });
});
describe('Rangliste', () => {
  const mk = (n: number): Entry[] => Array.from({ length: n }, (_, i) => ({ name: 'P' + i, score: (n - i) * 100, date: `2026-01-${String(i + 1).padStart(2, '0')}` }));
  it('Einfügen, Sortieren, auf 10 kürzen', () => {
    const { list, index } = insert(mk(10), 'neu', 550, '2026-09-30');
    expect(list.length).toBe(10); expect(index).toBe(5); expect(list[5].name).toBe('NEU');
    expect(list.map((e) => e.score)).toEqual([...list.map((e) => e.score)].sort((a, b) => b - a));
  });
  it('Gleichstand: älterer Eintrag zuerst; Gleichstand mit Platz 10 qualifiziert nicht', () => {
    const l = sort([{ name: 'B', score: 5, date: '2026-02' }, { name: 'A', score: 5, date: '2026-01' }]);
    expect(l[0].name).toBe('A');
    expect(qualifies(mk(10), 100)).toBe(false); expect(qualifies(mk(10), 101)).toBe(true); expect(qualifies(mk(3), 1)).toBe(true);
  });
  it('kaputtes JSON → leere Liste', () => {
    expect(parse('{kaputt')).toEqual([]); expect(parse('{"a":1}')).toEqual([]);
    expect(parse('[{"name":"A","score":"x","date":"d"}]')).toEqual([]); expect(parse(null)).toEqual([]);
  });
  it('Namen: max. 8 Zeichen, erlaubte Zeichen, trimmen, leer → ???', () => {
    expect(cleanName('abcdefghijk')).toBe('ABCDEFGH'); expect(cleanName('  ä!  ')).toBe('???'); expect(cleanName(' ZOE 26 ')).toBe('ZOE 26');
  });
});
describe('Simulation', () => {
  it('läuft 5 Spielminuten mit Zufallseingaben ohne Fehler und endet', () => {
    const g = new Game(mulberry32(7)); const rng = mulberry32(8); const dirs = ['left', 'right', 'up', 'down'] as const;
    for (let i = 0; i < 60 * 60 * 8 && g.phase !== 'over'; i++) { if (i % 30 === 0) g.input(dirs[Math.floor(rng() * 4)]); g.step(1 / 60); }
    expect(g.score).toBeGreaterThan(0);
    for (const b of g.bugs) { expect(b.x % 1).toBe(0); expect(b.y % 1).toBe(0); }
  });
});
