/**
 * Debug clock via URL params, e.g. `?date=2026-09-29&time=14:50` (either one
 * may be omitted). Yields an offset from the real clock, so the board keeps
 * ticking from the chosen moment.
 */

export type DebugTime = { readonly offsetMs: number } | { readonly error: string };

type Triple = readonly [number, number, number];

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;

function parseDate(raw: string): Triple | null {
  const m = DATE_RE.exec(raw);
  if (m === null) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]) - 1, Number(m[3])];
  const probe = new Date(y, mo, d);
  // Rejects rollovers such as 2026-02-30 → 2 March.
  const valid = probe.getFullYear() === y && probe.getMonth() === mo && probe.getDate() === d;
  return valid ? [y, mo, d] : null;
}

function parseClock(raw: string): Triple | null {
  const m = TIME_RE.exec(raw);
  if (m === null) return null;
  const [h, mi, s] = [Number(m[1]), Number(m[2]), Number(m[3] ?? 0)];
  return h <= 23 && mi <= 59 && s <= 59 ? [h, mi, s] : null;
}

/** `null` without debug params; an offset when valid; an error message otherwise. */
export function parseDebugTime(search: string, real: Date): DebugTime | null {
  const params = new URLSearchParams(search);
  const rawDate = params.get("date");
  const rawTime = params.get("time");
  if (rawDate === null && rawTime === null) return null;

  const date: Triple | null =
    rawDate === null ? [real.getFullYear(), real.getMonth(), real.getDate()] : parseDate(rawDate);
  if (date === null) return { error: `Ungültiges Datum "${rawDate}" (erwartet JJJJ-MM-TT)` };

  const clock: Triple | null =
    rawTime === null ? [real.getHours(), real.getMinutes(), real.getSeconds()] : parseClock(rawTime);
  if (clock === null) return { error: `Ungültige Uhrzeit "${rawTime}" (erwartet H:MM, HH:MM oder HH:MM:SS)` };

  const [y, mo, d] = date;
  const [h, mi, s] = clock;
  const target = new Date(y, mo, d, h, mi, s, real.getMilliseconds());
  return { offsetMs: target.getTime() - real.getTime() };
}
