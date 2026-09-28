import { formatCountdown } from "../lib/schedule";

const SIZE = 320;
const RADIUS = 146;
const STROKE = 16;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface RingTimerProps {
  /** Share of the ring still full (0–1); the arc drains as time passes. */
  fraction: number;
  seconds: number;
  label: string;
  sub: string;
  ariaLabel: string;
}

/**
 * Circular countdown. The arc shows the remaining fraction; its colour and
 * motion come from the hero's state classes (urgent / gap / before) in CSS.
 */
export function RingTimer({ fraction, seconds, label, sub, ariaLabel }: RingTimerProps) {
  const countdown = formatCountdown(seconds);
  const long = countdown.split(":").length > 2;

  return (
    <div
      className="ring"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round((1 - fraction) * 100)}
      aria-label={ariaLabel}
    >
      <svg className="ring__svg" viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
        <circle
          className="ring__track"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE}
          fill="none"
        />
        <circle
          className="ring__arc"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          style={{
            strokeDashoffset: CIRCUMFERENCE * (1 - fraction),
            opacity: fraction > 0 ? undefined : 0,
          }}
        />
      </svg>
      <div className="ring__center">
        <span className="ring__label">{label}</span>
        <span className={`ring__count${long ? " ring__count--long" : ""}`}>{countdown}</span>
        <span className="ring__sub">{sub}</span>
      </div>
    </div>
  );
}
