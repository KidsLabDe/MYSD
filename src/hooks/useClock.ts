import { useEffect, useState } from "react";

/**
 * A live clock that re-renders the consumer on a fixed interval (default: every
 * second). Everything time-dependent in the app reads from this single source
 * so the header clock, countdown and progress bars stay in sync.
 *
 * `offsetMs` shifts the clock (used by the `?date=&time=` debug params); it
 * keeps ticking in real time from the shifted moment.
 */
export function useClock(offsetMs = 0, intervalMs = 1000): Date {
  const [now, setNow] = useState<Date>(() => new Date(Date.now() + offsetMs));

  useEffect(() => {
    const tick = () => setNow(new Date(Date.now() + offsetMs));
    tick();
    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [offsetMs, intervalMs]);

  return now;
}
