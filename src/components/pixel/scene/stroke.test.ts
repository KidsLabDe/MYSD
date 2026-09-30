import { describe, it, expect } from 'vitest';
import { strokePose } from './anim';
// Tabelle „Positionen je Zeile“ aus design/CHANGES.md (left in px, armDy Anfang/Ende)
const T: [number, string, number, number, number, number, number][] = [
  [0, 'up', 270, 1284, 1644, 0, -1], [1, 'steil', 270, 1236, 1596, 0, -1], [2, 'up', 378, 1284, 1644, 2, 1], [3, 'diag', 378, 1164, 1524, -1, -2],
  [4, 'flach', 378, 1194, 1554, 0, -1], [5, 'waagrecht', 378, 1176, 1536, 0, -1], [6, 'leichtRunter', 378, 1188, 1548, 0, -1], [7, 'runter', 378, 1188, 1548, 0, -1],
];
describe('strokePose = Tabelle design/CHANGES.md', () => {
  for (const [i, arm, top, l0, l1, d0, d1] of T) it(`Zeile ${i}`, () => {
    expect(strokePose(i, 2)).toEqual({ left: l0, top, arm, armDy: d0 });
    expect(strokePose(i, 62)).toEqual({ left: l1, top, arm, armDy: d1 });
  });
  it('left wächst pro Pixel um genau 6 px (ganze Pixel)', () => {
    for (let i = 0; i < 8; i++) for (let n = 3; n <= 62; n++) expect(strokePose(i, n).left - strokePose(i, n - 1).left).toBe(6);
  });
});
