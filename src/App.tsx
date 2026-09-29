import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import rawData from "./data/hackday.json";
import type { HackdayData } from "./types";
import { buildTimeline } from "./lib/schedule";
import { effectiveSeconds, resumeLead, selectDay } from "./lib/days";
import { parseDebugTime } from "./lib/debugTime";
import type { Adjustment } from "./lib/presenter";
import { applyAdjustments, dueClick, pendingAdjustment, planStep } from "./lib/presenter";
import { useBoardScale } from "./hooks/useBoardScale";
import { useClock } from "./hooks/useClock";
import { usePresenterKeys } from "./hooks/usePresenterKeys";
import { useTheme } from "./hooks/useTheme";
import { useUpcomingClick } from "./hooks/useUpcomingClick";
import { Header } from "./components/Header";
import { NowPanel } from "./components/NowPanel";
import { PixelCursor } from "./components/PixelCursor";
import { Ticker } from "./components/Ticker";
import { Timeline } from "./components/Timeline";

const data = rawData as HackdayData;
const NO_ADJUSTMENTS: readonly Adjustment[] = [];

/** Reads the `?date=&time=` debug params once; invalid values fall back to real time. */
function initialDebugOffset(): number | null {
  const debug = parseDebugTime(window.location.search, new Date());
  if (debug === null) return null;
  if ("error" in debug) {
    console.warn(`Testzeit ignoriert: ${debug.error}`);
    return null;
  }
  return debug.offsetMs;
}

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [debugOffset] = useState(initialDebugOffset);
  const now = useClock(debugOffset ?? 0);
  const scale = useBoardScale();

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
    if (selected === null) return;
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
  const resume = selected === null ? null : resumeLead(data.days, selected.index, now);
  const [click, clearClick] = useUpcomingClick(
    dueClick(timeline, pendingAdjustment(dayAdjustments, nowSeconds), nowSeconds),
  );

  return (
    <div className="board" style={{ "--board-scale": scale } as CSSProperties}>
      <Header now={now} testTime={debugOffset !== null} theme={theme} onToggleTheme={toggleTheme} />

      <main className="board__main">
        <NowPanel
          timeline={timeline}
          nowSeconds={nowSeconds}
          resumeLead={resume}
          dayName={multiDay ? `Tag ${dayNumber}` : null}
        />
        <Timeline
          entries={timeline.entries}
          remainingSeconds={timeline.remainingSeconds}
          dayLabel={multiDay ? `Tag ${dayNumber} von ${selected.count}` : null}
        />
      </main>

      <Ticker messages={data.messages ?? []} />

      {click !== null && (
        <PixelCursor
          key={click.key}
          targetId={click.id}
          lateMs={click.lateMs}
          onDone={clearClick}
        />
      )}
    </div>
  );
}
