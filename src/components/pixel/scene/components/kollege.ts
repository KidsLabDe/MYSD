// Kollege Fabi: SVG + Logik wörtlich aus design/Kollege.dc.html (generated/Kollege.ts, erzeugt von tools/gen-sprites.mjs).
// Gleiches Raster wie die Person: 264×600 px, Füße bei y 98, top 378 = Boden.
// Achtung: Das SVG zeichnet über die viewBox hinaus (waveB/open bis x −5, point bis x 57, pointUp bis y −4),
// der Layer braucht overflow: visible.
import { html as kollegeGen } from '../generated/Kollege';

export const KOLLEGE_VIEWS = ['front', 'back', 'right', 'left'] as const;
export type KollegeView = (typeof KOLLEGE_VIEWS)[number];
export const KOLLEGE_POSES = ['stand', 'walkA', 'walkB', 'waveA', 'waveB', 'talk', 'point', 'pointUp', 'open', 'think', 'clicker', 'clap'] as const;
export type KollegePose = (typeof KOLLEGE_POSES)[number];
export const KOLLEGE_FACES = ['auto', 'smile', 'talk', 'neutral', 'blink'] as const;
export type KollegeFace = (typeof KOLLEGE_FACES)[number];

export interface KollegeProps {
  readonly view: KollegeView;
  readonly pose: KollegePose;
  readonly face: KollegeFace;
}

export function kollegeHtml(p: KollegeProps): string {
  return kollegeGen({ view: p.view, pose: p.pose, face: p.face });
}
