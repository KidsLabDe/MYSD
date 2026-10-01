import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { HackdayDay } from "../types";
import type { UiChoice, UiVariant } from "../lib/uiChoice";
import { activeUi, makeChoice, parseChoice, parseUiParam } from "../lib/uiChoice";

const STORAGE_KEY = "mys-ui";

function storedChoice(): UiChoice | null {
  try {
    return parseChoice(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

/**
 * The board UI picked on the first visit, persisted for the current (or next)
 * event only; `ui` turns null again once that event is over. `?ui=` overrides it
 * until the visitor picks or toggles.
 */
export function useUiChoice(
  days: readonly HackdayDay[],
  now: Date,
): { ui: UiVariant | null; choose: (ui: UiVariant) => void; toggle: () => void } {
  const [forced, setForced] = useState(() => parseUiParam(window.location.search));
  const [choice, setChoice] = useState(storedChoice);
  // Read at call time, so the callbacks keep their identity across clock ticks.
  const latest = useRef({ days, now });
  useLayoutEffect(() => {
    latest.current = { days, now };
  });

  const choose = useCallback(
    (ui: UiVariant) => {
      const next = makeChoice(ui, latest.current.days, latest.current.now);
      if (next === null) return;
      setForced(null);
      setChoice(next);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Storage can be unavailable (private mode); the choice then lasts until reload.
      }
    },
    [],
  );

  const ui = forced ?? activeUi(choice, days, now);
  const toggle = useCallback(() => choose(ui === "pixel" ? "modern" : "pixel"), [choose, ui]);

  return { ui, choose, toggle };
}
