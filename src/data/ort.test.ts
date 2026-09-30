import { describe, expect, it } from "vitest";
import ort from "./ort.json";
import { POSTERS } from "../components/pixel/scene/components/poster";

// ort.json: where the Pixel UI takes its live weather from, and its poster.
describe("ort.json", () => {
  it("should hold valid coordinates for the weather", () => {
    expect(ort.latitude).toBeGreaterThanOrEqual(-90);
    expect(ort.latitude).toBeLessThanOrEqual(90);
    expect(ort.longitude).toBeGreaterThanOrEqual(-180);
    expect(ort.longitude).toBeLessThanOrEqual(180);
  });

  it("should name a known poster variant", () => {
    expect(POSTERS).toContain(ort.poster);
  });
});
