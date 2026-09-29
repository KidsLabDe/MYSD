import { describe, expect, it } from "vitest";
import type { HackdayDay } from "../types";
import {
  dayOffset,
  dayWhen,
  effectiveSeconds,
  followingDay,
  resumeLead,
  selectDay,
  toIsoDate,
} from "./days";

const day = (date: string, start = "08:00", end = "15:00"): HackdayDay => ({
  date,
  schedule: [{ id: `${date}-a`, start, end, title: "Arbeitsphase", kind: "phase" }],
});

// Mon 28 – Wed 30 Sep 2026, deliberately unsorted.
const days = [day("2026-09-30", "08:45", "14:00"), day("2026-09-28"), day("2026-09-29")];

const at = (d: number, h = 10, m = 0) => new Date(2026, 8, d, h, m, 0);

describe("toIsoDate", () => {
  it("should format the local calendar date", () => {
    expect(toIsoDate(new Date(2026, 8, 28, 23, 59))).toBe("2026-09-28");
    expect(toIsoDate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("dayOffset", () => {
  it("should count whole calendar days from today to the given date", () => {
    expect(dayOffset("2026-09-28", at(28, 23))).toBe(0);
    expect(dayOffset("2026-09-30", at(28, 23))).toBe(2);
    expect(dayOffset("2026-09-27", at(28, 1))).toBe(-1);
  });
});

describe("selectDay", () => {
  it("should pick today's day and report its position", () => {
    const picked = selectDay(days, at(29));
    expect(picked?.day.date).toBe("2026-09-29");
    expect(picked?.index).toBe(1);
    expect(picked?.count).toBe(3);
  });

  it("should pick the next upcoming day on a date without a plan", () => {
    expect(selectDay(days, at(20))?.day.date).toBe("2026-09-28");
  });

  it("should fall back to the last day once the event is over", () => {
    expect(selectDay(days, at(31 + 5))?.day.date).toBe("2026-09-30");
  });

  it("should return null without any days", () => {
    expect(selectDay([], at(28))).toBeNull();
  });
});

describe("followingDay", () => {
  it("should return the date-sorted day after the given index", () => {
    const next = followingDay(days, 0);
    expect(next?.day.date).toBe("2026-09-29");
    expect(next?.index).toBe(1);
    expect(next?.count).toBe(3);
  });

  it("should return null on the last day", () => {
    expect(followingDay(days, 2)).toBeNull();
  });
});

describe("dayWhen", () => {
  it("should say Morgen for tomorrow", () => {
    expect(dayWhen("2026-09-29", at(28, 16))).toBe("Morgen");
  });

  it("should name the weekday when the day is further away", () => {
    expect(dayWhen("2026-10-01", at(28, 16))).toBe("Donnerstag");
  });
});

describe("effectiveSeconds", () => {
  it("should be the time of day on the day itself", () => {
    expect(effectiveSeconds("2026-09-28", at(28, 10, 30))).toBe(10 * 3600 + 30 * 60);
  });

  it("should count down across midnight to an upcoming day", () => {
    // 20:00 the evening before → 12 h before 08:00 means now = −4 h.
    expect(effectiveSeconds("2026-09-28", at(27, 20))).toBe(-4 * 3600);
  });

  it("should put a past day after its end", () => {
    expect(effectiveSeconds("2026-09-28", at(29, 9))).toBe(24 * 3600 + 9 * 3600);
  });
});

describe("resumeLead", () => {
  it("should announce tomorrow's start", () => {
    expect(resumeLead(days, 0, at(28, 16))).toBe("Morgen geht’s um 08:00 weiter.");
  });

  it("should name the weekday when the next day is further away", () => {
    const gapped = [day("2026-09-28"), day("2026-10-01", "08:45")];
    expect(resumeLead(gapped, 0, at(28, 16))).toBe("Am Donnerstag geht’s um 08:45 weiter.");
  });

  it("should return null on the last day", () => {
    expect(resumeLead(days, 2, at(30, 16))).toBeNull();
  });
});
