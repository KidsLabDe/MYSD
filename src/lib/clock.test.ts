import { describe, expect, it } from "vitest";
import { msUntilNextSecond } from "./clock";

describe("msUntilNextSecond", () => {
  it("should wait for the rest of the current second", () => {
    expect(msUntilNextSecond(12_345)).toBe(655);
  });

  it("should wait a full second when exactly on a second", () => {
    expect(msUntilNextSecond(12_000)).toBe(1000);
  });
});
