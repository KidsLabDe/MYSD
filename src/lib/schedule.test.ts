import { describe, expect, it } from "vitest";
import type { AgendaItem } from "../types";
import {
  BEFORE_WINDOW_SECONDS,
  URGENT_SECONDS,
  buildTimeline,
  doneCount,
  formatCountdown,
  formatHuman,
  formatIn,
  isUrgent,
  parseTime,
  ringFraction,
  secondsOfDay,
  upcomingAfterNext,
} from "./schedule";

const at = (hhmm: string) => parseTime(hhmm) * 60;

const schedule: AgendaItem[] = [
  { id: "a", start: "09:00", end: "10:00", title: "Kick-off", kind: "talk" },
  { id: "b", start: "10:00", end: "11:30", title: "Phase 1", kind: "phase" },
  { id: "c", start: "12:00", end: "13:00", title: "Mittagessen", kind: "meal" },
];

describe("parseTime", () => {
  it("should convert HH:MM to minutes since midnight", () => {
    expect(parseTime("00:00")).toBe(0);
    expect(parseTime("09:30")).toBe(570);
    expect(parseTime("23:59")).toBe(1439);
  });

  it("should throw on malformed input", () => {
    expect(() => parseTime("9:30")).not.toThrow(); // single-digit hour is fine
    expect(() => parseTime("24:00")).toThrow();
    expect(() => parseTime("10:60")).toThrow();
    expect(() => parseTime("abc")).toThrow();
    expect(() => parseTime("10")).toThrow();
  });
});

describe("secondsOfDay", () => {
  it("should return seconds since local midnight", () => {
    expect(secondsOfDay(new Date(2026, 8, 28, 0, 0, 0))).toBe(0);
    expect(secondsOfDay(new Date(2026, 8, 28, 10, 30, 15))).toBe(37815);
  });
});

describe("buildTimeline", () => {
  it("should mark the running item as current with progress and remaining", () => {
    const t = buildTimeline(schedule, at("10:30"));
    expect(t.current?.id).toBe("b");
    expect(t.dayState).toBe("running");
    expect(t.remainingSeconds).toBe(60 * 60); // 10:30 -> 11:30
    expect(t.progress).toBeCloseTo(1 / 3, 5); // 30 of 90 min elapsed
  });

  it("should point to the following item as next while one is running", () => {
    const t = buildTimeline(schedule, at("10:30"));
    expect(t.next?.id).toBe("c");
    expect(t.untilNextSeconds).toBe(90 * 60); // 10:30 -> 12:00
  });

  it("should report the before state ahead of the first item", () => {
    const t = buildTimeline(schedule, at("08:30"));
    expect(t.current).toBeNull();
    expect(t.dayState).toBe("before");
    expect(t.next?.id).toBe("a");
    expect(t.untilNextSeconds).toBe(30 * 60);
  });

  it("should report a gap between two items", () => {
    const t = buildTimeline(schedule, at("11:45"));
    expect(t.current).toBeNull();
    expect(t.dayState).toBe("gap");
    expect(t.next?.id).toBe("c");
    expect(t.untilNextSeconds).toBe(15 * 60);
  });

  it("should report the after state once everything is over", () => {
    const t = buildTimeline(schedule, at("14:00"));
    expect(t.current).toBeNull();
    expect(t.next).toBeNull();
    expect(t.dayState).toBe("after");
    expect(t.untilNextSeconds).toBeNull();
  });

  it("should treat the start boundary as current and the end boundary as past", () => {
    expect(buildTimeline(schedule, at("10:00")).current?.id).toBe("b");
    expect(buildTimeline(schedule, at("11:30")).current).toBeNull();
  });

  it("should annotate every item with a state", () => {
    const t = buildTimeline(schedule, at("10:30"));
    const byId = Object.fromEntries(t.entries.map((e) => [e.item.id, e.state]));
    expect(byId).toEqual({ a: "past", b: "current", c: "upcoming" });
  });

  it("should sort unordered input by start time", () => {
    const shuffled = [schedule[2]!, schedule[0]!, schedule[1]!];
    const t = buildTimeline(shuffled, at("09:30"));
    expect(t.entries.map((e) => e.item.id)).toEqual(["a", "b", "c"]);
    expect(t.current?.id).toBe("a");
  });

  it("should handle an empty schedule", () => {
    const t = buildTimeline([], at("10:00"));
    expect(t.current).toBeNull();
    expect(t.next).toBeNull();
    expect(t.entries).toEqual([]);
    expect(t.dayState).toBe("after");
  });
});

