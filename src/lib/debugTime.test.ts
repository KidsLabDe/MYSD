import { describe, expect, it } from "vitest";
import { parseDebugTime } from "./debugTime";

const real = new Date(2026, 8, 28, 9, 0, 0); // Mon 28 Sep 2026, 09:00:00
const shifted = (search: string) => {
  const r = parseDebugTime(search, real);
  if (r === null || "error" in r) throw new Error(`expected an offset for ${search}`);
  return new Date(real.getTime() + r.offsetMs);
};

describe("parseDebugTime", () => {
  it("should return null without debug params", () => {
    expect(parseDebugTime("", real)).toBeNull();
    expect(parseDebugTime("?theme=dark", real)).toBeNull();
  });

  it("should jump to the given date and time", () => {
    expect(shifted("?date=2026-09-29&time=14:50")).toEqual(new Date(2026, 8, 29, 14, 50, 0));
  });

  it("should accept seconds", () => {
    expect(shifted("?date=2026-09-30&time=13:14:30")).toEqual(new Date(2026, 8, 30, 13, 14, 30));
  });

  it("should accept a single-digit hour", () => {
    expect(shifted("?date=2026-09-29&time=7:00")).toEqual(new Date(2026, 8, 29, 7, 0, 0));
  });

  it("should keep today's date when only a time is given", () => {
    expect(shifted("?time=16:00")).toEqual(new Date(2026, 8, 28, 16, 0, 0));
  });

  it("should keep the current time of day when only a date is given", () => {
    expect(shifted("?date=2026-09-30")).toEqual(new Date(2026, 8, 30, 9, 0, 0));
  });

  it("should reject malformed or impossible values", () => {
    expect(parseDebugTime("?time=25:00", real)).toHaveProperty("error");
    expect(parseDebugTime("?time=9", real)).toHaveProperty("error");
    expect(parseDebugTime("?date=2026-02-30", real)).toHaveProperty("error");
    expect(parseDebugTime("?date=28.09.2026", real)).toHaveProperty("error");
  });
});
