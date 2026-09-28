import type { AgendaItem } from "../types";
import type { DayState, TimelineState } from "../lib/schedule";
import { formatIn, isUrgent, ringFraction, upcomingAfterNext } from "../lib/schedule";
import { heroTitleSize } from "../lib/brand";
import { ArrowRightIcon, ClockIcon, PinIcon } from "./icons";
import { KindBadge } from "./KindBadge";
import { RingTimer } from "./RingTimer";
import { Confetti } from "./Confetti";

const EYEBROW: Readonly<Record<DayState, string>> = {
  before: "Gleich geht’s los",
  running: "Jetzt läuft",
  gap: "Kurze Pause",
  after: "Hackday beendet",
};

function withLocation(text: string, item: AgendaItem): string {
  return item.location ? `${text} · ${item.location}` : text;
}

function HeroTitle({ text }: { text: string }) {
  return <h1 className={`hero__title hero__title--${heroTitleSize(text)}`}>{text}</h1>;
}

function HeroMeta({ item }: { item: AgendaItem }) {
  return (
    <>
      <div className="hero__meta">
        <span>
          <ClockIcon size={24} /> {item.start} – {item.end}
        </span>
        {item.location && (
          <span>
            <PinIcon size={24} /> {item.location}
          </span>
        )}
      </div>
      {item.note && <p className="hero__note">{item.note}</p>}
    </>
  );
}

/** "Als Nächstes" (while running) or "Danach" (before / gap) preview card. */
function NextCard({ item, label, when }: { item: AgendaItem; label: string; when: string }) {
  return (
    <div className="next">
      <div className="next__eyebrow">
        <ArrowRightIcon size={20} />
        <span className="next__label">{label}</span>
        <span className="next__when">· {when}</span>
      </div>
      <div className="next__title">{item.title}</div>
      <div className="next__meta">
        <KindBadge kind={item.kind} size="sm" />
        <span>{withLocation(`${item.start} – ${item.end}`, item)}</span>
      </div>
    </div>
  );
}

function DoneStats({ timeline }: { timeline: TimelineState }) {
  const first = timeline.entries[0]?.item;
  const last = timeline.entries[timeline.entries.length - 1]?.item;
  return (
    <div className="hero__stats">
      <div className="stat">
        <span className="stat__value">{timeline.entries.length}</span>
        <span className="stat__label">Programmpunkte</span>
      </div>
      {first && last && (
        <div className="stat">
          <span className="stat__value">
            {first.start}–{last.end}
          </span>
          <span className="stat__label">Hackday</span>
        </div>
      )}
    </div>
  );
}

interface NowPanelProps {
  timeline: TimelineState;
  /** Seconds since midnight, the same instant `timeline` was built for. */
  nowSeconds: number;
}

/**
 * The hero card: what is happening right now, a draining ring countdown and
 * what comes next. Adapts to before / running (+ urgent) / gap / after.
 */
export function NowPanel({ timeline, nowSeconds }: NowPanelProps) {
  const { current, next, dayState, remainingSeconds, untilNextSeconds } = timeline;
  const urgent = isUrgent(timeline, nowSeconds);
  const hero = dayState === "running" ? current : next;
  const eyebrow = urgent ? "Endspurt" : EYEBROW[dayState];

  const stateClass = `hero hero--${dayState}${urgent ? " hero--urgent" : ""}`;
  // Remount on each new item so the entrance animation plays again.
  const key = `${dayState}-${hero?.id ?? "none"}`;

  return (
    <section key={key} className={stateClass} aria-label="Aktueller Programmpunkt">
      {dayState === "after" && <Confetti />}

      <div className="hero__top">
        <div className="hero__eyebrow-row">
          <span className="hero__eyebrow">
            <span className="hero__dot" aria-hidden="true" />
            {eyebrow}
          </span>
          {hero && <KindBadge kind={hero.kind} />}
        </div>

        {dayState === "gap" && <p className="hero__lead">Weiter geht’s mit</p>}

        {dayState === "after" || hero === null ? (
          <>
            <HeroTitle text="Geschafft!" />
            <p className="hero__lead">Der Hackday ist zu Ende. Danke fürs Mitmachen!</p>
          </>
        ) : (
          <>
            <HeroTitle text={hero.title} />
            <HeroMeta item={hero} />
          </>
        )}
      </div>

      <div className="hero__spacer" />

      <div className="hero__bottom">
        {dayState === "after" || hero === null ? (
          <DoneStats timeline={timeline} />
        ) : (
          <>
            <RingTimer
              fraction={ringFraction(timeline, nowSeconds)}
              {...(dayState === "running"
                ? {
                    seconds: remainingSeconds ?? 0,
                    label: "Noch",
                    sub: `bis ${hero.end}`,
                    ariaLabel: "Verbleibende Zeit",
                  }
                : {
                    seconds: untilNextSeconds ?? 0,
                    label: "Beginnt in",
                    sub: `um ${hero.start}`,
                    ariaLabel: "Zeit bis zum Beginn",
                  })}
            />
            <FollowingCard timeline={timeline} />
          </>
        )}
      </div>
    </section>
  );
}

function FollowingCard({ timeline }: { timeline: TimelineState }) {
  if (timeline.dayState === "running") {
    const { next, untilNextSeconds } = timeline;
    if (next === null || untilNextSeconds === null) return null;
    return <NextCard item={next} label="Als Nächstes" when={formatIn(untilNextSeconds)} />;
  }
  const after = upcomingAfterNext(timeline);
  if (after === null) return null;
  return <NextCard item={after} label="Danach" when={`um ${after.start}`} />;
}
