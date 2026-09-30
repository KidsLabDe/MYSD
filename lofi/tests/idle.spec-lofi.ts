import { describe, it, expect } from 'vitest';
import { pickIdle, type IdleInput } from '../src/idle';
const base: IdleInput = { enabled: true, queueEmpty: true, phaseChangePending: false, remainingMs: 10 * 60_000, due: ['wave'], last: null };
describe('Leerlauf-Regeln', () => {
  it('startet, wenn alles frei ist', () => expect(pickIdle(base)).toBe('wave'));
  it('Vorrang: nicht bei laufender Warteschlange', () => expect(pickIdle({ ...base, queueEmpty: false })).toBeNull());
  it('Vorrang: nicht, wenn Abhaken/Jalousie ansteht', () => expect(pickIdle({ ...base, phaseChangePending: true })).toBeNull());
  it('60-s-Sperre vor Phasenende', () => {
    expect(pickIdle({ ...base, remainingMs: 59_999 })).toBeNull();
    expect(pickIdle({ ...base, remainingMs: 60_000 })).toBe('wave');
  });
  it('nach Tagesende erlaubt', () => expect(pickIdle({ ...base, remainingMs: Infinity })).toBe('wave'));
  it('keine Wiederholung derselben Animation', () => {
    expect(pickIdle({ ...base, last: 'wave' })).toBeNull();
    expect(pickIdle({ ...base, last: 'wave', due: ['wave', 'coffee'] })).toBe('coffee');
  });
  it('Drucker abholen und starten zählen als dieselbe Kategorie', () => {
    expect(pickIdle({ ...base, last: 'printFetch', due: ['printStart'] })).toBeNull();
    expect(pickIdle({ ...base, last: 'printFetch', due: ['printStart', 'wave'] })).toBe('wave');
  });
  it('L-Taste schaltet aus', () => expect(pickIdle({ ...base, enabled: false })).toBeNull());
  it('Priorität = Reihenfolge der fälligen', () => expect(pickIdle({ ...base, due: ['printFetch', 'wave'] })).toBe('printFetch'));
});
