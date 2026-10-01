import { useEffect, useState } from "react";
import rawData from "./data/hackday.json";
import type { HackdayData } from "./types";
import { parseDebugTime } from "./lib/debugTime";
import { validateHackday } from "./lib/validate";
import { useBoardModel } from "./hooks/useBoardModel";
import { useBoardScale } from "./hooks/useBoardScale";
import { useClock } from "./hooks/useClock";
import { useTheme } from "./hooks/useTheme";
import { useUiChoice } from "./hooks/useUiChoice";
import { UiPicker } from "./components/UiPicker";
import { ModernBoard } from "./components/modern/ModernBoard";
import { PixelBoard } from "./components/pixel/PixelBoard";

/** Shown instead of the board when the plan breaks the rules in `lib/validate.ts`. */
function PlanError({ problems }: { problems: readonly string[] }) {
  return (
    <main role="alert" style={{ padding: 32, fontFamily: "system-ui, sans-serif" }}>
      <h1>Der Plan (hackday.json) ist ungültig</h1>
      <ul>
        {problems.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </main>
  );
}

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

export default function App({ plan = rawData }: { plan?: unknown } = {}) {
  const problems = validateHackday(plan);
  if (problems.length > 0) return <PlanError problems={problems} />;
  return <Board data={plan as HackdayData} />;
}

function Board({ data }: { data: HackdayData }) {
  const { theme, toggleTheme } = useTheme();
  const [debugOffset] = useState(initialDebugOffset);
  const now = useClock(debugOffset ?? 0);
  const scale = useBoardScale();
  const { ui, choose, toggle } = useUiChoice(data.days, now);
  // One model for both UIs; the clicker stays off while the picker is shown.
  const board = useBoardModel(data, now, debugOffset, ui !== null);

  useEffect(() => {
    document.title = `${data.boardTitle} · ${data.title}`;
  }, []);

  if (ui === null) return <UiPicker title={data.boardTitle} onChoose={choose} />;
  if (ui === "pixel") return <PixelBoard board={board} onToggleUi={toggle} />;
  return (
    <ModernBoard
      board={board}
      scale={scale}
      theme={theme}
      onToggleTheme={toggleTheme}
      onToggleUi={toggle}
    />
  );
}
