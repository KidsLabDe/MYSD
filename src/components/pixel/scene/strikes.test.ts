import { describe, expect, it } from 'vitest';
import { STRIKES, strikeRects, strikeVariants, strikeY } from './strikes';
import { strokePose } from './anim';

describe('STRIKES', () => {
  it('should keep the design stroke as variant 0', () => {
    expect(STRIKES[0]).toEqual([[2, 15, 5], [16, 35, 4], [36, 51, 5], [52, 63, 4]]);
  });

  it('should cover columns 2–63 without gaps in every variant', () => {
    for (const segs of STRIKES) {
      expect(segs[0]![0]).toBe(2);
      expect(segs[segs.length - 1]![1]).toBe(63);
      segs.slice(1).forEach(([x0], k) => expect(x0).toBe(segs[k]![1] + 1));
    }
  });

  it('should stay on the text line (y 3–5) and only step by one pixel', () => {
    for (const segs of STRIKES) {
      for (const [, , y] of segs) expect(y >= 3 && y <= 5).toBe(true);
      segs.slice(1).forEach(([, , y], k) => expect(Math.abs(y - segs[k]![2])).toBe(1));
    }
  });
});

describe('strikeY', () => {
  it('should give the height of the segment under a column', () => {
    expect(strikeY(0, 2)).toBe(5);
    expect(strikeY(0, 16)).toBe(4);
    expect(strikeY(0, 63)).toBe(4);
  });
});

describe('strikeRects', () => {
  it('should draw each segment two pixels thick', () => {
    expect(strikeRects(0)).toBe(
      '<rect x="2" y="5" width="14" height="2"></rect><rect x="16" y="4" width="20" height="2"></rect>' +
        '<rect x="36" y="5" width="16" height="2"></rect><rect x="52" y="4" width="12" height="2"></rect>',
    );
  });
});

describe('strikeVariants', () => {
  const items = ['08:00 Arbeitsphase', '12:00 Mittagessen', '13:00 Arbeitsphase', '14:50 Video', '15:00 Pause', '16:30 Aufbau', '17:00 Marktplatz'];

  it('should be stable for the same plan', () => {
    expect(strikeVariants(items)).toEqual(strikeVariants(items));
  });

  it('should never repeat a stroke on neighbouring rows', () => {
    const v = strikeVariants([...items, ...items]);
    v.slice(1).forEach((x, k) => expect(x).not.toBe(v[k]));
  });

  it('should use more than one stroke on a normal day', () => {
    expect(new Set(strikeVariants(items)).size).toBeGreaterThan(2);
  });

  it('should only pick existing variants', () => {
    for (const x of strikeVariants(items)) expect(STRIKES[x]).toBeDefined();
  });
});

describe('strokePose with variants', () => {
  it('should keep the pen tip on the line of every variant', () => {
    for (let v = 0; v < STRIKES.length; v++) {
      for (let i = 0; i < 8; i++) {
        for (let n = 2; n <= 62; n++) {
          // Relative to the design stroke, the arm moves exactly as far as the line does.
          const dy = strokePose(i, n, v).armDy - strokePose(i, n, 0).armDy;
          expect(dy).toBe(strikeY(v, n + 1) - strikeY(0, n + 1));
        }
      }
    }
  });

  it('should keep the arm within the sprite offsets (±4)', () => {
    for (let v = 0; v < STRIKES.length; v++) {
      for (let i = 0; i < 8; i++) {
        for (let n = 2; n <= 62; n++) expect(Math.abs(strokePose(i, n, v).armDy)).toBeLessThanOrEqual(4);
      }
    }
  });
});
