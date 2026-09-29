/**
 * Presenter control: step to the next or previous phase with a presenter
 * clicker. Only the switch between two items moves; every other time stays as
 * planned. Adjustments live in memory only — `hackday.json` is never touched,
 * and a reload returns to the plan.
 *
 * Each step takes effect {@link CURSOR_CLICK_MS} after the next clock tick, so
 * the pixel mouse can fly over and click the row right as it switches.
 */

import type { AgendaItem } from "../types";
import type { ClickDue } from "./cursor";
import { CURSOR_CLICK_MS, clickDue } from "./cursor";
import type { TimelineState } from "./schedule";
import { buildTimeline, endSeconds, startSeconds } from "./schedule";

export type Step = "next" | "prev";

/** New start and/or end (seconds on the day's clock) for one item. */
export interface BoundChange {
  readonly id: string;
  readonly start?: number;
  readonly end?: number;
}

export interface Adjustment {
  /** Seconds on the day's clock when the switch happens (the mouse click). */
  readonly at: number;
  /** The item that becomes the running one. */
  readonly target: string;
  readonly changes: readonly BoundChange[];
}

/** Time the previous item gets back once its planned end has passed. */
export const EXTRA_SECONDS = 5 * 60;

/** A step never shrinks the item it pushes back below this. */
const MIN_ITEM_SECONDS = 60;

/** Keys a presenter clicker sends (most send PageUp/PageDown, some arrows). */
const KEY_STEPS: Readonly<Record<string, Step>> = {
  ArrowRight: "next",
  PageDown: "next",
  ArrowLeft: "prev",
  PageUp: "prev",
};

export function presenterStep(key: string): Step | null {
  return KEY_STEPS[key] ?? null;
}

/** `HH:MM` label for seconds on the day's clock (seconds are cut off). */
function clockLabel(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mm = String(minutes % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

function applyChange(item: AgendaItem, change: BoundChange): AgendaItem {
  const withStart =
    change.start === undefined
      ? item
      : { ...item, start: clockLabel(change.start), startSeconds: change.start };
  return change.end === undefined
    ? withStart
    : { ...withStart, end: clockLabel(change.end), endSeconds: change.end };
}

/** The items with every adjustment that has happened by `nowSeconds` applied. */
export function applyAdjustments(
  items: readonly AgendaItem[],
  adjustments: readonly Adjustment[],
  nowSeconds: number,
): AgendaItem[] {
  return adjustments
    .filter((adj) => adj.at <= nowSeconds)
    .flatMap((adj) => adj.changes)
    .reduce<AgendaItem[]>(
      (acc, change) => acc.map((item) => (item.id === change.id ? applyChange(item, change) : item)),
      [...items],
    );
}

/** The step still on its way (its switch hasn't happened yet), if any. */
export function pendingAdjustment(
  adjustments: readonly Adjustment[],
  nowSeconds: number,
): Adjustment | null {
  return adjustments.find((adj) => adj.at > nowSeconds) ?? null;
}

function planNext(items: readonly AgendaItem[], nowSeconds: number, at: number): Adjustment | null {
  const { current, next } = buildTimeline(items, nowSeconds);
  if (next === null || startSeconds(next) <= at) return null;
  const changes: BoundChange[] = [
    ...(current === null ? [] : [{ id: current.id, end: at }]),
    { id: next.id, start: at },
  ];
  return { at, target: next.id, changes };
}

function planPrev(
  original: readonly AgendaItem[],
  items: readonly AgendaItem[],
  nowSeconds: number,
  at: number,
): Adjustment | null {
  const { entries } = buildTimeline(items, nowSeconds);
  const prevIndex = entries.map((e) => e.state).lastIndexOf("past");
  const prev = entries[prevIndex]?.item;
  if (prev === undefined) return null;
  const follower = entries[prevIndex + 1]?.item;
  const planned = original.find((i) => i.id === prev.id);
  const plannedFollower = original.find((i) => i.id === follower?.id);

  // Undo: the planned switch is still ahead, so simply go back to the plan.
  if (planned !== undefined && endSeconds(planned) > at) {
    const changes: BoundChange[] = [
      { id: prev.id, end: endSeconds(planned) },
      ...(follower === undefined || plannedFollower === undefined
        ? []
        : [{ id: follower.id, start: startSeconds(plannedFollower) }]),
    ];
    return { at, target: prev.id, changes };
  }

  // Otherwise the previous item gets a few extra minutes, pushing the follower back.
  const latest = follower === undefined ? Infinity : endSeconds(follower) - MIN_ITEM_SECONDS;
  const end = Math.min(at + EXTRA_SECONDS, latest);
  if (end <= at) return null;
  const pushFollower = follower !== undefined && startSeconds(follower) < end;
  const changes: BoundChange[] = [
    { id: prev.id, end },
    ...(pushFollower ? [{ id: follower.id, start: end }] : []),
  ];
  return { at, target: prev.id, changes };
}

/**
 * Plans a presenter step pressed at `nowSeconds` (fractional seconds on the
 * day's clock), given the planned `original` items and the steps so far.
 * Returns `null` when there is nowhere to go or a step is still on its way.
 */
export function planStep(
  original: readonly AgendaItem[],
  adjustments: readonly Adjustment[],
  step: Step,
  nowSeconds: number,
): Adjustment | null {
  if (pendingAdjustment(adjustments, nowSeconds) !== null) return null;
  const items = applyAdjustments(original, adjustments, nowSeconds);
  const at = Math.ceil(nowSeconds) + CURSOR_CLICK_MS / 1000;
  return step === "next"
    ? planNext(items, nowSeconds, at)
    : planPrev(original, items, nowSeconds, at);
}

/**
 * The click the pixel mouse should be on its way to: a presenter step still
 * on its way wins over the item that is about to start on its own.
 */
export function dueClick(
  timeline: TimelineState,
  pending: Adjustment | null,
  nowSeconds: number,
): ClickDue | null {
  if (pending !== null) {
    const target = { id: pending.target, key: `${pending.target}@${pending.at}` };
    return clickDue(target, pending.at - nowSeconds);
  }
  const { next, untilNextSeconds } = timeline;
  if (next === null) return null;
  return clickDue({ id: next.id, key: `${next.id}@${startSeconds(next)}` }, untilNextSeconds);
}