describe("formatCountdown", () => {
  it("should render M:SS below one hour", () => {
    expect(formatCountdown(125)).toBe("2:05");
    expect(formatCountdown(9)).toBe("0:09");
  });

  it("should render H:MM:SS at or above one hour", () => {
    expect(formatCountdown(3725)).toBe("1:02:05");
  });

  it("should clamp negatives to zero", () => {
    expect(formatCountdown(-5)).toBe("0:00");
  });
});

describe("formatHuman", () => {
  it("should render seconds under a minute", () => {
    expect(formatHuman(40)).toBe("40 Sek");
  });

  it("should round up to whole minutes below an hour", () => {
    expect(formatHuman(90)).toBe("2 Min");
    expect(formatHuman(1500)).toBe("25 Min");
  });

  it("should render hours and minutes", () => {
    expect(formatHuman(3600)).toBe("1 Std");
    expect(formatHuman(3660)).toBe("1 Std 1 Min");
  });
});

describe("formatIn", () => {
  it("should round minutes up", () => {
    expect(formatIn(43 * 60 - 20)).toBe("in 43 Min");
    expect(formatIn(61)).toBe("in 2 Min");
  });

  it("should never show less than one minute", () => {
    expect(formatIn(20)).toBe("in 1 Min");
    expect(formatIn(0)).toBe("in 1 Min");
  });

  it("should render whole hours and hours with minutes", () => {
    expect(formatIn(3600)).toBe("in 1 Std");
    expect(formatIn(3600 + 5 * 60)).toBe("in 1 Std 5 Min");
  });
});

describe("ringFraction", () => {
  it("should return the remaining share of the running item", () => {
    // Phase 1 runs 10:00–11:30; at 10:30, 60 of 90 min remain.
    const now = at("10:30");
    expect(ringFraction(buildTimeline(schedule, now), now)).toBeCloseTo(2 / 3, 5);
  });

  it("should fill over a 60-minute window before the day starts", () => {
    expect(BEFORE_WINDOW_SECONDS).toBe(3600);
    const halfHourOut = at("08:30");
    expect(ringFraction(buildTimeline(schedule, halfHourOut), halfHourOut)).toBeCloseTo(0.5, 5);
    const twoHoursOut = at("07:00");
    expect(ringFraction(buildTimeline(schedule, twoHoursOut), twoHoursOut)).toBe(1);
  });

  it("should return the share of the gap that is still left", () => {
    // Gap 11:30–12:00; at 11:45 half of it remains.
    const now = at("11:45");
    expect(ringFraction(buildTimeline(schedule, now), now)).toBeCloseTo(0.5, 5);
  });

  it("should be empty once the day is over", () => {
    const now = at("14:00");
    expect(ringFraction(buildTimeline(schedule, now), now)).toBe(0);
  });
});

describe("isUrgent", () => {
  it("should be true in the last five minutes of the running item", () => {
    expect(URGENT_SECONDS).toBe(300);
    const now = at("11:25");
    expect(isUrgent(buildTimeline(schedule, now), now)).toBe(true);
  });

  it("should be false with more than five minutes left", () => {
    const now = at("11:25") - 1;
    expect(isUrgent(buildTimeline(schedule, now), now)).toBe(false);
  });

  it("should be false when nothing is running", () => {
    const gap = at("11:58");
    expect(isUrgent(buildTimeline(schedule, gap), gap)).toBe(false);
  });
});

describe("upcomingAfterNext", () => {
  it("should return the second upcoming item", () => {
    expect(upcomingAfterNext(buildTimeline(schedule, at("08:30")))?.id).toBe("b");
  });

  it("should return null when fewer than two items are upcoming", () => {
    expect(upcomingAfterNext(buildTimeline(schedule, at("11:45")))).toBeNull();
  });
});

describe("doneCount", () => {
  it("should count the items that are already over", () => {
    expect(doneCount(buildTimeline(schedule, at("12:30")).entries)).toBe(2);
    expect(doneCount(buildTimeline(schedule, at("08:00")).entries)).toBe(0);
  });
});
