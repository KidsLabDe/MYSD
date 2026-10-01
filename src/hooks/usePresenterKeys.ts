import { useEffect, useLayoutEffect, useRef } from "react";
import type { Step } from "../lib/presenter";
import { presenterStep } from "../lib/presenter";

/** Calls `onStep` for presenter clicker presses (next / previous phase). */
export function usePresenterKeys(onStep: (step: Step) => void): void {
  // Latest callback without re-subscribing on every clock tick.
  const handler = useRef(onStep);
  useLayoutEffect(() => {
    handler.current = onStep;
  });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
      const step = presenterStep(event.key);
      if (step === null) return;
      event.preventDefault();
      handler.current(step);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
