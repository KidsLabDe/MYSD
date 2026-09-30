import { describe, expect, it } from 'vitest';
import { CAL_ROWS, calOffset, hhmm, hms } from './format';

describe('hhmm', () => {
  it('should pad hours and minutes', () => {
    expect(hhmm(new Date(2026, 8, 30, 9, 5).getTime())).toBe('09:05');
  });
});

describe('hms', () => {
  it('should round seconds up and pad every part', () => {
    expect(hms(3_723_001)).toBe('01:02:04');
  });

  it('should never go below zero', () => {
    expect(hms(-5000)).toBe('00:00:00');
  });
});

describe('calOffset', () => {
  it('should not scroll a day that fits the calendar', () => {
    expect(calOffset(7, CAL_ROWS)).toBe(0);
  });

  it('should keep the current row at most in row 6 on longer days', () => {
    expect(calOffset(5, 10)).toBe(0);
    expect(calOffset(6, 10)).toBe(1);
    expect(calOffset(10, 10)).toBe(2);
  });
});
