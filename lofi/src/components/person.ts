// Person: SVG + Logik wörtlich aus design/Person.dc.html (src/generated/Person.ts, erzeugt von tools/gen-sprites.mjs).
// Hier nur Typen und Hilfswerte für die Animationen.
import { html as personGen } from '../generated/Person';
import type { Pose } from '../types';

export const ARMS = ['down', 'up', 'diag', 'steil', 'flach', 'waagrecht', 'leichtRunter', 'runter'] as const;
export type Arm = (typeof ARMS)[number];
export const VIEWS = ['back', 'right', 'left', 'front'] as const;
export type View = (typeof VIEWS)[number];
export const FACES = ['auto', 'neutral', 'smile', 'grin', 'blink'] as const;
export type Face = (typeof FACES)[number];
export const ARM_LEFT = ['down', 'greifen', 'druecken'] as const;
export type ArmLeft = (typeof ARM_LEFT)[number];
export const HOLDING = ['none', 'bulb', 'cube', 'rocket', 'heart', 'cup'] as const;
export type Holding = (typeof HOLDING)[number];

export interface PersonProps {
  pose: Pose; marker: boolean; arm?: Arm | null; armDy?: number;
  view?: View; face?: Face; armLeft?: ArmLeft; holding?: Holding; steamDy?: number;
}

export function personHtml(p: PersonProps): string {
  return personGen(
    { pose: p.pose, marker: p.marker, arm: p.arm ?? 'auto', armDy: p.armDy ?? 0, view: p.view ?? 'back', face: p.face ?? 'auto', armLeft: p.armLeft ?? 'down', holding: p.holding ?? 'none' },
    { steamDy: p.steamDy ?? 0 },
  );
}

/** y-Versatz der rechten Hand (Pixel) relativ zur Pose grab – für den Schnurgriff (Werte aus Person.dc.html). */
const HAND_DY: Partial<Record<Pose, number>> = { grab: 0, pullA: 9, pullB: 18 };
export const handDy = (pose: Pose) => HAND_DY[pose] ?? 0;

/** Stiftspitze je Arm (Sprite-Koordinaten): rechtestes Pixel x, oberes Pixel y. Aus design/CHANGES.md. */
export const TIP: Record<Arm, { x: number; top: number }> = {
  up: { x: 38, top: -8 }, steil: { x: 46, top: 2 }, diag: { x: 58, top: 5 }, flach: { x: 53, top: 14 },
  waagrecht: { x: 56, top: 24 }, leichtRunter: { x: 54, top: 34 }, runter: { x: 54, top: 44 }, down: { x: 38, top: 69 },
};
