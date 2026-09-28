import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import rawData from "./data/hackday.json";
import type { HackdayData } from "./types";
import { buildTimeline } from "./lib/schedule";
import { effectiveSeconds, resumeLead, selectDay } from "./lib/days";
import { parseDebugTime } from "./lib/debugTime";
import { useBoardScale } from "./hooks/useBoardScale";
import { useClock } from "./hooks/useClock";
import { useTheme } from "./hooks/useTheme";
import { Header } from "./components/Header";
import { NowPanel } from "./components/NowPanel";
import { Timeline } from "./components/Timeline";

const data = rawData as HackdayData;

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

  // Everything below is recomputed each tick; cheap for a few days of items.
  const selected = selectDay(data.days, now);
  const schedule = selected?.day.schedule ?? [];
  const nowSeconds = selected === null ? 0 : effectiveSeconds(selected.day.date, now);
  const timeline = useMemo(() => buildTimeline(schedule, nowSeconds), [schedule, nowSeconds]);

  const multiDay = selected !== null && selected.count > 1;
  const dayNumber = selected === null ? 0 : selected.index + 1;
  const resume = selected === null ? null : resumeLead(data.days, selected.index, now);

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
    </div>
  );
}
