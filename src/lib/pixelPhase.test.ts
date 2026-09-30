import { describe, expect, it } from "vitest";
import type { AgendaItem } from "../types";
import { buildTimeline, parseTime } from "./schedule";
import { GAP_BLINDS, calendarSubline, pixelPhase, schoolName } from "./pixelPhase";

const at = (hhmm: string) => parseTime(hhmm) * 60;

const schedule: AgendaItem[] = [
  { id: "a", start: "09:00", end: "10:00", title: "Kick-off", kind: "talk" },
  { id: "b", start: "10:00", end: "11:30", title: "Phase 1", kind: "phase" },
  { id: "c", start: "12:00", end: "13:00", title: "Mittagessen", kind: "meal" },
];

const phaseAt = (hhmm: string, offset = 0) => {
  const now = at(hhmm) + offset;
  return pixelPhase(buildTimeline(schedule, now));
};

describe("pixelPhase", () => {
  it("should wait on the first item with a countdown to its start before the day", () => {
    const p = phaseAt("08:30");
    expect(p).toMatchObject({ n: 3, idx: 0, waiting: true, gap: false, ende: false, state: "pause" });
    expect(p.remainingMs).toBe(30 * 60_000);
    expect(p.fill).toBe(0);
  });

  it("should run the current item with its remaining time and progress", () => {
    const p = phaseAt("10:45");
    expect(p).toMatchObject({ idx: 1, waiting: false, gap: false, ende: false, state: "laeuft" });
    expect(p.remainingMs).toBe(45 * 60_000);
    expect(p.fill).toBe(8); // halfway through a 90 min item → 8 of 16 cells
  });

  it("should switch to endspurt in the last five minutes", () => {
    expect(phaseAt("11:25").state).toBe("endspurt");
    expect(phaseAt("11:24", 59).state).toBe("laeuft");
  });

  it("should show meals and breaks as pause", () => {
    expect(phaseAt("12:30").state).toBe("pause");
  });

  it("should report a gap as waiting on the next item", () => {
    const p = phaseAt("11:45");
    expect(p).toMatchObject({ idx: 2, waiting: true, gap: true, state: "pause", blinds: GAP_BLINDS });
    expect(p.remainingMs).toBe(15 * 60_000);
  });

  it("should end after the last item", () => {
    const p = phaseAt("14:00");
    expect(p).toMatchObject({ idx: 3, ende: true, state: "ende", fill: 16, remainingMs: 0 });
  });

  it("should pick the blinds from the item kind", () => {
    expect(phaseAt("09:30").blinds).toBe(100); // talk: closed
    expect(phaseAt("10:30").blinds).toBe(0); // phase: open
    expect(phaseAt("12:30").blinds).toBe(50); // meal: half
    expect(phaseAt("14:00").blinds).toBe(50); // over: keeps the last item's
  });

  it("should end at once on a day without items", () => {
    expect(pixelPhase(buildTimeline([], at("10:00")))).toMatchObject({ n: 0, idx: 0, ende: true, blinds: 0 });
  });
});

describe("schoolName", () => {
  it("should take the part after the last middle dot", () => {
    expect(schoolName("Make Your School · Gymnasium Wertingen")).toBe("Gymnasium Wertingen");
  });

  it("should keep a title without a dot", () => {
    expect(schoolName(" St. Ursula ")).toBe("St. Ursula");
  });
});

describe("calendarSubline", () => {
  it("should join the German date and the school", () => {
    expect(calendarSubline("2026-09-30", "Make Your School · St. Ursula")).toBe("30.09.2026 · St. Ursula");
  });

  it("should drop an empty school", () => {
    expect(calendarSubline("2026-09-30", "")).toBe("30.09.2026");
  });
});
