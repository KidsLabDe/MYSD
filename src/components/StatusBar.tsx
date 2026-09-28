import type { ProjectStatus } from "../types";
import { PROJECT_STATUSES } from "../types";
import { STATUS_LABELS, STATUS_TONE } from "../lib/brand";

interface StatusBarProps {
  breakdown: Readonly<Record<ProjectStatus, number>>;
  total: number;
}

/** Stacked bar + legend showing how projects are distributed across statuses. */
export function StatusBar({ breakdown, total }: StatusBarProps) {
  return (
    <div className="statusbar">
      <div
        className="statusbar__track"
        role="img"
        aria-label="Verteilung der Projekte nach Status"
      >
        {PROJECT_STATUSES.map((status) => {
          const count = breakdown[status];
          if (count === 0) return null;
          const pct = total === 0 ? 0 : (count / total) * 100;
          return (
            <span
              key={status}
              className={`statusbar__seg bg-${STATUS_TONE[status]}`}
              style={{ width: `${pct}%` }}
              title={`${STATUS_LABELS[status]}: ${count}`}
            />
          );
        })}
      </div>

      <div className="statusbar__legend">
        {PROJECT_STATUSES.map((status) => (
          <span className="legend-item" key={status}>
            <span className={`legend-dot bg-${STATUS_TONE[status]}`} />
            {STATUS_LABELS[status]} <strong>{breakdown[status]}</strong>
          </span>
        ))}
      </div>
    </div>
  );
}
