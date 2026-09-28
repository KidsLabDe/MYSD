import { describe, expect, it } from "vitest";
import { STATUS_LABELS, STATUS_TONE, toneForCategory } from "./brand";
import { PROJECT_STATUSES } from "../types";

describe("toneForCategory", () => {
  it("should be deterministic for the same category", () => {
    expect(toneForCategory("Umwelt")).toBe(toneForCategory("Umwelt"));
  });

  it("should always return a known tone", () => {
    const known = ["blue", "purple", "orange", "green", "pink"];
    for (const category of ["Umwelt", "Mobilität", "Schulalltag", "Inklusion", "X"]) {
      expect(known).toContain(toneForCategory(category));
    }
  });
});

describe("status metadata", () => {
  it("should define a German label for every status", () => {
    for (const status of PROJECT_STATUSES) {
      expect(STATUS_LABELS[status]).toBeTruthy();
    }
  });

  it("should define a tone for every status", () => {
    for (const status of PROJECT_STATUSES) {
      expect(STATUS_TONE[status]).toBeTruthy();
    }
  });
});
