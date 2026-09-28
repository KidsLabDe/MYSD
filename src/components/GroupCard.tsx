import type { Group } from "../types";
import { toneForCategory } from "../lib/brand";
import { StatusChip } from "./StatusChip";
import { CalendarIcon, PersonIcon, UsersIcon } from "./icons";

interface GroupCardProps {
  group: Group;
  onSelect: (group: Group) => void;
}

/** Compact, clickable summary of one group and its project. */
export function GroupCard({ group, onSelect }: GroupCardProps) {
  const { project } = group;

  return (
    <button
      type="button"
      className="card"
      onClick={() => onSelect(group)}
      aria-label={`Details zu ${group.name} anzeigen`}
    >
      <div className="card__top">
        <div>
          <div className="card__group">{group.name}</div>
          <div className="card__school">
            {group.school} · {group.city}
          </div>
        </div>
        <StatusChip status={project.status} />
      </div>

      <div className="card__project">
        <div className="card__project-label">Projekt</div>
        <div className="card__project-title">{project.title}</div>
        <p className="card__desc">{project.description}</p>
        <div className="tags" style={{ marginTop: 10 }}>
          <span className={`chip tone-${toneForCategory(project.category)}`}>
            {project.category}
          </span>
          {project.tech.slice(0, 3).map((tech) => (
            <span className="chip chip--tech" key={tech}>
              {tech}
            </span>
          ))}
          {project.tech.length > 3 && (
            <span className="chip chip--tech">+{project.tech.length - 3}</span>
          )}
        </div>
      </div>

      <div className="card__meta">
        <span>
          <UsersIcon size={15} /> {group.memberCount} Mitglieder
        </span>
        <span>
          <PersonIcon size={15} /> {group.mentor}
        </span>
        <span>
          <CalendarIcon size={15} /> {group.hackday}
        </span>
      </div>
    </button>
  );
}
