/**
 * Pure aggregation helpers over the group list. Kept free of React so they can
 * be unit-tested in isolation.
 */

import type { Group, ProjectStatus } from "../types";
import { PROJECT_STATUSES } from "../types";

export interface Summary {
  readonly groups: number;
  readonly students: number;
  readonly schools: number;
  readonly hackdays: number;
}

/** Counts distinct values produced by `key` across all groups. */
function distinctCount(groups: readonly Group[], key: (g: Group) => string): number {
  const seen = new Set<string>();
  for (const group of groups) {
    seen.add(key(group));
  }
  return seen.size;
}

/** Headline numbers shown in the stat tiles. */
export function summarize(groups: readonly Group[]): Summary {
  return {
    groups: groups.length,
    students: groups.reduce((total, g) => total + g.memberCount, 0),
    schools: distinctCount(groups, (g) => g.school),
    hackdays: distinctCount(groups, (g) => g.hackday),
  };
}

/** Number of groups in each project status, always covering every status. */
export function statusBreakdown(
  groups: readonly Group[],
): Readonly<Record<ProjectStatus, number>> {
  const counts = Object.fromEntries(
    PROJECT_STATUSES.map((s) => [s, 0]),
  ) as Record<ProjectStatus, number>;

  for (const group of groups) {
    counts[group.project.status] += 1;
  }
  return counts;
}

/** Sorted, de-duplicated list of a string facet across groups. */
export function uniqueValues(
  groups: readonly Group[],
  key: (g: Group) => string,
): readonly string[] {
  const values = new Set<string>();
  for (const group of groups) {
    values.add(key(group));
  }
  return [...values].sort((a, b) => a.localeCompare(b, "de"));
}
