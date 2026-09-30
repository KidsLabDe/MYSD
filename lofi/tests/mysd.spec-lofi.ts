import { describe, it, expect } from 'vitest';
import { selectDay, schoolName, toEventCfg, validData, type HackdayData } from '../src/mysd';
import { resolve, calOffset, anchor } from '../src/schedule';

const at = (iso: string, hm: string) => { const [y, m, d] = iso.split('-').map(Number); const [h, mi] = hm.split(':').map(Number); return new Date(y, m - 1, d, h, mi).getTime(); };
const ort = { name: 'Wertingen', latitude: 48.56, longitude: 10.68 };
const data: HackdayData = {
  title: 'Make Your School · Gymnasium Wertingen', boardTitle: 'MYS Hackday',
  days: [
    { date: '2026-09-29', schedule: [
      { id: 'd2-01', start: '10:00', end: '12:00', title: 'Arbeitsphase', kind: 'phase' },
      { id: 'd2-02', start: '12:00', end: '13:00', title: 'Mittagspause', kind: 'meal' },
      { id: 'd2-03', start: '13:00', end: '15:00', title: 'Arbeitsphase', kind: 'phase' },
      { id: 'd2-04', start: '15:00', end: '15:15', title: 'Zwischenpräsentation', kind: 'talk' } ] },
    { date: '2026-09-28', schedule: [
      { id: 'd1-01', start: '09:00', end: '09:30', title: 'Ideenfindung', kind: 'phase' },
      { id: 'd1-02', start: '09:45', end: '10:00', title: 'Pause', kind: 'break' } ] },
    { date: '2026-09-30', schedule: [{ id: 'd3-01', start: '08:00', end: '12:00', title: 'Arbeitsphase', kind: 'phase' }] },
  ],
};

describe('MYSD-Adapter', () => {
  it('wählt heute, sonst den nächsten Tag, nach dem Event den letzten', () => {
    expect(selectDay(data.days, new Date(2026, 8, 29, 20))?.date).toBe('2026-09-29');
    expect(selectDay(data.days, new Date(2026, 8, 1))?.date).toBe('2026-09-28');
    expect(selectDay(data.days, new Date(2026, 9, 5))?.date).toBe('2026-09-30');
  });
  it('liest den Schulnamen aus dem Titel', () => {
    expect(schoolName('Make Your School · Gymnasium Wertingen')).toBe('Gymnasium Wertingen');
    expect(schoolName('Hackday')).toBe('Hackday');
  });
  it('übersetzt Arten in Jalousie und Pause', () => {
    const cfg = toEventCfg(data, ort, new Date(2026, 8, 29, 9))!;
    expect(cfg.title).toBe('MYS Hackday');
    expect(cfg.location.name).toBe('Gymnasium Wertingen');
    expect(cfg.day).toBe('2026-09-29');
    expect(cfg.phases.map((p) => [p.blinds, p.type ?? ''])).toEqual([[0, ''], [50, 'pause'], [0, ''], [100, '']]);
  });
  it('erkennt ungültige Daten', () => {
    expect(validData({ days: [] })).toBe(false);
    expect(validData({ days: [{ date: '2026-09-29', schedule: [{ title: 'x', start: '9', end: '10:00' }] }] })).toBe(false);
    expect(validData(data)).toBe(true);
  });
});

describe('Zeitmodell mit festem Tag und Lücken', () => {
  const cfg = toEventCfg(data, ort, new Date(2026, 8, 28, 7))!;
  it('bezieht die Zeiten auf den Plan-Tag, nicht auf heute', () => {
    expect(anchor(cfg, at('2026-09-27', '12:00'))).toBe(at('2026-09-28', '00:00'));
    const r = resolve(cfg, [], at('2026-09-27', '23:00'));
    expect(r).toMatchObject({ idx: 0, waiting: true, gap: false, state: 'pause' });
    expect(r.remaining).toBe(10 * 3600_000);
  });
  it('zeigt in einer Lücke Pause mit halber Jalousie', () => {
    const r = resolve(cfg, [], at('2026-09-28', '09:35'));
    expect(r).toMatchObject({ idx: 1, waiting: true, gap: true, state: 'pause', struck: 1, nowRow: -1, blinds: 50 });
  });
  it('ist nach dem letzten Eintrag vorbei', () => {
    expect(resolve(cfg, [], at('2026-09-28', '10:30')).ende).toBe(true);
  });
});

describe('Kalenderfenster', () => {
  it('bleibt bei bis zu 8 Einträgen stehen', () => {
    for (let s = 0; s <= 8; s++) expect(calOffset(s, 8)).toBe(0);
  });
  it('wandert bei 10 Einträgen mit und zeigt am Ende die letzten 8', () => {
    expect([0, 5, 6, 7, 8, 10].map((s) => calOffset(s, 10))).toEqual([0, 0, 1, 2, 2, 2]);
  });
});
