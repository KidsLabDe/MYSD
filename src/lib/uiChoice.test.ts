import { describe, expect, it } from "vitest";
import type { HackdayDay } from "../types";
import { activeUi, eventKey, makeChoice, parseChoice, parseUiParam } from "./uiChoice";

const day = (date: string): HackdayDay => ({
  date,
  schedule: [{ id: `${date}-a`, start: "08:00", end: "15:00", title: "Arbeitsphase", kind: "phase" }],
});

// Mon 28 – Wed 30 Sep 2026, deliberately unsorted.
const days = [day("2026-09-30"), day("2026-09-28"), day("2026-09-29")];
const nextEvent = [day("2026-11-10"), day("2026-11-11"), day("2026-11-12")];

const at = (month: number, d: number, h = 10) => new Date(2026, month - 1, d, h, 0, 0);

describe("eventKey", () => {
  it("should name the event by its first and last day", () => {
    expect(eventKey(days)).toBe("2026-09-28/2026-09-30");
  });

  it("should return null for a plan without days", () => {
    expect(eventKey([])).toBeNull();
  });
});

describe("makeChoice", () => {
  it("should keep the choice until the event's last day", () => {
    expect(makeChoice("pixel", days, at(9, 20))).toEqual({
      ui: "pixel",
      event: "2026-09-28/2026-09-30",
      until: "2026-09-30",
    });
  });

  it("should keep a choice made after the event until the end of today", () => {
    expect(makeChoice("modern", days, at(10, 2))?.until).toBe("2026-10-02");
  });

  it("should return null for a plan without days", () => {
    expect(makeChoice("modern", [], at(9, 20))).toBeNull();
  });
});

describe("activeUi", () => {
  const choice = makeChoice("pixel", days, at(9, 20));

  it("should use the choice before the event", () => {
    expect(activeUi(choice, days, at(9, 20))).toBe("pixel");
  });

  it("should use the choice through the end of the last day", () => {
    expect(activeUi(choice, days, new Date(2026, 8, 30, 23, 59, 59))).toBe("pixel");
  });

  it("should reset the choice once the event is over", () => {
    expect(activeUi(choice, days, at(10, 1, 0))).toBeNull();
  });

  it("should reset the choice when the plan is for another event", () => {
    expect(activeUi(choice, nextEvent, at(9, 29))).toBeNull();
  });

  it("should ask when nothing was chosen yet", () => {
    expect(activeUi(null, days, at(9, 20))).toBeNull();
  });
});

describe("parseChoice", () => {
  it("should read back a stored choice", () => {
    const choice = makeChoice("modern", days, at(9, 20));
    expect(parseChoice(JSON.stringify(choice))).toEqual(choice);
  });

  it.each([
    ["nothing stored", null],
    ["broken JSON", "{"],
    ["a plain string", '"pixel"'],
    ["an unknown UI", '{"ui":"retro","event":"a/b","until":"2026-09-30"}'],
    ["a missing date", '{"ui":"pixel","event":"a/b"}'],
  ])("should ignore %s", (_label, raw) => {
    expect(parseChoice(raw)).toBeNull();
  });
});

describe("parseUiParam", () => {
  it("should read a UI forced via ?ui=", () => {
    expect(parseUiParam("?ui=pixel")).toBe("pixel");
    expect(parseUiParam("?date=2026-09-29&ui=modern")).toBe("modern");
  });

  it("should ignore a missing or unknown ?ui=", () => {
    expect(parseUiParam("")).toBeNull();
    expect(parseUiParam("?ui=retro")).toBeNull();
  });
});
