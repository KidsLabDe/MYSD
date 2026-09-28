import type { Summary } from "../lib/stats";
import { CalendarIcon, RocketIcon, SchoolIcon, UsersIcon } from "./icons";

/** Four headline metrics for the current (filtered) group set. */
export function StatTiles({ summary }: { summary: Summary }) {
  const tiles = [
    { label: "Gruppen", value: summary.groups, icon: <RocketIcon size={22} /> },
    { label: "Schüler:innen", value: summary.students, icon: <UsersIcon size={22} /> },
    { label: "Schulen", value: summary.schools, icon: <SchoolIcon size={22} /> },
    { label: "Hackdays", value: summary.hackdays, icon: <CalendarIcon size={22} /> },
  ];

  return (
    <div className="stats">
      {tiles.map((tile) => (
        <div className="stat" key={tile.label}>
          <span className="stat__icon">{tile.icon}</span>
          <div className="stat__value">{tile.value}</div>
          <div className="stat__label">{tile.label}</div>
        </div>
      ))}
    </div>
  );
}
