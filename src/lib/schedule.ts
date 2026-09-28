/**
 * Pure agenda/time logic. Given the day's schedule and "now", it decides which
 * item is running, what comes next, and how much time is left — all without
 * touching React or the real clock, so it can be unit-tested deterministically.
 */

import type { AgendaItem } from "../types";

export type DayState = "before" | "running" | "gap" | "after";

export type ItemState = "past" | "current" | "upcoming";

export interface TimelineEntry {
  readonly item: AgendaItem;
  readonly state: ItemState;
  /** Fraction elapsed (0–1); only meaningful for the current item, else 0. */
  readonly progress: number;
}

export interface TimelineState {
  /** Every item, sorted by start time, annotated with its state. */
  readonly entries: readonly TimelineEntry[];
  readonly current: AgendaItem | null;
  readonly next: AgendaItem | null;
  readonly dayState: DayState;
  /** Seconds remaining in the current item, or `null` when nothing runs. */
  readonly remainingSeconds: number | null;
  /** Seconds until the next item starts, or `null` when there is none. */
  readonly untilNextSeconds: number | null;
  /** Progress of the current item (0–1), or 0 when nothing runs. */
  readonly progress: number;
}

const HOUR = 3600;
const MINUTE = 60;

/** Parses a `"HH:MM"` string into minutes since midnight. Throws if invalid. */
export function parseTime(hhmm: string): number {
  const parts = hhmm.split(":");
  if (parts.length !== 2) {
    throw new Error(`Ungültige Zeit: "${hhmm}" (erwartet HH:MM)`);
  }
  const [rawH, rawM] = parts;
  if (rawH === undefined || rawM === undefined) {
    throw new Error(`Ungültige Zeit: "${hhmm}" (erwartet HH:MM)`);
  }
  const hours = Number(rawH);
  const minutes = Number(rawM);
  const valid =
    Number.isInteger(hours) &&
    Number.isInteger(minutes) &&
    hours >= 0 &&
    hours <= 23 &&
    minutes >= 0 &&
    minutes <= 59;
  if (!valid) {
    throw new Error(`Ungültige Zeit: "${hhmm}" (erwartet HH:MM)`);
  }
  return hours * 60 + minutes;
}

/** Seconds elapsed since local midnight for a given `Date`. */
export function secondsOfDay(date: Date): number {
  return date.getHours() * HOUR + date.getMinutes() * MINUTE + date.getSeconds();
}

function startSeconds(item: AgendaItem): number {
  return parseTime(item.start) * MINUTE;
}

function endSeconds(item: AgendaItem): number {
  return parseTime(item.end) * MINUTE;
}

function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function stateOf(item: AgendaItem, nowSeconds: number): ItemState {
  if (endSeconds(item) <= nowSeconds) return "past";
  if (startSeconds(item) > nowSeconds) return "upcoming";
  return "current";
}

function progressOf(item: AgendaItem, nowSeconds: number): number {
  const start = startSeconds(item);
  const span = endSeconds(item) - start;
  if (span <= 0) return 0;
  return clamp01((nowSeconds - start) / span);
}

/**
 * Builds the full timeline state for a moment in the day. `nowSeconds` is
 * seconds since midnight (see {@link secondsOfDay}).
 */
export function buildTimeline(
  items: readonly AgendaItem[],
  nowSeconds: number,
): TimelineState {
  const sorted = [...items].sort((a, b) => startSeconds(a) - startSeconds(b));

  const entries: TimelineEntry[] = sorted.map((item) => {
    const state = stateOf(item, nowSeconds);
    return {
      item,
      state,
      progress: state === "current" ? progressOf(item, nowSeconds) : 0,
    };
  });

  const current = entries.find((e) => e.state === "current")?.item ?? null;
  const next = entries.find((e) => e.state === "upcoming")?.item ?? null;

  const remainingSeconds =
    current === null ? null : Math.max(0, endSeconds(current) - nowSeconds);
  const untilNextSeconds =
    next === null ? null : Math.max(0, startSeconds(next) - nowSeconds);
  const progress = current === null ? 0 : progressOf(current, nowSeconds);

  const first = sorted[0];
  let dayState: DayState;
  if (current !== null) {
    dayState = "running";
  } else if (next !== null && first !== undefined && nowSeconds < startSeconds(first)) {
    dayState = "before";
  } else if (next !== null) {
    dayState = "gap";
  } else {
    dayState = "after";
  }

  return {
    entries,
    current,
    next,
    dayState,
    remainingSeconds,
    untilNextSeconds,
    progress,
  };
}

