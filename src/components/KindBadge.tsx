import type { AgendaKind } from "../types";
import { KIND_LABELS, KIND_TONE } from "../lib/brand";
import { kindIcon } from "./icons";

interface KindBadgeProps {
  kind: AgendaKind;
  /** `sm` is the compact pill used inside the next card. */
  size?: "md" | "sm";
}

/** Tone-tinted pill naming an item's kind (icon + German label). */
export function KindBadge({ kind, size = "md" }: KindBadgeProps) {
  const Icon = kindIcon(kind);
  return (
    <span className={`badge badge--${size} tone-${KIND_TONE[kind]}`}>
      <Icon size={size === "sm" ? 18 : 20} />
      {KIND_LABELS[kind]}
    </span>
  );
}
