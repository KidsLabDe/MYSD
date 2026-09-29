import { useCallback, useEffect, useRef, useState } from "react";
import type { ClickDue } from "../lib/cursor";

/**
 * Latches a due click for the pixel mouse (until `clear` is called), so it
 * plays once per switch even though `due` is recomputed on every tick.
 */
export function useUpcomingClick(due: ClickDue | null): [ClickDue | null, () => void] {
  const playedKey = useRef<string | null>(null);
  const [click, setClick] = useState<ClickDue | null>(null);

  useEffect(() => {
    if (due === null || due.key === playedKey.current) return;
    playedKey.current = due.key;
    setClick(due);
  }, [due]);

  const clear = useCallback(() => setClick(null), []);
  return [click, clear];
}
