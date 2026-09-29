/**
 * Which board UI to show (Modern or Pixel). The choice is made on the first
 * visit and holds for one event only: it resets once that event is over or the
 * plan is swapped for another event. Pure and clock-free, like `days.ts`.
 */

import type { HackdayDay } from "../types";
import { dayOffset, toIsoDate } from "./days";

export type UiVariant = "modern" | "pixel";

export const UI_VARIANTS: readonly UiVariant[] = ["modern", "pixel"] as const;

/** A stored choice, as kept in `localStorage`. */
export interface UiChoice {
  readonly ui: UiVariant;
  /** The event it was made for (see `eventKey`). */
  readonly event: string;
  /** Last calendar day (`YYYY-MM-DD`) the choice holds. */
  readonly until: string;
}

function isUiVariant(value: unknown): value is UiVariant {
  return typeof value === "string" && (UI_VARIANTS as readonly string[]).includes(value);
}

/** Identifies an event by its first and last day, e.g. `"2026-09-28/2026-09-30"`. */
export function eventKey(days: readonly HackdayDay[]): string | null {
  const dates = days.map((d) => d.date).sort();
  const first = dates[0];
  const last = dates[dates.length - 1];
  return first === undefined || last === undefined ? null : `${first}/${last}`;
}

/**
 * A choice for the plan's event, held through its last day. Made after the
 * event is over (before the next plan is in), it holds for the rest of today.
 */
export function makeChoice(ui: UiVariant, days: readonly HackdayDay[], now: Date): UiChoice | null {
  const event = eventKey(days);
  if (event === null) return null;
  const last = event.slice(event.indexOf("/") + 1);
  const today = toIsoDate(now);
  return { ui, event, until: last > today ? last : today };
}

/** The UI to show, or null when the visitor has to pick (again). */
export function activeUi(
  choice: UiChoice | null,
  days: readonly HackdayDay[],
  now: Date,
): UiVariant | null {
  if (choice === null || choice.event !== eventKey(days)) return null;
  return dayOffset(choice.until, now) >= 0 ? choice.ui : null;
}

/** Reads a stored choice; anything malformed counts as no choice. */
export function parseChoice(raw: string | null): UiChoice | null {
  if (raw === null) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof value !== "object" || value === null) return null;
  const { ui, event, until } = value as Record<string, unknown>;
  if (!isUiVariant(ui) || typeof event !== "string" || typeof until !== "string") return null;
  return { ui, event, until };
}

/** A UI forced via `?ui=modern|pixel` (for testing; never stored). */
export function parseUiParam(search: string): UiVariant | null {
  const ui = new URLSearchParams(search).get("ui");
  return isUiVariant(ui) ? ui : null;
}
