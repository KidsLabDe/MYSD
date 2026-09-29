import { useMemo, useState } from "react";
import type { HackdayData } from "../types";
import type { TimelineState } from "../lib/schedule";
import { buildTimeline } from "../lib/schedule";
import { dayWhen, effectiveSeconds, followingDay, resumeLead, selectDay } from "../lib/days";
import type { ClickDue } from "../lib/cursor";
import type { Adjustment } from "../lib/presenter";
import { applyAdjustments, dueClick, pendingAdjustment, planStep } from "../lib/presenter";
import { usePresenterKeys } from "./usePresenterKeys";
import { useUpcomingClick } from "./useUpcomingClick";

const NO_ADJUSTMENTS: readonly Adjustment[] = [];

/** Everything a board UI renders; both UIs (Modern, Pixel) share it. */
export interface BoardModel {
  readonly data: HackdayData;
  readonly now: Date;
  /** True when the clock runs from the `?date=&time=` debug params. */
  readonly testTime: boolean;
  /** Today's (or the selected day's) timeline, with presenter steps applied. */
  readonly timeline: TimelineState;
  readonly nowSeconds: number;
  /** "Morgen geht’s um 08:00 weiter." once the day is over, else null. */
  readonly resumeLead: string | null;
  /** "Tag 2" on multi-day events, else null. */
  readonly dayName: string | null;
  /** The Tagesplan: today's, or the next event day's once today is over. */
  readonly plan: {
    readonly timeline: TimelineState;
    readonly label: string | null;
    readonly preview: boolean;
  };
  /** A due pixel-mouse click on the next item, until `clearClick`. */
  readonly click: ClickDue | null;
  readonly clearClick: () => void;
}

/**
 * The board's data logic: selected day, timeline, presenter steps (in memory
 * only) and the pixel-mouse click. `presenter` switches the clicker keys off,
 * e.g. while the UI picker is shown.
 */
export function useBoardModel(
  data: HackdayData,
  now: Date,
  debugOffset: number | null,
  presenter: boolean,
): BoardModel {
  // Presenter steps per day, in memory only (a reload returns to the plan).
  const [adjustments, setAdjustments] = useState<Readonly<Record<string, readonly Adjustment[]>>>(
    {},
  );

  // Everything below is recomputed each tick; cheap for a few days of items.
  const selected = selectDay(data.days, now);
  const nowSeconds = selected === null ? 0 : effectiveSeconds(selected.day.date, now);
  const dayAdjustments = (selected && adjustments[selected.day.date]) ?? NO_ADJUSTMENTS;
  const timeline = useMemo(() => {
    const planned = selected?.day.schedule ?? [];
    return buildTimeline(applyAdjustments(planned, dayAdjustments, nowSeconds), nowSeconds);
  }, [selected?.day.schedule, dayAdjustments, nowSeconds]);

  usePresenterKeys((step) => {
    if (!presenter || selected === null) return;
    const { date, schedule } = selected.day;
    const pressed = new Date(Date.now() + (debugOffset ?? 0));
    const seconds = effectiveSeconds(date, pressed) + pressed.getMilliseconds() / 1000;
    setAdjustments((prev) => {
      const list = prev[date] ?? NO_ADJUSTMENTS;
      const adjustment = planStep(schedule, list, step, seconds);
      return adjustment === null ? prev : { ...prev, [date]: [...list, adjustment] };
    });
  });

  const multiDay = selected !== null && selected.count > 1;
  const dayNumber = selected === null ? 0 : selected.index + 1;
  // Once the day is over, the Tagesplan previews the next event day.
  const upcoming =
    selected !== null && timeline.dayState === "after"
      ? followingDay(data.days, selected.index)
      : null;
  const plan =
    upcoming === null
      ? {
          timeline,
          label: multiDay ? `Tag ${dayNumber} von ${selected.count}` : null,
          preview: false,
        }
      : {
          timeline: buildTimeline(upcoming.day.schedule, effectiveSeconds(upcoming.day.date, now)),
          label: `${dayWhen(upcoming.day.date, now)} · Tag ${upcoming.index + 1} von ${upcoming.count}`,
          preview: true,
        };

  const [click, clearClick] = useUpcomingClick(
    dueClick(timeline, pendingAdjustment(dayAdjustments, nowSeconds), nowSeconds),
  );

  return {
    data,
    now,
    testTime: debugOffset !== null,
    timeline,
    nowSeconds,
    resumeLead: selected === null ? null : resumeLead(data.days, selected.index, now),
    dayName: multiDay ? `Tag ${dayNumber}` : null,
    plan,
    click,
    clearClick,
  };
}
