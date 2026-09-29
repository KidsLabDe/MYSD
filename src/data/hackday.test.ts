import { describe, expect, it } from "vitest";
import data from "./hackday.json";
import { validateHackday } from "../lib/validate";

// Guards the live plan: every edit to hackday.json (by hand or via the
// new-hackday skill) must pass `npm test` before it is committed.
describe("hackday.json", () => {
  it("should be a valid Hackday plan", () => {
    expect(validateHackday(data)).toEqual([]);
  });
});
