import { useCallback, useState } from "react";
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
 * event only; `ui` turns null again once that event is over. `?ui=` overrides it.
 */
export function useUiChoice(
  days: readonly HackdayDay[],
  now: Date,
): { ui: UiVariant | null; choose: (ui: UiVariant) => void } {
  const [forced] = useState(() => parseUiParam(window.location.search));
  const [choice, setChoice] = useState(storedChoice);

  const choose = useCallback(
    (ui: UiVariant) => {
      const next = makeChoice(ui, days, now);
      if (next === null) return;
      setChoice(next);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Storage can be unavailable (private mode); the choice then lasts until reload.
      }
    },
    [days, now],
  );

  return { ui: forced ?? activeUi(choice, days, now), choose };
}
