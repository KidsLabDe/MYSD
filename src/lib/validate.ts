/**
 * Checks a Hackday plan (the shape of `src/data/hackday.json`) and returns
 * German, human-readable problems — empty when the plan is fine. Used by the
 * data test, so `npm test` guards every edit, including the new-hackday skill.
 *
 * Limits reflect what fits the 1920×1080 board (measured in the browser).
 */

import { AGENDA_KINDS } from "../types";

export const DAY_COUNT = 3;
/** Day 1 of St. Ursula (10 items) is the most that was measured to fit. */
export const MAX_ITEMS_PER_DAY = 10;
/** Longest hero title that still wraps to two lines at 76px. */
export const MAX_TITLE_CHARS = 36;
/** Longest single word that fits on one hero line at 76px ("Abschlusspräsentation"). */
export const MAX_WORD_CHARS = 21;

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);
const isText = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;

function validDate(raw: string): boolean {
  const m = DATE_RE.exec(raw);
  if (m === null) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]) - 1, Number(m[3])];
  const probe = new Date(y, mo, d);
  return probe.getFullYear() === y && probe.getMonth() === mo && probe.getDate() === d;
}

const minutes = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

function checkTitle(title: string, where: string): string[] {
  const errors: string[] = [];
  if (title.length > MAX_TITLE_CHARS) {
    errors.push(`${where}: Titel ist zu lang (max. ${MAX_TITLE_CHARS} Zeichen) – Details in "note" auslagern.`);
  }
  const longWord = title.split(/\s+/).find((w) => w.length > MAX_WORD_CHARS);
  if (longWord !== undefined) {
    errors.push(`${where}: Das Wort "${longWord}" ist zu lang für eine Zeile (max. ${MAX_WORD_CHARS} Zeichen).`);
  }
  return errors;
}

interface Timed {
  readonly title: string;
  readonly start: number;
  readonly end: number;
  readonly startText: string;
  readonly endText: string;
}

/** Checks one item; returns its problems and, if its times are valid, its span. */
function checkItem(raw: unknown, day: string, seenIds: Set<string>): { errors: string[]; timed: Timed | null } {
  if (!isObj(raw)) return { errors: [`${day}: Ein Programmpunkt ist kein Objekt.`], timed: null };
  const title = isText(raw.title) ? raw.title : "(ohne Titel)";
  const where = `${day}, "${title}"`;
  const errors: string[] = [];

  if (!isText(raw.title)) errors.push(`${day}: Ein Programmpunkt hat keinen Titel.`);
  else errors.push(...checkTitle(raw.title, where));

  if (!isText(raw.id)) errors.push(`${where}: "id" fehlt.`);
  else if (seenIds.has(raw.id)) errors.push(`${where}: ID "${raw.id}" kommt mehrfach vor.`);
  else seenIds.add(raw.id);

  if (typeof raw.kind !== "string" || !(AGENDA_KINDS as readonly string[]).includes(raw.kind)) {
    errors.push(`${where}: Unbekannte Art "${String(raw.kind)}" (erlaubt: ${AGENDA_KINDS.join(", ")}).`);
  }
  for (const key of ["location", "note"] as const) {
    if (raw[key] !== undefined && !isText(raw[key])) errors.push(`${where}: "${key}" ist leer.`);
  }

  const start = typeof raw.start === "string" ? raw.start : "";
  const end = typeof raw.end === "string" ? raw.end : "";
  if (!TIME_RE.test(start)) errors.push(`${where}: Ungültige Startzeit "${start}" (erwartet HH:MM).`);
  if (!TIME_RE.test(end)) errors.push(`${where}: Ungültige Endzeit "${end}" (erwartet HH:MM).`);
  if (!TIME_RE.test(start) || !TIME_RE.test(end)) return { errors, timed: null };

  if (minutes(end) <= minutes(start)) {
    errors.push(`${where}: Ende ${end} liegt nicht nach Beginn ${start}.`);
    return { errors, timed: null };
  }
  return {
    errors,
    timed: { title, start: minutes(start), end: minutes(end), startText: start, endText: end },
  };
}

function checkOverlaps(timed: readonly Timed[], day: string): string[] {
  const sorted = [...timed].sort((a, b) => a.start - b.start);
  return sorted.slice(1).flatMap((cur, i) => {
    const prev = sorted[i];
    return prev !== undefined && cur.start < prev.end
      ? [`${day}: "${cur.title}" beginnt um ${cur.startText}, bevor "${prev.title}" um ${prev.endText} endet.`]
      : [];
  });
}

function checkDay(raw: unknown, index: number, prevDate: string | null, seenIds: Set<string>): string[] {
  const day = `Tag ${index + 1}`;
  if (!isObj(raw)) return [`${day} ist kein Objekt.`];
  const errors: string[] = [];

  const date = typeof raw.date === "string" ? raw.date : "";
  if (!validDate(date)) errors.push(`${day}: Ungültiges Datum "${date}" (erwartet JJJJ-MM-TT).`);
  else if (prevDate !== null && validDate(prevDate) && date <= prevDate) {
    errors.push(`${day}: Datum ${date} muss nach dem Datum von Tag ${index} liegen.`);
  }

  if (!Array.isArray(raw.schedule) || raw.schedule.length === 0) {
    return [...errors, `${day}: "schedule" fehlt oder ist leer.`];
  }
  if (raw.schedule.length > MAX_ITEMS_PER_DAY) {
    errors.push(
      `${day}: Höchstens ${MAX_ITEMS_PER_DAY} Programmpunkte passen auf das Board (gefunden: ${raw.schedule.length}).`,
    );
  }

  const checked = raw.schedule.map((item) => checkItem(item, day, seenIds));
  const timed = checked.flatMap((c) => (c.timed === null ? [] : [c.timed]));
  return [...errors, ...checked.flatMap((c) => c.errors), ...checkOverlaps(timed, day)];
}

/** All problems with `data`, in reading order; `[]` means the plan is valid. */
export function validateHackday(data: unknown): string[] {
  if (!isObj(data)) return ["Die Datei muss ein JSON-Objekt sein."];
  const errors: string[] = [];

  if (!isText(data.title)) errors.push('"title" fehlt oder ist leer.');

  if (data.messages !== undefined) {
    if (!Array.isArray(data.messages)) errors.push('"messages" muss eine Liste sein.');
    else
      data.messages.forEach((m, i) => {
        if (!isText(m)) errors.push(`Hinweis ${i + 1} im Ticker ist leer.`);
      });
  }

  if (!Array.isArray(data.days)) return [...errors, '"days" fehlt oder ist keine Liste.'];
  if (data.days.length !== DAY_COUNT) {
    return [...errors, `Es müssen genau ${DAY_COUNT} Tage sein (gefunden: ${data.days.length}).`];
  }

  const seenIds = new Set<string>();
  const days: unknown[] = data.days;
  return [
    ...errors,
    ...days.flatMap((day, i) => {
      const prev = i > 0 && isObj(days[i - 1]) ? (days[i - 1] as Obj).date : null;
      return checkDay(day, i, typeof prev === "string" ? prev : null, seenIds);
    }),
  ];
}
