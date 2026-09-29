/**
 * Live-ticker loop: repeats the messages until one round is wider than the
 * bar (so the marquee never shows a gap) and derives a duration that keeps
 * the reading speed constant however many messages there are.
 */

/** One round must span at least this many characters (≈ the bar's width). */
export const TICKER_MIN_CHARS = 160;

/** Reading speed of the marquee. */
export const TICKER_CHARS_PER_SECOND = 7;

/** Extra "characters" per item for the separator between messages. */
export const TICKER_SEPARATOR_CHARS = 6;

export interface TickerItem {
  readonly text: string;
  /** True for fill-up repeats (hidden when motion is reduced). */
  readonly repeat: boolean;
}

export interface TickerLoop {
  readonly items: readonly TickerItem[];
  readonly durationSeconds: number;
}

export function tickerLoop(messages: readonly string[]): TickerLoop {
  const texts = messages.map((m) => m.trim()).filter((m) => m.length > 0);
  if (texts.length === 0) return { items: [], durationSeconds: 0 };

  const roundChars = texts.reduce((sum, t) => sum + t.length + TICKER_SEPARATOR_CHARS, 0);
  const rounds = Math.max(1, Math.ceil(TICKER_MIN_CHARS / roundChars));
  const items = Array.from({ length: rounds }, (_, round) =>
    texts.map((text) => ({ text, repeat: round > 0 })),
  ).flat();

  return { items, durationSeconds: (rounds * roundChars) / TICKER_CHARS_PER_SECOND };
}
