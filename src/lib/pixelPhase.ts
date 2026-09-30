/**
 * Maps the shared timeline onto the Pixel scene: which calendar row is
 * running, the computer's state and countdown, and how far the blinds are
 * down. Pure, like `schedule.ts`; the scene only animates towards it.
 */

import type { AgendaKind } from "../types";
import type { TimelineState } from "./schedule";
import { URGENT_SECONDS } from "./schedule";

/** What the computer screen shows (`arcade` is only set by the easter egg). */
export type PcState = "laeuft" | "endspurt" | "pause" | "ende";

/** Blinds per kind in percent: work open, meals and breaks half, program closed. */
export const KIND_BLINDS: Readonly<Record<AgendaKind, number>> = {
  phase: 0,
  meal: 50,
  break: 50,
  talk: 100,
};

/** Blinds in a gap between two items. */
export const GAP_BLINDS = 50;

/** Cells of the computer's progress bar. */
export const FILL_CELLS = 16;

export interface PixelPhase {
  /** Number of items on the day. */
  readonly n: number;
  /** Running item, or the one waited for; `n` once the day is over. */
  readonly idx: number;
  /** Before `idx` starts (before the day, or in a gap). */
  readonly waiting: boolean;
  /** A gap between two items (waiting after the first one). */
  readonly gap: boolean;
  readonly ende: boolean;
  /** Milliseconds until the item ends, or until it starts while waiting. */
  readonly remainingMs: number;
  readonly state: PcState;
  readonly blinds: number;
  /** Progress bar cells, 0–16. */
  readonly fill: number;
}

function blindsFor(kind: AgendaKind | undefined): number {
  return kind === undefined ? 0 : KIND_BLINDS[kind];
}

export function pixelPhase(tl: TimelineState): PixelPhase {
  const n = tl.entries.length;
  const indexOf = (id: string | undefined) => tl.entries.findIndex((e) => e.item.id === id);
  const lastKind = tl.entries[n - 1]?.item.kind;

  if (tl.dayState === "after" || n === 0) {
    return {
      n,
      idx: n,
      waiting: false,
      gap: false,
      ende: true,
      remainingMs: 0,
      state: "ende",
      blinds: blindsFor(lastKind),
      fill: FILL_CELLS,
    };
  }

  if (tl.dayState === "running" && tl.current !== null) {
    const remaining = tl.remainingSeconds ?? 0;
    const pause = tl.current.kind === "meal" || tl.current.kind === "break";
    return {
      n,
      idx: indexOf(tl.current.id),
      waiting: false,
      gap: false,
      ende: false,
      remainingMs: remaining * 1000,
      state: pause ? "pause" : remaining <= URGENT_SECONDS ? "endspurt" : "laeuft",
      blinds: blindsFor(tl.current.kind),
      fill: Math.min(FILL_CELLS, Math.floor(tl.progress * FILL_CELLS)),
    };
  }

  const gap = tl.dayState === "gap";
  return {
    n,
    idx: Math.max(0, indexOf(tl.next?.id)),
    waiting: true,
    gap,
    ende: false,
    remainingMs: (tl.untilNextSeconds ?? 0) * 1000,
    state: "pause",
    blinds: gap ? GAP_BLINDS : blindsFor(tl.next?.kind),
    fill: 0,
  };
}

/** "Make Your School · Gymnasium Wertingen" → "Gymnasium Wertingen". */
export function schoolName(title: string): string {
  const i = title.lastIndexOf("·");
  return (i >= 0 ? title.slice(i + 1) : title).trim();
}

/** Calendar subline: "30.09.2026 · St. Ursula". */
export function calendarSubline(isoDate: string, title: string): string {
  const date = isoDate.split("-").reverse().join(".");
  return [date, schoolName(title)].filter(Boolean).join(" · ");
}
