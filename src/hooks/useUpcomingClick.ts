import { useCallback, useEffect, useRef, useState } from "react";
import type { ClickDue } from "../lib/cursor";
import { clickDue } from "../lib/cursor";

/**
 * The click the pixel mouse should play for the item about to start (until
 * `clear` is called), plus `clear`. Each item is clicked at most once.
 */
export function useUpcomingClick(
  nextId: string | null,
  untilNextSeconds: number | null,
): [ClickDue | null, () => void] {
  const playedId = useRef<string | null>(null);
  const [click, setClick] = useState<ClickDue | null>(null);

  useEffect(() => {
    const due = clickDue(nextId, untilNextSeconds);
    if (due === null || due.id === playedId.current) return;
    playedId.current = due.id;
    setClick(due);
  }, [nextId, untilNextSeconds]);

  const clear = useCallback(() => setClick(null), []);
  return [click, clear];
}
