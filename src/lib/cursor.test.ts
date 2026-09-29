import { describe, expect, it } from "vitest";
import {
  CURSOR_BITMAP,
  CURSOR_CLICK_MS,
  CURSOR_MARGIN,
  clickDue,
  cursorPath,
  cursorRuns,
} from "./cursor";

describe("clickDue", () => {
  const lunch = { id: "lunch", key: "lunch@43200" };

  it("should be due once the next item starts within the lead time", () => {
    expect(clickDue(lunch, CURSOR_CLICK_MS / 1000)).toEqual({ ...lunch, lateMs: 0 });
  });

  it("should report how late it starts when the lead moment was missed", () => {
    expect(clickDue(lunch, CURSOR_CLICK_MS / 1000 - 1)).toEqual({ ...lunch, lateMs: 1000 });
  });

  it("should not be due while the next item is further away", () => {
    expect(clickDue(lunch, CURSOR_CLICK_MS / 1000 + 1)).toBeNull();
  });

  it("should not be due once the item has started", () => {
    expect(clickDue(lunch, 0)).toBeNull();
  });

  it("should not be due without a next item", () => {
    expect(clickDue(null, null)).toBeNull();
  });
});

describe("cursorRuns", () => {
  it("should merge each row into horizontal runs per color", () => {
    expect(cursorRuns(["BBW.W", ".B"])).toEqual([
      { x: 0, y: 0, width: 2, fill: "outline" },
      { x: 2, y: 0, width: 1, fill: "body" },
      { x: 4, y: 0, width: 1, fill: "body" },
      { x: 1, y: 1, width: 1, fill: "outline" },
    ]);
  });

  it("should draw the arrow tip at the top-left pixel", () => {
    expect(cursorRuns(CURSOR_BITMAP)[0]).toEqual({ x: 0, y: 0, width: 1, fill: "outline" });
  });
});

describe("cursorPath", () => {
  const stage = { width: 1920, height: 1080 };

  it("should end the click at the target point", () => {
    expect(cursorPath({ x: 1500, y: 400 }, stage).click).toEqual({ x: 1500, y: 400 });
  });

  it("should enter and leave from outside the stage", () => {
    const { enter, exit } = cursorPath({ x: 1500, y: 400 }, stage);
    expect(enter.x).toBeGreaterThanOrEqual(stage.width + CURSOR_MARGIN);
    expect(exit.y).toBeGreaterThanOrEqual(stage.height + CURSOR_MARGIN);
  });

  it("should enter below the target, staying on the stage's height", () => {
    const low = cursorPath({ x: 1500, y: 1000 }, stage).enter;
    expect(low.y).toBeLessThanOrEqual(stage.height);
    expect(cursorPath({ x: 1500, y: 200 }, stage).enter.y).toBeGreaterThan(200);
  });
});
