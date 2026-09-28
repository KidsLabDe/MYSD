import type { Filters } from "../lib/filter";
import { hasActiveFilters } from "../lib/filter";
import type { ProjectStatus } from "../types";
import { PROJECT_STATUSES } from "../types";
import { STATUS_LABELS } from "../lib/brand";
import { SearchIcon } from "./icons";

interface FiltersBarProps {
  filters: Filters;
  onChange: (next: Filters) => void;
  onReset: () => void;
  hackdays: readonly string[];
  schools: readonly string[];
  categories: readonly string[];
}

/** Search box plus dropdown facets. Purely controlled by the parent. */
export function FiltersBar({
  filters,
  onChange,
  onReset,
  hackdays,
  schools,
  categories,
}: FiltersBarProps) {
  const patch = (partial: Partial<Filters>) => onChange({ ...filters, ...partial });

  // Normalizes the "all" sentinel option back to null.
  const pick = (value: string): string | null => (value === "" ? null : value);

  return (
    <div className="filters">
      <label className="search">
        <SearchIcon size={18} />
        <input
          type="search"
          value={filters.search}
          onChange={(e) => patch({ search: e.target.value })}
          placeholder="Gruppe, Projekt, Technik suchen…"
          aria-label="Suche"
        />
      </label>

      <label className="select">
        <select
          value={filters.hackday ?? ""}
          onChange={(e) => patch({ hackday: pick(e.target.value) })}
          aria-label="Nach Hackday filtern"
        >
          <option value="">Alle Hackdays</option>
          {hackdays.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
      </label>

      <label className="select">
        <select
          value={filters.school ?? ""}
          onChange={(e) => patch({ school: pick(e.target.value) })}
          aria-label="Nach Schule filtern"
        >
          <option value="">Alle Schulen</option>
          {schools.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label className="select">
        <select
          value={filters.category ?? ""}
          onChange={(e) => patch({ category: pick(e.target.value) })}
          aria-label="Nach Thema filtern"
        >
          <option value="">Alle Themen</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className="select">
        <select
          value={filters.status ?? ""}
          onChange={(e) =>
            patch({ status: (pick(e.target.value) as ProjectStatus | null) })
          }
          aria-label="Nach Status filtern"
        >
          <option value="">Alle Status</option>
          {PROJECT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </label>

      {hasActiveFilters(filters) && (
        <button type="button" className="btn-ghost" onClick={onReset}>
          Filter zurücksetzen
        </button>
      )}
    </div>
  );
}
