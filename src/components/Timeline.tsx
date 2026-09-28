import type { TimelineEntry } from "../lib/schedule";
import { doneCount, formatHuman } from "../lib/schedule";
import { KIND_TONE } from "../lib/brand";
import { kindIcon } from "./icons";

interface TimelineProps {
  entries: readonly TimelineEntry[];
  /** Seconds left in the running item (for its "noch 43 Min" line). */
  remainingSeconds: number | null;
  /** On a multi-day event, e.g. "Tag 1 von 3". */
  dayLabel?: string | null;
}

function metaLine({ item, state }: TimelineEntry, remainingSeconds: number | null): string {
  const lead =
    state === "past"
      ? `bis ${item.end}`
      : state === "current" && remainingSeconds !== null
        ? `noch ${formatHuman(remainingSeconds)}`
        : `${item.start} – ${item.end}`;
  return item.location ? `${lead} · ${item.location}` : lead;
}

/** The full plan for the day on a vertical rail; the running row is lifted. */
export function Timeline({ entries, remainingSeconds, dayLabel = null }: TimelineProps) {
  return (
    <section className="plan" aria-labelledby="plan-heading">
      <div className="plan__head">
        <h2 id="plan-heading" className="plan__title">
          Tagesplan
          {dayLabel && <span className="plan__day">{dayLabel}</span>}
        </h2>
        <span className="plan__count">
          {doneCount(entries)} von {entries.length} erledigt
        </span>
      </div>

      <ol className="timeline">
        {entries.map((entry) => {
          const { item, state, progress } = entry;
          const Icon = kindIcon(item.kind);
          return (
            <li
              key={item.id}
              className={`tl tl--${state}`}
              aria-current={state === "current" ? "step" : undefined}
            >
              <time className="tl__time">{item.start}</time>

              <span className={`tl__tile tone-${KIND_TONE[item.kind]}`} aria-hidden="true">
                <Icon size={20} />
              </span>

              <div className="tl__body">
                <div className="tl__head">
                  <span className="tl__title">{item.title}</span>
                  {state === "current" && <span className="tl__badge">Läuft</span>}
                </div>
                <div className="tl__meta">{metaLine(entry, remainingSeconds)}</div>
                {state === "current" && (
                  <div className="tl__progress" aria-hidden="true">
                    <span className="tl__progress-fill" style={{ width: `${progress * 100}%` }} />
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
