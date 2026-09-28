import { useEffect, useState } from "react";

/**
 * A live clock that re-renders the consumer on a fixed interval (default: every
 * second). Everything time-dependent in the app reads from this single source
 * so the header clock, countdown and progress bars stay in sync.
 */
export function useClock(intervalMs = 1000): Date {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return now;
}
