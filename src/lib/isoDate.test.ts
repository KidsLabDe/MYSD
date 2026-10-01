import { describe, expect, it } from "vitest";
import { parseIsoDate } from "./isoDate";

describe("parseIsoDate", () => {
  it("should return the local date for a valid YYYY-MM-DD", () => {
    expect(parseIsoDate("2026-09-28")).toEqual(new Date(2026, 8, 28));
  });

  it("should return null for a date that rolls over", () => {
    expect(parseIsoDate("2026-02-30")).toBeNull();
  });

  it("should return null for malformed text", () => {
    expect(parseIsoDate("28.09.2026")).toBeNull();
    expect(parseIsoDate("")).toBeNull();
  });
});
