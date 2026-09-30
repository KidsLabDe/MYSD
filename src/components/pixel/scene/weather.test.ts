import { describe, it, expect } from 'vitest';
import { mapWeather } from './weather';
describe('mapWeather', () => {
  it('Tabelle aus CLAUDE.md', () => {
    expect(mapWeather(0, 1)).toBe('sonnig'); expect(mapWeather(1, 1)).toBe('sonnig');
    for (const c of [2, 3, 45, 48]) expect(mapWeather(c, 1)).toBe('bewoelkt');
    for (const c of [51, 61, 67, 80, 82]) expect(mapWeather(c, 1)).toBe('regen');
    for (const c of [71, 77, 85, 86]) expect(mapWeather(c, 1)).toBe('schnee');
    for (const c of [95, 96, 99]) expect(mapWeather(c, 1)).toBe('gewitter');
    expect(mapWeather(95, 0)).toBe('nacht'); // Nacht hat Vorrang
  });
});
