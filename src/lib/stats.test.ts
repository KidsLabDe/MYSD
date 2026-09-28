import { describe, expect, it } from "vitest";
import type { Group, ProjectStatus } from "../types";
import { statusBreakdown, summarize, uniqueValues } from "./stats";

function makeGroup(
  id: string,
  school: string,
  hackday: string,
  memberCount: number,
  status: ProjectStatus,
  category = "Umwelt",
): Group {
  return {
    id,
    name: `Team ${id}`,
    school,
    city: "Stadt",
    hackday,
    memberCount,
    mentor: "Mentor",
    project: {
      title: `Projekt ${id}`,
      description: "Beschreibung",
      category,
      tech: ["Arduino"],
      status,
    },
  };
}

const groups: Group[] = [
  makeGroup("1", "Schule A", "Hackday X", 5, "idea", "Umwelt"),
  makeGroup("2", "Schule A", "Hackday X", 4, "done", "Mobilität"),
  makeGroup("3", "Schule B", "Hackday Y", 6, "done", "Umwelt"),
];

describe("summarize", () => {
  it("should count total groups", () => {
    expect(summarize(groups).groups).toBe(3);
  });

  it("should sum all students across groups", () => {
    expect(summarize(groups).students).toBe(15);
  });

  it("should count distinct schools", () => {
    expect(summarize(groups).schools).toBe(2);
  });

  it("should count distinct hackdays", () => {
    expect(summarize(groups).hackdays).toBe(2);
  });

  it("should return zeros for an empty list", () => {
    expect(summarize([])).toEqual({ groups: 0, students: 0, schools: 0, hackdays: 0 });
  });
});

describe("statusBreakdown", () => {
  it("should count groups per status", () => {
    const breakdown = statusBreakdown(groups);
    expect(breakdown.idea).toBe(1);
    expect(breakdown.done).toBe(2);
  });

  it("should include every status even when unused", () => {
    const breakdown = statusBreakdown(groups);
    expect(breakdown.building).toBe(0);
    expect(breakdown.testing).toBe(0);
  });

  it("should sum to the number of groups", () => {
    const breakdown = statusBreakdown(groups);
    const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
    expect(total).toBe(groups.length);
  });
});

describe("uniqueValues", () => {
  it("should return sorted distinct values", () => {
    expect(uniqueValues(groups, (g) => g.school)).toEqual(["Schule A", "Schule B"]);
  });

  it("should sort categories alphabetically (de locale)", () => {
    expect(uniqueValues(groups, (g) => g.project.category)).toEqual([
      "Mobilität",
      "Umwelt",
    ]);
  });

  it("should return an empty array for no groups", () => {
    expect(uniqueValues([], (g) => g.school)).toEqual([]);
  });
});
