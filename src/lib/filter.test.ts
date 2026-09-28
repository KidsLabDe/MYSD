import { describe, expect, it } from "vitest";
import type { Group } from "../types";
import {
  applyFilters,
  EMPTY_FILTERS,
  hasActiveFilters,
  matchesFilters,
} from "./filter";

function makeGroup(overrides: Partial<Group> = {}): Group {
  return {
    id: "g-x",
    name: "Team Test",
    school: "Testschule",
    city: "Teststadt",
    hackday: "Hackday Test 2026",
    memberCount: 4,
    mentor: "Alex Muster",
    project: {
      title: "TestProjekt",
      description: "Ein Prototyp mit Sensoren.",
      category: "Umwelt",
      tech: ["Arduino", "3D-Druck"],
      status: "building",
    },
    ...overrides,
  };
}

describe("matchesFilters", () => {
  it("should match any group when no filters are active", () => {
    expect(matchesFilters(makeGroup(), EMPTY_FILTERS)).toBe(true);
  });

  it("should match a search term found in the project title", () => {
    const group = makeGroup();
    expect(matchesFilters(group, { ...EMPTY_FILTERS, search: "testprojekt" })).toBe(true);
  });

  it("should match a search term found in the tech stack", () => {
    const group = makeGroup();
    expect(matchesFilters(group, { ...EMPTY_FILTERS, search: "arduino" })).toBe(true);
  });

  it("should require every search term to be present (AND semantics)", () => {
    const group = makeGroup();
    expect(matchesFilters(group, { ...EMPTY_FILTERS, search: "arduino sensor" })).toBe(true);
    expect(matchesFilters(group, { ...EMPTY_FILTERS, search: "arduino raspberry" })).toBe(false);
  });

  it("should be case-insensitive", () => {
    const group = makeGroup();
    expect(matchesFilters(group, { ...EMPTY_FILTERS, search: "TEAM" })).toBe(true);
  });

  it("should filter by hackday exactly", () => {
    const group = makeGroup({ hackday: "Hackday Berlin 2026" });
    expect(
      matchesFilters(group, { ...EMPTY_FILTERS, hackday: "Hackday Berlin 2026" }),
    ).toBe(true);
    expect(
      matchesFilters(group, { ...EMPTY_FILTERS, hackday: "Hackday Hamburg 2026" }),
    ).toBe(false);
  });

  it("should filter by project status", () => {
    const group = makeGroup({ project: { ...makeGroup().project, status: "done" } });
    expect(matchesFilters(group, { ...EMPTY_FILTERS, status: "done" })).toBe(true);
    expect(matchesFilters(group, { ...EMPTY_FILTERS, status: "idea" })).toBe(false);
  });

  it("should require all active filters to pass simultaneously", () => {
    const group = makeGroup({ school: "A", project: { ...makeGroup().project, category: "Umwelt" } });
    expect(
      matchesFilters(group, { ...EMPTY_FILTERS, school: "A", category: "Umwelt" }),
    ).toBe(true);
    expect(
      matchesFilters(group, { ...EMPTY_FILTERS, school: "A", category: "Mobilität" }),
    ).toBe(false);
  });
});

describe("applyFilters", () => {
  const groups = [
    makeGroup({ id: "1", school: "A", project: { ...makeGroup().project, status: "idea" } }),
    makeGroup({ id: "2", school: "B", project: { ...makeGroup().project, status: "done" } }),
    makeGroup({ id: "3", school: "A", project: { ...makeGroup().project, status: "done" } }),
  ];

  it("should return all groups with empty filters", () => {
    expect(applyFilters(groups, EMPTY_FILTERS)).toHaveLength(3);
  });

  it("should narrow the list to matching groups", () => {
    const result = applyFilters(groups, { ...EMPTY_FILTERS, school: "A", status: "done" });
    expect(result.map((g) => g.id)).toEqual(["3"]);
  });

  it("should return an empty array when nothing matches", () => {
    expect(applyFilters(groups, { ...EMPTY_FILTERS, search: "zzzznope" })).toEqual([]);
  });
});

describe("hasActiveFilters", () => {
  it("should be false for empty filters", () => {
    expect(hasActiveFilters(EMPTY_FILTERS)).toBe(false);
  });

  it("should be false for a whitespace-only search", () => {
    expect(hasActiveFilters({ ...EMPTY_FILTERS, search: "   " })).toBe(false);
  });

  it("should be true when any facet is set", () => {
    expect(hasActiveFilters({ ...EMPTY_FILTERS, status: "done" })).toBe(true);
    expect(hasActiveFilters({ ...EMPTY_FILTERS, search: "abc" })).toBe(true);
  });
});
