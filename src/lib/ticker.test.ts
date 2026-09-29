import { describe, expect, it } from "vitest";
import {
  TICKER_CHARS_PER_SECOND,
  TICKER_MIN_CHARS,
  TICKER_SEPARATOR_CHARS,
  tickerLoop,
} from "./ticker";

// Width of a loop in characters, separators included.
const chars = (items: readonly { text: string }[]) =>
  items.reduce((sum, i) => sum + i.text.length + TICKER_SEPARATOR_CHARS, 0);

describe("tickerLoop", () => {
  it("should be empty without messages", () => {
    expect(tickerLoop([])).toEqual({ items: [], durationSeconds: 0 });
    expect(tickerLoop(["", "   "]).items).toEqual([]);
  });

  it("should repeat short messages until one loop is wider than the bar", () => {
    const { items } = tickerLoop(["Kurz"]);
    expect(items.length).toBeGreaterThan(1);
    expect(chars(items)).toBeGreaterThanOrEqual(TICKER_MIN_CHARS);
    expect(items.every((i) => i.text === "Kurz")).toBe(true);
  });

  it("should mark only the first round as original", () => {
    const { items } = tickerLoop(["A", "B"]);
    expect(items.slice(0, 2).map((i) => i.repeat)).toEqual([false, false]);
    expect(items.slice(2).every((i) => i.repeat)).toBe(true);
  });

  it("should keep long messages as a single round", () => {
    const long = "x".repeat(TICKER_MIN_CHARS + 10);
    expect(tickerLoop([long]).items).toEqual([{ text: long, repeat: false }]);
  });

  it("should scroll at a constant reading speed", () => {
    const { items, durationSeconds } = tickerLoop(["Denkt daran Bilder und Videos zu machen"]);
    expect(durationSeconds).toBeGreaterThan(0);
    // Longer loops take proportionally longer, so the speed never changes.
    expect(durationSeconds).toBeGreaterThanOrEqual(chars(items) / TICKER_CHARS_PER_SECOND);
  });
});
