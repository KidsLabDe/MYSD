/**
 * Multi-day logic: which event day the board shows, and how "now" maps onto
 * that day's clock. Pure and clock-free, like `schedule.ts`.
 */

import type { HackdayDay } from "../types";
import { parseTime, secondsOfDay } from "./schedule";

const DAY_SECONDS = 24 * 3600;
const DAY_MS = DAY_SECONDS * 1000;

const weekdayFmt = new Intl.DateTimeFormat("de-DE", { weekday: "long" });

export interface SelectedDay {
  readonly day: HackdayDay;
  /** Position of `day` among the date-sorted days (0-based). */
  readonly index: number;
  readonly count: number;
}

/** Local calendar date of `date` as `YYYY-MM-DD`. */
export function toIsoDate(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mm}-${dd}`;
}

function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  if (y === undefined || m === undefined || d === undefined || [y, m, d].some(Number.isNaN)) {
    throw new Error(`Ungültiges Datum: "${iso}" (erwartet YYYY-MM-DD)`);
  }
  return new Date(y, m - 1, d);
}

/** Whole calendar days from `now`'s date to `iso` (negative when in the past). */
export function dayOffset(iso: string, now: Date): number {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  // Rounding absorbs the ±1 h of a DST switch in between.
  return Math.round((parseIsoDate(iso).getTime() - today.getTime()) / DAY_MS);
}

function sortedDays(days: readonly HackdayDay[]): HackdayDay[] {
  return [...days].sort((a, b) => a.date.localeCompare(b.date));
}

/** Today's day; else the next upcoming one; else (event over) the last one. */
export function selectDay(days: readonly HackdayDay[], now: Date): SelectedDay | null {
  const sorted = sortedDays(days);
  if (sorted.length === 0) return null;
  const upcoming = sorted.findIndex((d) => dayOffset(d.date, now) >= 0);
  const index = upcoming === -1 ? sorted.length - 1 : upcoming;
  const day = sorted[index];
  return day === undefined ? null : { day, index, count: sorted.length };
}

/**
 * "Now" in seconds on `iso`'s clock: the time of day on the day itself,
 * negative before it (so the countdown runs across midnight), and past
 * 24 h after it (so the day reads as over).
 */
export function effectiveSeconds(iso: string, now: Date): number {
  return secondsOfDay(now) - dayOffset(iso, now) * DAY_SECONDS;
}

/** "Morgen geht’s um 08:00 weiter." for the day after `index`, or null on the last day. */
export function resumeLead(days: readonly HackdayDay[], index: number, now: Date): string | null {
  const next = sortedDays(days)[index + 1];
  if (next === undefined) return null;
  const first = [...next.schedule].sort((a, b) => parseTime(a.start) - parseTime(b.start))[0];
  if (first === undefined) return null;
  const when =
    dayOffset(next.date, now) === 1 ? "Morgen" : `Am ${weekdayFmt.format(parseIsoDate(next.date))}`;
  return `${when} geht’s um ${first.start} weiter.`;
}
