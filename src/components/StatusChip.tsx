import type { ProjectStatus } from "../types";
import { STATUS_LABELS, STATUS_TONE } from "../lib/brand";

/** A colored pill communicating a project's prototype status. */
export function StatusChip({ status }: { status: ProjectStatus }) {
  return (
    <span className={`chip chip--dot tone-${STATUS_TONE[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
