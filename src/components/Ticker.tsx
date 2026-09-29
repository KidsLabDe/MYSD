import type { CSSProperties } from "react";
import type { TickerItem } from "../lib/ticker";
import { tickerLoop } from "../lib/ticker";
import { MegaphoneIcon } from "./icons";

function Round({ items }: { items: readonly TickerItem[] }) {
  return (
    <>
      {items.map((item, i) => (
        <span key={i} className={`ticker__item${item.repeat ? " ticker__item--repeat" : ""}`}>
          {item.text}
        </span>
      ))}
    </>
  );
}

/**
 * Live ticker: important notes scrolling along the bottom of the board. The
 * marquee is decorative; screen readers get the plain list of messages.
 */
export function Ticker({ messages }: { messages: readonly string[] }) {
  const { items, durationSeconds } = tickerLoop(messages);
  if (items.length === 0) return null;

  return (
    <aside className="ticker" aria-label="Hinweise">
      <span className="ticker__label" aria-hidden="true">
        <MegaphoneIcon size={22} />
        Hinweis
      </span>

      <ul className="sr-only">
        {items
          .filter((i) => !i.repeat)
          .map((i, n) => (
            <li key={n}>{i.text}</li>
          ))}
      </ul>

      <div className="ticker__viewport" aria-hidden="true">
        {/* Two identical halves; sliding by −50% loops seamlessly. */}
        <div
          className="ticker__track"
          style={{ "--ticker-duration": `${durationSeconds}s` } as CSSProperties}
        >
          <span className="ticker__half">
            <Round items={items} />
          </span>
          <span className="ticker__half ticker__half--copy">
            <Round items={items} />
          </span>
        </div>
      </div>
    </aside>
  );
}
