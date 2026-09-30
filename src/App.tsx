import { useEffect, useState } from "react";
import rawData from "./data/hackday.json";
import type { HackdayData } from "./types";
import { parseDebugTime } from "./lib/debugTime";
import { useBoardModel } from "./hooks/useBoardModel";
import { useBoardScale } from "./hooks/useBoardScale";
import { useClock } from "./hooks/useClock";
import { useTheme } from "./hooks/useTheme";
import { useUiChoice } from "./hooks/useUiChoice";
import { UiPicker } from "./components/UiPicker";
import { ModernBoard } from "./components/modern/ModernBoard";
import { PixelBoard } from "./components/pixel/PixelBoard";

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
