import { useEffect, useState } from "react";
import { msUntilNextSecond } from "../lib/clock";

/**
 * A live clock that re-renders the consumer on every full second. Everything
 * time-dependent in the app reads from this single source so the header clock,
 * countdown and progress bars stay in sync. Ticks land on the second, so an
 * item switches exactly when it starts (the pixel mouse clicks right then).
 *
 * `offsetMs` shifts the clock (used by the `?date=&time=` debug params); it
 * keeps ticking in real time from the shifted moment.
 */
export function useClock(offsetMs = 0): Date {
  const [now, setNow] = useState<Date>(() => new Date(Date.now() + offsetMs));

  useEffect(() => {
    let id = 0;
    const tick = () => {
      const shifted = Date.now() + offsetMs;
      setNow(new Date(shifted));
      // Re-aligned every tick, so timer drift never adds up.
      id = window.setTimeout(tick, msUntilNextSecond(shifted));
    };
    tick();
    return () => window.clearTimeout(id);
  }, [offsetMs]);

  return now;
}
