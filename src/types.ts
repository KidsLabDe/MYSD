/**
 * Domain types for the MYS (Make Your School) Hackday dashboard.
 *
 * The dashboard is a live agenda board: it shows the plan for the day — which
 * `AgendaItem` is running right now and what comes next. Everything is
 * read-only and seeded from `src/data/hackday.json`.
 */

/** Kind of an agenda item, driving its label, color and icon. */
export type AgendaKind = "phase" | "meal" | "break" | "talk";

export const AGENDA_KINDS: readonly AgendaKind[] = [
  "phase",
  "meal",
  "break",
  "talk",
] as const;

/** A single point in the day's plan (a work phase, a meal, a break, a talk). */
export interface AgendaItem {
  readonly id: string;
  /** Start time as `"HH:MM"` (24h, local to the venue). */
  readonly start: string;
  /** End time as `"HH:MM"`. Must be later than `start`. */
  readonly end: string;
  readonly title: string;
  readonly kind: AgendaKind;
  /** Optional room / place, e.g. "Aula", "Makerspace". */
  readonly location?: string;
  /** Optional one-line hint shown with the item. */
  readonly note?: string;
}

/** One event day and its plan. */
export interface HackdayDay {
  /** Calendar date as an ISO `YYYY-MM-DD` string (local to the venue). */
  readonly date: string;
  readonly schedule: readonly AgendaItem[];
}

/** Shape of the seed data file (`src/data/hackday.json`). */
export interface HackdayData {
  /** Event name, e.g. "Make Your School · St. Ursula". */
  readonly title: string;
  /** The event's days; the board shows today's (see `lib/days.ts`). */
  readonly days: readonly HackdayDay[];
  /** Important notes scrolling in the live ticker at the bottom (optional). */
  readonly messages?: readonly string[];
}
