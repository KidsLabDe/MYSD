/**
 * Domain types for the MYS (Make Your School) dashboard.
 *
 * A Hackday brings student `Group`s together; each group builds one `Project`
 * (a prototype). The dashboard is read-only and renders these entities.
 */

/** Lifecycle of a group's prototype during a Hackday. */
export type ProjectStatus = "idea" | "building" | "testing" | "done";

export const PROJECT_STATUSES: readonly ProjectStatus[] = [
  "idea",
  "building",
  "testing",
  "done",
] as const;

/** The thing a group builds. */
export interface Project {
  readonly title: string;
  readonly description: string;
  /** Theme / topic area, e.g. "Umwelt", "Schulalltag". */
  readonly category: string;
  /** Technologies / materials used, e.g. ["Arduino", "3D-Druck"]. */
  readonly tech: readonly string[];
  readonly status: ProjectStatus;
}

/** A team of students at a Hackday. */
export interface Group {
  readonly id: string;
  readonly name: string;
  readonly school: string;
  readonly city: string;
  /** Name of the Hackday event the group belongs to. */
  readonly hackday: string;
  readonly memberCount: number;
  /** The group's mentor / coach ("Mentor:in"). */
  readonly mentor: string;
  readonly project: Project;
}

/** Shape of the seed data file (`src/data/groups.json`). */
export interface DashboardData {
  readonly groups: readonly Group[];
}
