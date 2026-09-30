import { describe, expect, it } from 'vitest';
import {
  TEAR_START, digitPath, isTearKey, landY, makeFaller, pageColors, pagePose, pileShadow, stepTear, tearPage,
  type Landed, type TearState,
} from './tear';

const half = () => 0.5;
const landed = (cx: number): Landed => ({ num: 1, cx, cy: 655, rot: 0, skew: 0, sy: 0.32, fill: '#F4F2EC', ink: '#3D8FD1' });
/** Läuft die Frames bis alle Blätter liegen (max. 10 s) */
function settle(s: TearState, from: number): TearState {
  let cur = s;
  for (let t = from; cur.fallers.length && t < from + 10_000; t += 16) cur = stepTear(cur, t);
  return cur;
}

describe('isTearKey', () => {
  it('should react only to the presenter keys PageDown and PageUp', () => {
    expect(isTearKey('PageDown')).toBe(true);
    expect(isTearKey('PageUp')).toBe(true);
    for (const k of ['ArrowRight', 'ArrowLeft', ' ', 'Enter', 'j']) expect(isTearKey(k)).toBe(false);
  });
});

describe('tearPage', () => {
  it('should start on day 1 with no pile', () => {
    expect(TEAR_START).toEqual({ day: 1, fallers: [], pile: [] });
  });

  it('should show the next day and send the torn page falling', () => {
    const s = tearPage(TEAR_START, 1000, half);
    expect(s.day).toBe(2);
    expect(s.fallers).toHaveLength(1);
    expect(s.fallers[0]!.num).toBe(1);
    expect(TEAR_START.fallers).toHaveLength(0);
  });

  it('should keep several pages in the air on fast presses', () => {
    const s = tearPage(tearPage(tearPage(TEAR_START, 0, half), 50, half), 100, half);
    expect(s.fallers.map((f) => f.num)).toEqual([1, 2, 3]);
    expect(s.day).toBe(4);
  });

  it('should reset to day 1 and clear the pile after day 31', () => {
    const full: TearState = { day: 31, fallers: [], pile: [landed(40)] };
    expect(tearPage(full, 0, half)).toEqual(TEAR_START);
  });
});

describe('pageColors', () => {
  it('should give even days a blue page with a white number', () => {
    expect(pageColors(2, false)).toEqual({ fill: '#3D8FD1', ink: '#F4F2EC' });
    expect(pageColors(2, true).fill).toBe('#3682C0');
  });

  it('should give odd days a white page with a blue number', () => {
    expect(pageColors(1, false)).toEqual({ fill: '#F4F2EC', ink: '#3D8FD1' });
    expect(pageColors(31, true).fill).toBe('#E6E6E2');
  });
});

describe('landY', () => {
  it('should land on the floor when the pile is empty', () => {
    expect(landY(50, [])).toBe(655);
  });

  it('should rise by 5 px per page directly below and fade out over 42 px', () => {
    expect(landY(50, [landed(50)])).toBe(650);
    expect(landY(71, [landed(50)])).toBe(652.5);
    expect(landY(92, [landed(50)])).toBe(655);
  });

  it('should cap the heap at 66 px', () => {
    expect(landY(50, Array.from({ length: 40 }, () => landed(50)))).toBe(655 - 66);
  });
});

describe('pagePose', () => {
  const f = makeFaller(1, 0, half);

  it('should start on the pad with the page upright', () => {
    const p = pagePose(f, 0, []);
    expect(p).toMatchObject({ landed: false, cx: 39, cy: 78, rot: 0, sy: 1 });
  });

  it('should tip counterclockwise around the top-right corner while tearing', () => {
    const p = pagePose(f, 240, []);
    expect(p.rot).toBeCloseTo(-f.tearA);
    // Die obere rechte Ecke (66, 42) bleibt am Block
    const r = (p.rot * Math.PI) / 180;
    expect(p.cx + 27 * Math.cos(r) + 36 * Math.sin(r)).toBeCloseTo(66);
    expect(p.cy + 27 * Math.sin(r) - 36 * Math.cos(r)).toBeCloseTo(42);
  });

  it('should stay within x 12…150 while falling', () => {
    for (let t = 300; t < 2500; t += 20) {
      const p = pagePose(makeFaller(1, 0, () => 0.99), t, []);
      expect(p.cx >= 12 && p.cx <= 150).toBe(true);
    }
  });

  it('should land on the pile eventually', () => {
    expect(pagePose(f, 5000, [])).toMatchObject({ landed: true, cy: 655 });
  });
});

describe('stepTear', () => {
  it('should move landed pages onto the pile, flat', () => {
    const s = settle(tearPage(TEAR_START, 0, half), 0);
    expect(s.fallers).toHaveLength(0);
    expect(s.pile).toHaveLength(1);
    expect(s.pile[0]).toMatchObject({ num: 1, cy: 655, sy: 0.32 });
  });

  it('should stack pages that land at the same spot', () => {
    const s = settle(tearPage(settle(tearPage(TEAR_START, 0, half), 0), 20_000, half), 20_000);
    expect(s.pile[0]!.cy).toBe(655);
    expect(s.pile[1]!.cy).toBeLessThan(655);
  });

  it('should return the same state when nothing falls', () => {
    const s: TearState = { day: 3, fallers: [], pile: [landed(40)] };
    expect(stepTear(s, 100)).toBe(s);
  });
});

describe('digitPath', () => {
  it('should center a single digit at x 3–5 on rows 4–8', () => {
    const d = digitPath(1);
    expect(d.startsWith('M4 4h1v1h-1z')).toBe(true);
    expect((d.match(/M/g) ?? []).length).toBe(8);
  });

  it('should set two digits at x 1–3 and x 5–7', () => {
    const d = digitPath(31);
    expect(d.startsWith('M1 4')).toBe(true);
    expect(d).toContain('M6 4h1v1h-1z');
  });
});

describe('pileShadow', () => {
  it('should be absent without a pile', () => {
    expect(pileShadow([])).toBeNull();
  });

  it('should span the pile centers ±30 px, snapped to 6 px', () => {
    expect(pileShadow([landed(40), landed(100)])).toEqual({ left: 12, width: 120 });
  });
});