/** Renders whole seconds as a ticking clock: `M:SS`, or `H:MM:SS` past an hour. */
export function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / HOUR);
  const minutes = Math.floor((s % HOUR) / MINUTE);
  const seconds = s % MINUTE;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  if (hours > 0) return `${hours}:${mm}:${ss}`;
  return `${minutes}:${ss}`;
}

/** A running item turns "urgent" (Endspurt) with this many seconds left. */
export const URGENT_SECONDS = 300;

/** Before the day starts, the ring fills over this window (full ring ≥ 60 min out). */
export const BEFORE_WINDOW_SECONDS = 3600;

/**
 * Share of the hero ring that is still "full" (0–1):
 * - running → remaining / duration of the current item
 * - before  → time until the first item, over {@link BEFORE_WINDOW_SECONDS}
 * - gap     → time until the next item, over the gap's length
 * - after   → 0
 */
export function ringFraction(tl: TimelineState, nowSeconds: number): number {
  switch (tl.dayState) {
    case "running": {
      if (tl.current === null) return 0;
      const start = startSeconds(tl.current);
      const span = endSeconds(tl.current) - start;
      return span <= 0 ? 0 : clamp01((endSeconds(tl.current) - nowSeconds) / span);
    }
    case "before": {
      if (tl.next === null) return 0;
      return clamp01((startSeconds(tl.next) - nowSeconds) / BEFORE_WINDOW_SECONDS);
    }
    case "gap": {
      if (tl.next === null) return 0;
      const prev = [...tl.entries].reverse().find((e) => e.state === "past")?.item;
      const gapStart = prev === undefined ? nowSeconds : endSeconds(prev);
      const span = startSeconds(tl.next) - gapStart;
      return span <= 0 ? 0 : clamp01((startSeconds(tl.next) - nowSeconds) / span);
    }
    case "after":
      return 0;
  }
}

/** True while an item runs and at most {@link URGENT_SECONDS} of it are left. */
export function isUrgent(tl: TimelineState, nowSeconds: number): boolean {
  if (tl.dayState !== "running" || tl.current === null) return false;
  return endSeconds(tl.current) - nowSeconds <= URGENT_SECONDS;
}

/** The upcoming item after `next` (the "Danach" card when nothing runs). */
export function upcomingAfterNext(tl: TimelineState): AgendaItem | null {
  return tl.entries.filter((e) => e.state === "upcoming")[1]?.item ?? null;
}

/** Number of items that are already over. */
export function doneCount(entries: readonly TimelineEntry[]): number {
  return entries.filter((e) => e.state === "past").length;
}

/** Relative start in German, minutes rounded up (min 1): `in 43 Min`, `in 1 Std 5 Min`. */
export function formatIn(totalSeconds: number): string {
  const totalMinutes = Math.max(1, Math.ceil(Math.max(0, totalSeconds) / MINUTE));
  if (totalMinutes < 60) return `in ${totalMinutes} Min`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes === 0 ? `in ${hours} Std` : `in ${hours} Std ${minutes} Min`;
}

/** Friendly German duration, rounded up: `40 Sek`, `25 Min`, `1 Std 5 Min`. */
export function formatHuman(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  if (s < MINUTE) return `${s} Sek`;
  const totalMinutes = Math.ceil(s / MINUTE);
  if (totalMinutes < 60) return `${totalMinutes} Min`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes === 0 ? `${hours} Std` : `${hours} Std ${minutes} Min`;
}
