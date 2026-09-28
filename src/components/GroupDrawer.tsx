import { useEffect } from "react";
import type { Group } from "../types";
import { toneForCategory } from "../lib/brand";
import { StatusChip } from "./StatusChip";
import { CloseIcon } from "./icons";

interface GroupDrawerProps {
  group: Group | null;
  onClose: () => void;
}

/** Slide-in panel with the full details of a selected group. */
export function GroupDrawer({ group, onClose }: GroupDrawerProps) {
  // Close on Escape and lock body scroll while open.
  useEffect(() => {
    if (group === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [group, onClose]);

  if (group === null) return null;
  const { project } = group;

  return (
    <div
      className="overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Details zu ${group.name}`}
    >
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer__header">
          <button
            type="button"
            className="drawer__close"
            onClick={onClose}
            aria-label="Schließen"
          >
            <CloseIcon size={18} />
          </button>
          <div className="drawer__eyebrow">{group.hackday}</div>
          <h2 className="drawer__title">{group.name}</h2>
          <div className="drawer__school">
            {group.school} · {group.city}
          </div>
        </div>

        <div className="drawer__body">
          <div className="detail-block">
            <h4>Projekt</h4>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <strong style={{ fontSize: "1.2rem" }}>{project.title}</strong>
              <StatusChip status={project.status} />
            </div>
            <p style={{ marginTop: 10 }}>{project.description}</p>
          </div>

          <div className="detail-block">
            <h4>Thema & Technik</h4>
            <div className="tags">
              <span className={`chip tone-${toneForCategory(project.category)}`}>
                {project.category}
              </span>
              {project.tech.map((tech) => (
                <span className="chip chip--tech" key={tech}>
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="detail-block">
            <h4>Gruppe</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <div className="k">Schule</div>
                <div className="v">{group.school}</div>
              </div>
              <div className="detail-item">
                <div className="k">Ort</div>
                <div className="v">{group.city}</div>
              </div>
              <div className="detail-item">
                <div className="k">Mitglieder</div>
                <div className="v">{group.memberCount}</div>
              </div>
              <div className="detail-item">
                <div className="k">Mentor:in</div>
                <div className="v">{group.mentor}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
