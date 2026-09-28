import { useMemo, useState } from "react";
import rawData from "./data/groups.json";
import type { DashboardData, Group } from "./types";
import { BRAND } from "./lib/brand";
import { applyFilters, EMPTY_FILTERS, hasActiveFilters, type Filters } from "./lib/filter";
import { statusBreakdown, summarize, uniqueValues } from "./lib/stats";
import { useTheme } from "./hooks/useTheme";
import { Header } from "./components/Header";
import { StatTiles } from "./components/StatTiles";
import { StatusBar } from "./components/StatusBar";
import { FiltersBar } from "./components/Filters";
import { GroupCard } from "./components/GroupCard";
import { GroupDrawer } from "./components/GroupDrawer";
import { EmptyState } from "./components/EmptyState";

const data = rawData as DashboardData;

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [selected, setSelected] = useState<Group | null>(null);

  const groups = data.groups;

  // Facet option lists are derived once from the full dataset.
  const facets = useMemo(
    () => ({
      hackdays: uniqueValues(groups, (g) => g.hackday),
      schools: uniqueValues(groups, (g) => g.school),
      categories: uniqueValues(groups, (g) => g.project.category),
    }),
    [groups],
  );

  const visible = useMemo(() => applyFilters(groups, filters), [groups, filters]);
  const summary = useMemo(() => summarize(visible), [visible]);
  const breakdown = useMemo(() => statusBreakdown(visible), [visible]);

  const resetFilters = () => setFilters(EMPTY_FILTERS);

  return (
    <>
      <Header theme={theme} onToggleTheme={toggleTheme} />

      <main className="shell">
        <section className="hero">
          <h1>
            Gruppen & Projekte der <em>Hackdays</em>
          </h1>
          <p>
            Überblick über alle Teams von Make Your School – ihre Schulen, Projekte und
            der aktuelle Stand ihrer Prototypen. {BRAND.tagline}.
          </p>
        </section>

        <StatTiles summary={summary} />
        <StatusBar breakdown={breakdown} total={summary.groups} />

        <h2 className="section-title">Alle Gruppen</h2>
        <FiltersBar
          filters={filters}
          onChange={setFilters}
          onReset={resetFilters}
          hackdays={facets.hackdays}
          schools={facets.schools}
          categories={facets.categories}
        />

        <p className="result-count">
          <strong>{visible.length}</strong>{" "}
          {visible.length === 1 ? "Gruppe" : "Gruppen"}
          {hasActiveFilters(filters) ? ` von ${groups.length}` : ""} angezeigt
        </p>

        {visible.length === 0 ? (
          <EmptyState onReset={resetFilters} />
        ) : (
          <div className="grid">
            {visible.map((group) => (
              <GroupCard key={group.id} group={group} onSelect={setSelected} />
            ))}
          </div>
        )}
      </main>

      <footer className="footer">
        <span>
          MYS Dashboard · Design im {BRAND.name}-Branding ·{" "}
          <a href="https://kidslab.de" target="_blank" rel="noreferrer">
            kidslab.de
          </a>
        </span>
        <span>
          <a href="https://www.makeyourschool.de" target="_blank" rel="noreferrer">
            makeyourschool.de
          </a>
        </span>
      </footer>

      <GroupDrawer group={selected} onClose={() => setSelected(null)} />
    </>
  );
}
