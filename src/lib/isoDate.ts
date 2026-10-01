const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Local midnight of a `YYYY-MM-DD` string, or null if malformed or not a real calendar day. */
export function parseIsoDate(raw: string): Date | null {
  const m = ISO_DATE_RE.exec(raw);
  if (m === null) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]) - 1, Number(m[3])];
  const date = new Date(y, mo, d);
  // Rejects rollovers such as 2026-02-30 → 2 March.
  const real = date.getFullYear() === y && date.getMonth() === mo && date.getDate() === d;
  return real ? date : null;
}
