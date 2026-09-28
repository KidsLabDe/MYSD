import type { CSSProperties } from "react";

const TONES = ["brand", "blue", "purple", "orange", "green"] as const;
const COUNT = 30;

/**
 * Deterministic pseudo-random spread (no Math.random in render), so every
 * piece keeps its place across re-renders on each clock tick.
 */
const PIECES = Array.from({ length: COUNT }, (_, i) => ({
  tone: TONES[i % TONES.length],
  left: (i * 37) % 100,
  size: i % 3 === 0 ? 14 : 10,
  duration: 4.5 + ((i * 7) % 29) / 10,
  delay: -((i * 13) % 70) / 10,
}));

/** Falling pixel confetti for the `after` state. Purely decorative. */
export function Confetti() {
  return (
    <div className="confetti" aria-hidden="true">
      {PIECES.map((p, i) => (
        <span
          key={i}
          className={`confetti__piece confetti__piece--${p.tone}`}
          style={
            {
              left: `${p.left}%`,
              "--size": `${p.size}px`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
