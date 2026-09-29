/** Minimal inline icon set (stroke icons, inherit `currentColor`). */
import type { SVGProps } from "react";
import type { AgendaKind } from "../types";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 18, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const SunIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Base>
);

export const MoonIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </Base>
);

export const ClockIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Base>
);

export const PinIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
    <circle cx="12" cy="10" r="3" />
  </Base>
);

export const ArrowRightIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Base>
);

export const MegaphoneIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
  </Base>
);

/** Agenda kind: work phase (a wrench). */
export const WrenchIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M14.7 6.3a4 4 0 0 0-5.2 5.2L4 17l3 3 5.5-5.5a4 4 0 0 0 5.2-5.2l-2.6 2.6-2.8-.4-.4-2.8 2.6-2.6z" />
  </Base>
);

/** Agenda kind: meal (a fork & knife). */
export const MealIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 2v7a2 2 0 0 0 2 2v11M8 2v6M4 2v6M18 2c-1.5 0-3 2-3 6 0 2 1 3 2 3v11" />
  </Base>
);

/** Agenda kind: break (a coffee cup). */
export const CoffeeIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 9h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" />
    <path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17M7 2v2M11 2v2" />
  </Base>
);

/** Agenda kind: talk / program (a microphone). */
export const MicIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </Base>
);

/** Picks the icon component matching an agenda kind. */
export function kindIcon(kind: AgendaKind): (p: IconProps) => JSX.Element {
  switch (kind) {
    case "meal":
      return MealIcon;
    case "break":
      return CoffeeIcon;
    case "talk":
      return MicIcon;
    case "phase":
      return WrenchIcon;
  }
}
