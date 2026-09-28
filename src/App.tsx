import { useMemo } from "react";
import type { CSSProperties } from "react";
import rawData from "./data/hackday.json";
import type { HackdayData } from "./types";
import { buildTimeline, secondsOfDay } from "./lib/schedule";
import { useBoardScale } from "./hooks/useBoardScale";
import { useClock } from "./hooks/useClock";
import { useTheme } from "./hooks/useTheme";
import { Header } from "./components/Header";
import { NowPanel } from "./components/NowPanel";
import { Timeline } from "./components/Timeline";

const data = rawData as HackdayData;

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const now = useClock();
  const scale = useBoardScale();
  const nowSeconds = secondsOfDay(now);

  // Recomputed each tick; cheap for a single day's worth of items.
  const timeline = useMemo(() => buildTimeline(data.schedule, nowSeconds), [nowSeconds]);

  return (
    <div className="board" style={{ "--board-scale": scale } as CSSProperties}>
      <Header now={now} theme={theme} onToggleTheme={toggleTheme} />

      <main className="board__main">
        <NowPanel timeline={timeline} nowSeconds={nowSeconds} />
        <Timeline entries={timeline.entries} remainingSeconds={timeline.remainingSeconds} />
      </main>
    </div>
  );
}
