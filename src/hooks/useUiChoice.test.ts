import { afterEach, describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import type { HackdayDay } from "../types";
import { useUiChoice } from "./useUiChoice";

const days: HackdayDay[] = [{ date: "2026-09-28", schedule: [] }];

describe("useUiChoice", () => {
  afterEach(() => window.localStorage.clear());

  it("should keep choose and toggle stable when only the clock changes", () => {
    const { result, rerender } = renderHook(({ now }) => useUiChoice(days, now), {
      initialProps: { now: new Date(2026, 8, 28, 10, 0, 0) },
    });
    const { choose, toggle } = result.current;
    rerender({ now: new Date(2026, 8, 28, 10, 0, 1) });
    expect(result.current.choose).toBe(choose);
    expect(result.current.toggle).toBe(toggle);
  });
});
