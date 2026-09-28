/**
 * Pure filtering logic for the dashboard. React components own the filter
 * state; this module just decides which groups match it.
 */

import type { Group, ProjectStatus } from "../types";

export interface Filters {
  /** Free-text query matched against name, project, school and tech. */
  readonly search: string;
  readonly hackday: string | null;
  readonly school: string | null;
  readonly category: string | null;
  readonly status: ProjectStatus | null;
}

export const EMPTY_FILTERS: Filters = {
  search: "",
  hackday: null,
  school: null,
  category: null,
  status: null,
};

/** Builds the lowercase haystack a search query is tested against. */
function haystack(group: Group): string {
  const { project } = group;
  return [
    group.name,
    group.school,
    group.city,
    group.hackday,
    group.mentor,
    project.title,
    project.description,
    project.category,
    ...project.tech,
  ]
    .join(" ")
    .toLowerCase();
}

function matchesSearch(group: Group, search: string): boolean {
  const query = search.trim().toLowerCase();
  if (query === "") return true;
  const hay = haystack(group);
  // Every whitespace-separated term must appear (AND semantics).
  return query.split(/\s+/).every((term) => hay.includes(term));
}

/** True when a group satisfies every active filter. */
export function matchesFilters(group: Group, filters: Filters): boolean {
  if (!matchesSearch(group, filters.search)) return false;
  if (filters.hackday !== null && group.hackday !== filters.hackday) return false;
  if (filters.school !== null && group.school !== filters.school) return false;
  if (filters.category !== null && group.project.category !== filters.category) {
    return false;
  }
  if (filters.status !== null && group.project.status !== filters.status) {
    return false;
  }
  return true;
}

/** Applies all active filters to the group list. */
export function applyFilters(
  groups: readonly Group[],
  filters: Filters,
): readonly Group[] {
  return groups.filter((group) => matchesFilters(group, filters));
}

/** True when at least one filter would narrow the result set. */
export function hasActiveFilters(filters: Filters): boolean {
  return (
    filters.search.trim() !== "" ||
    filters.hackday !== null ||
    filters.school !== null ||
    filters.category !== null ||
    filters.status !== null
  );
}
