/**
 * KidsLab brand constants, derived from kidslab.de.
 *
 * Primary color is a vivid blue `hsl(204 100% 50%)`; the display typeface is
 * "Pixelify Sans" and body copy is "Inter". These are mirrored as CSS custom
 * properties in `index.css` — keep the two in sync.
 */

import type { ProjectStatus } from "../types";

export const BRAND = {
  name: "KidsLab",
  tagline: "Digitale Bildung für junge Menschen",
  primaryHue: 204,
} as const;

/** Human-readable German labels for each project status. */
export const STATUS_LABELS: Readonly<Record<ProjectStatus, string>> = {
  idea: "Idee",
  building: "In Arbeit",
  testing: "Testphase",
  done: "Fertig",
};

/**
 * Palette index (0–4) per status, mapped to `--cat-*` CSS variables so status
 * chips stay consistent with the categorical palette used elsewhere.
 */
export const STATUS_TONE: Readonly<Record<ProjectStatus, string>> = {
  idea: "slate",
  building: "amber",
  testing: "blue",
  done: "green",
};

/** Deterministic categorical palette keys for project categories. */
const CATEGORY_TONES = ["blue", "purple", "orange", "green", "pink"] as const;

/**
 * Assigns a stable palette tone to a category string so the same category
 * always renders in the same color without hard-coding a mapping.
 */
export function toneForCategory(category: string): string {
  let hash = 0;
  for (let i = 0; i < category.length; i += 1) {
    hash = (hash * 31 + category.charCodeAt(i)) >>> 0;
  }
  const tone = CATEGORY_TONES[hash % CATEGORY_TONES.length];
  return tone ?? "blue";
}
