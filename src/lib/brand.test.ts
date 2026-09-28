import { describe, expect, it } from "vitest";
import { KIND_LABELS, KIND_TONE, heroTitleSize } from "./brand";
import { AGENDA_KINDS } from "../types";

describe("agenda kind metadata", () => {
  it("should define a German label for every kind", () => {
    for (const kind of AGENDA_KINDS) {
      expect(KIND_LABELS[kind]).toBeTruthy();
    }
  });

  it("should define a tone for every kind", () => {
    for (const kind of AGENDA_KINDS) {
      expect(KIND_TONE[kind]).toBeTruthy();
    }
  });
});

describe("heroTitleSize", () => {
  it("should use the largest size for short titles", () => {
    expect(heroTitleSize("Mittagessen")).toBe("xl");
    expect(heroTitleSize("a".repeat(22))).toBe("xl");
  });

  it("should step down for longer titles", () => {
    expect(heroTitleSize("Phase 1 · Prototyp bauen")).toBe("lg");
    expect(heroTitleSize("a".repeat(28))).toBe("lg");
  });

  it("should step down again so very long titles keep to two lines", () => {
    expect(heroTitleSize("Phase 2 · Weiterbauen & Testen")).toBe("md");
  });
});
