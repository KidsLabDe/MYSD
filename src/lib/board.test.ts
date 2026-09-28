import { describe, expect, it } from "vitest";
import { BOARD_HEIGHT, BOARD_WIDTH, boardScale } from "./board";

describe("boardScale", () => {
  it("should map the 1920×1080 design 1:1", () => {
    expect(BOARD_WIDTH).toBe(1920);
    expect(BOARD_HEIGHT).toBe(1080);
    expect(boardScale(1920, 1080)).toBe(1);
  });

  it("should scale up to fill a 4K viewport", () => {
    expect(boardScale(3840, 2160)).toBe(2);
  });

  it("should fit the tighter axis when the aspect ratio differs", () => {
    expect(boardScale(3840, 1080)).toBe(1); // ultra-wide: height limits
    expect(boardScale(1920, 1200)).toBe(1); // 16:10: width limits
  });

  it("should never return a non-positive scale", () => {
    expect(boardScale(0, 0)).toBeGreaterThan(0);
  });
});
