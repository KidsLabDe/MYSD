import { describe, expect, it } from "vitest";
import { MAX_ITEMS_PER_DAY, validateHackday } from "./validate";

const item = (id: string, start: string, end: string, title = "Arbeitsphase") => ({
  id,
  start,
  end,
  title,
  kind: "phase",
});

const valid = () => ({
  title: "Make Your School · Testschule",
  messages: ["Denkt an eure Fotos!"],
  days: [
    { date: "2026-10-05", schedule: [item("d1-01", "08:00", "12:00")] },
    { date: "2026-10-06", schedule: [item("d2-01", "08:00", "12:00")] },
    { date: "2026-10-07", schedule: [item("d3-01", "08:00", "12:00")] },
  ],
});

/** A copy of `valid()` with day `index` replaced. */
const withDay = (index: number, day: object) => {
  const base = valid();
  return { ...base, days: base.days.map((d, i) => (i === index ? day : d)) };
};

describe("validateHackday", () => {
  it("should accept a well-formed plan", () => {
    expect(validateHackday(valid())).toEqual([]);
  });

  it("should require exactly three days", () => {
    const base = valid();
    expect(validateHackday({ ...base, days: base.days.slice(0, 2) })).toEqual([
      "Es müssen genau 3 Tage sein (gefunden: 2).",
    ]);
  });

  it("should require consecutive-order, unique dates", () => {
    const errors = validateHackday(withDay(2, { date: "2026-10-06", schedule: [item("d3-01", "08:00", "12:00")] }));
    expect(errors).toContain("Tag 3: Datum 2026-10-06 muss nach dem Datum von Tag 2 liegen.");
  });

  it("should reject invalid dates and times", () => {
    const errors = validateHackday(
      withDay(0, { date: "2026-02-30", schedule: [item("d1-01", "8 Uhr", "12:00")] }),
    );
    expect(errors).toContain('Tag 1: Ungültiges Datum "2026-02-30" (erwartet JJJJ-MM-TT).');
    expect(errors).toContain('Tag 1, "Arbeitsphase": Ungültige Startzeit "8 Uhr" (erwartet HH:MM).');
  });

  it("should reject an item that ends before it starts", () => {
    const errors = validateHackday(withDay(1, { date: "2026-10-06", schedule: [item("d2-01", "12:45", "12:00", "Mittagspause")] }));
    expect(errors).toEqual(['Tag 2, "Mittagspause": Ende 12:00 liegt nicht nach Beginn 12:45.']);
  });

  it("should reject overlapping items", () => {
    const errors = validateHackday(
      withDay(0, {
        date: "2026-10-05",
        schedule: [item("d1-01", "08:00", "10:00", "Phase A"), item("d1-02", "09:30", "11:00", "Phase B")],
      }),
    );
    expect(errors).toEqual(['Tag 1: "Phase B" beginnt um 09:30, bevor "Phase A" um 10:00 endet.']);
  });

  it("should reject duplicate ids across days", () => {
    const errors = validateHackday(withDay(1, { date: "2026-10-06", schedule: [item("d1-01", "08:00", "12:00")] }));
    expect(errors).toEqual(['Tag 2, "Arbeitsphase": ID "d1-01" kommt mehrfach vor.']);
  });

  it("should reject unknown kinds", () => {
    const errors = validateHackday(
      withDay(0, { date: "2026-10-05", schedule: [{ ...item("d1-01", "08:00", "12:00"), kind: "party" }] }),
    );
    expect(errors).toEqual([
      'Tag 1, "Arbeitsphase": Unbekannte Art "party" (erlaubt: phase, meal, break, talk).',
    ]);
  });

  it("should limit a day to what fits on the board", () => {
    const schedule = Array.from({ length: MAX_ITEMS_PER_DAY + 1 }, (_, i) => {
      const h = String(8 + i).padStart(2, "0");
      return item(`d1-${i}`, `${h}:00`, `${h}:30`);
    });
    expect(validateHackday(withDay(0, { date: "2026-10-05", schedule }))).toEqual([
      `Tag 1: Höchstens ${MAX_ITEMS_PER_DAY} Programmpunkte passen auf das Board (gefunden: ${MAX_ITEMS_PER_DAY + 1}).`,
    ]);
  });

  it("should reject titles too long for the hero", () => {
    const long = "Impulsvortrag & Hinweis Vorbereitung Präsentation";
    const errors = validateHackday(withDay(0, { date: "2026-10-05", schedule: [item("d1-01", "08:00", "12:00", long)] }));
    expect(errors).toEqual([
      `Tag 1, "${long}": Titel ist zu lang (max. 36 Zeichen) – Details in "note" auslagern.`,
    ]);
  });

  it("should reject a title with a word too long for one line", () => {
    const errors = validateHackday(
      withDay(0, { date: "2026-10-05", schedule: [item("d1-01", "08:00", "12:00", "Abschlusspräsentationsprobe")] }),
    );
    expect(errors).toEqual([
      'Tag 1, "Abschlusspräsentationsprobe": Das Wort "Abschlusspräsentationsprobe" ist zu lang für eine Zeile (max. 21 Zeichen).',
    ]);
  });

  it("should reject empty ticker messages", () => {
    expect(validateHackday({ ...valid(), messages: ["ok", "  "] })).toEqual([
      "Hinweis 2 im Ticker ist leer.",
    ]);
  });

  it("should reject a structurally broken file", () => {
    expect(validateHackday(null)).toEqual(["Die Datei muss ein JSON-Objekt sein."]);
    expect(validateHackday({ days: [] })).toContain('"title" fehlt oder ist leer.');
  });
});
