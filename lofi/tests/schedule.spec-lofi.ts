import { describe, it, expect } from 'vitest';
import { resolve, applyOps, baseSlots, hhmm, hms, type EventCfg } from '../src/schedule';

const cfg: EventCfg = {
  title: 'T', location: { name: 'X', latitude: 0, longitude: 0 },
  phases: [
    { name: 'A', start: '09:00', end: '10:00', blinds: 40 },
    { name: 'Mittag', start: '10:00', end: '10:30', blinds: 0, type: 'pause' },
    { name: 'C', start: '10:30', end: '12:00', blinds: 100 },
  ],
};
const at = (hm: string) => { const d = new Date(2026, 10, 14); const [h, m] = hm.split(':').map(Number); d.setHours(h, m, 0, 0); return d.getTime(); };
const M = 60_000;

describe('resolve', () => {
  it('vor Beginn: pause, kein JETZT, Countdown bis Start', () => {
    const r = resolve(cfg, [], at('08:30'));
    expect(r).toMatchObject({ idx: 0, waiting: true, state: 'pause', nowRow: -1, struck: 0, blinds: 40 });
    expect(hms(r.remaining)).toBe('00:30:00');
  });
  it('laeuft, endspurt, pause, ende', () => {
    expect(resolve(cfg, [], at('09:30')).state).toBe('laeuft');
    expect(resolve(cfg, [], at('09:56')).state).toBe('endspurt');
    expect(resolve(cfg, [], at('10:28')).state).toBe('pause'); // Pause gewinnt vor Endspurt
    const e = resolve(cfg, [], at('12:00'));
    expect(e).toMatchObject({ ende: true, idx: 3, struck: 3, state: 'ende', fill: 16 });
  });
  it('Fortschritt floor(anteil·16)', () => {
    expect(resolve(cfg, [], at('09:30')).fill).toBe(8);
    expect(resolve(cfg, [], at('09:59')).fill).toBe(15);
  });
  it('+5 verlängert aktuelle Phase und verschiebt alle folgenden', () => {
    const r = resolve(cfg, [{ t: 'extend', at: at('09:10'), ms: 5 * M }], at('10:02'));
    expect(r.idx).toBe(0);
    expect(r.slots.map((s) => hhmm(s.start))).toEqual(['09:00', '10:05', '10:35']);
  });
  it('→ beendet jetzt, nächste Phase beginnt jetzt, ihr Ende bleibt', () => {
    const r = resolve(cfg, [{ t: 'skip', at: at('09:40') }], at('09:41'));
    expect(r.idx).toBe(1);
    expect(hhmm(r.slots[1].start)).toBe('09:40');
    expect(hhmm(r.slots[1].end)).toBe('10:30');
    expect(hhmm(r.slots[2].start)).toBe('10:30');
  });
  it('→ vor Beginn startet die erste Phase sofort', () => {
    const r = resolve(cfg, [{ t: 'skip', at: at('08:50') }], at('08:51'));
    expect(r).toMatchObject({ idx: 0, waiting: false, state: 'laeuft' });
  });
  it('→ in der letzten Phase beendet den Tag', () => {
    expect(resolve(cfg, [{ t: 'skip', at: at('11:00') }], at('11:00')).ende).toBe(true);
  });
  it('← macht vorherige Phase ab jetzt mit voller Dauer aktiv', () => {
    const r = resolve(cfg, [{ t: 'back', at: at('10:10') }], at('10:11'));
    expect(r.idx).toBe(0);
    expect(r.slots.map((s) => hhmm(s.start) + '-' + hhmm(s.end))).toEqual(['10:10-11:10', '11:10-11:40', '11:40-13:10']);
  });
  it('→ dann ← (nach Tagesende) funktioniert', () => {
    const ops = [{ t: 'skip', at: at('11:00') } as const, { t: 'back', at: at('11:01') } as const];
    const r = resolve(cfg, ops, at('11:02'));
    expect(r.idx).toBe(2);
    expect(r.ende).toBe(false);
  });
  it('P friert den Countdown ein', () => {
    const ops = [{ t: 'pause', from: at('09:30'), to: null } as const];
    expect(resolve(cfg, ops, at('09:40')).remaining).toBe(30 * M);
    expect(resolve(cfg, ops, at('10:20')).remaining).toBe(30 * M);
    expect(resolve(cfg, ops, at('10:20')).paused).toBe(true);
    const done = [{ t: 'pause', from: at('09:30'), to: at('09:45') } as const];
    expect(hhmm(resolve(cfg, done, at('09:50')).slots[1].start)).toBe('10:15');
  });
  it('J-Override gilt nur in der gleichen Phase', () => {
    const ops = [{ t: 'blinds', at: at('09:10'), value: 100 } as const];
    expect(resolve(cfg, ops, at('09:20')).blinds).toBe(100);
    expect(resolve(cfg, ops, at('10:05')).blinds).toBe(0);
  });
  it('Basisslots ohne Ops unverändert', () => {
    const b = baseSlots(cfg, at('09:00'));
    expect(applyOps(b, [], at('09:00'))).toEqual(b);
  });
});
