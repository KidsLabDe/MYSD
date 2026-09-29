---
name: new-hackday
description: Guided German wizard to create the plan for the next Make Your School Hackday, or to change the current plan (times, items, ticker messages, the board title in the header) of the agenda board in this repo (src/data/hackday.json). Archives the old plan, validates, makes sure the board's dev server runs, and commits. Use when an organizer wants to set up a new Hackday or says something like "Mittagspause heute 12–13" or "neuer Hinweis im Ticker". Not for code changes to the dashboard itself.
allowed-tools: Read Edit Write Bash(npm test) Bash(npx vitest run *) Bash(sh .agents/skills/new-hackday/scripts/*) Bash(git status *) Bash(git add *) Bash(git commit *) Bash(git diff *)
---

# Hackday-Plan erstellen oder ändern

You help an **event organizer** (not a developer) maintain the plan shown on
the classroom board. This machine *is* the board, so you edit the live file
directly. Talk to the organizer in **German**, informally ("du"/"ihr"), in
short messages. Never show them JSON unless they ask; show tables instead.

## Two modes – find out which one first

- **Neuer Hackday** – the next event (new school and/or dates). Archive the
  current plan, then build the new one **using the current plan as the
  template**.
- **Plan ändern** – adjust the current plan ("Mittagspause heute 12–13",
  "neuer Hinweis im Ticker"). No archiving; change only what was asked.

If the request is clear, don't ask; otherwise ask: "Neuen Hackday anlegen
oder den aktuellen Plan ändern?"

## The data file: `src/data/hackday.json`

```json
{
  "title": "Make Your School · St. Ursula",
  "boardTitle": "MYS Hackday",
  "messages": ["Denkt daran, Bilder und Videos von euren Hacks zu machen!"],
  "days": [
    {
      "date": "2026-09-28",
      "schedule": [
        { "id": "d1-01", "start": "08:00", "end": "08:10", "title": "Begrüßung & Einführung", "kind": "talk", "note": "Mit Daniel." }
      ]
    }
  ]
}
```

- `title`: always `Make Your School · <Schulname>`.
- `boardTitle`: the name next to the logo in the board's header (and in the
  browser tab), at most 30 characters. Default `MYS Hackday`; change it only
  when the organizer asks for a different name.
- `messages`: short notes for the scrolling ticker at the bottom. Empty list hides it.
- `days`: **exactly 3 days**, dates `JJJJ-MM-TT`, strictly increasing
  (usually consecutive, but ask – the organizer decides).
- Each item: `id`, `start`, `end` (`HH:MM`, 24 h), `title`, `kind`, optional
  `location`, optional `note`.
- `kind` – exactly one of:
  - `phase` = Arbeitsphase (work time, idea finding, team finding, building)
  - `meal` = Essen (Mittagspause, Mittagessen, Snack)
  - `break` = Pause (short breaks)
  - `talk` = Programm (Begrüßung, presentations, talks, Vorstellung)
- `id`: `d<Tag>-<Nr>`, e.g. `d2-03`, numbered in time order. Re-number after
  adding or removing items so they stay unique.

### Limits of the board (the check enforces them)

- **At most 10 items per day** – more don't fit on the screen.
- **Title at most 36 characters, no single word longer than 21.** Shorten
  and move details into `note` (e.g. title "Impulsvortrag", note "Mit
  Hinweisen zur Vorbereitung der Präsentation.").
- Items must not overlap; `end` must be after `start`.

### Content rules (learned from real plans)

1. **The board is public in the classroom.** Leave out staff-only items
   (Feedback Mentor:innen & Lehrkräfte, Reflexionsrunde, Abstimmung) and
   internal notes (who organizes lunch, caretaker reminders, open questions
   like "Zertifikatsübergabe hier?"). If unsure whether something is
   internal, ask.
2. Plans often list only start times: **end = start of the next item**.
   The last item of a day ends where the plan says the students' day ends
   ("Ende Tag 1 – Schüler"). Don't turn such "Ende" markers into items.
3. **Never invent content** – no made-up notes, locations or items. Light
   cleanup is fine ("Ideenfindung 1v2" → "Ideenfindung (1/2)"), invention
   is not.
4. **Ask instead of guessing** when something is ambiguous, e.g. a talk
   followed by a 3-hour gap, dates that don't match the weekdays in the
   source, or a time that could mean two things. One question at a time.
5. German copy, typographic apostrophe ("geht’s"), notes as short sentences
   ending with a period.

## Wizard: Neuer Hackday

Go step by step and wait for the answer after each step.

1. **Basics:** "Wie heißt die Schule?" and "Wann ist der erste Tag?"
   Propose the next two days as day 2 and 3 and ask if that's right.
   Keep the current `boardTitle` and don't ask about it unless the organizer
   brings up the name on the board.
2. **Plan source:** "Sollen wir den letzten Plan als Vorlage nehmen?"
   If they have a new plan instead, they can paste it (copied spreadsheet
   rows, text) or give a file path (CSV/text; for Excel ask them to paste
   the cells or export CSV).
3. **Day by day:** for each of the 3 days show the plan as a table:

   | Zeit | Programmpunkt | Art | Hinweis |
   |---|---|---|---|
   | 08:00 – 08:10 | Begrüßung & Einführung | Programm | Mit Daniel. |

   Ask: "Passt Tag 1 so, oder was ändert sich?" Apply their changes in their
   own words ("Mittag 12–13, danach Arbeitsphase bis 15 Uhr") and adjust
   neighbouring items so there are no gaps or overlaps they didn't ask for.
   Show the day again until they say it fits.
4. **Ticker:** show the current messages; ask whether to keep, change or add.
5. **Summary:** all 3 days as tables plus title, board title and messages. Ask
   "Soll ich den Plan so übernehmen?" – continue only after a clear yes.
6. **Archive, then write** (in this order):
   ```sh
   sh .agents/skills/new-hackday/scripts/archive-plan.sh
   ```
   Then write the new `src/data/hackday.json` (2-space indent, UTF-8, keys in
   the order shown above).
7. **Check:** `npx vitest run src/data/hackday.test.ts`. Problems are listed
   in German – fix them (ask the organizer if a fix changes content, e.g. a
   title that must be shortened) and re-run until it passes. Then run
   `npm test` once; everything must pass.
8. **Board:** `sh .agents/skills/new-hackday/scripts/ensure-dev-server.sh`.
   The browser on http://localhost:5173 reloads by itself. Offer a preview of
   any day and time with the debug URL, e.g.
   `http://localhost:5173/?date=2026-10-05&time=09:00` (shows a "Testzeit"
   badge; the normal URL shows the real time).
9. **Commit** (see below) and tell the organizer in one or two sentences
   what is now live.

## Plan ändern

1. Make the change in `src/data/hackday.json` – only what was asked. For a
   time change, adjust the neighbouring item(s) so the day stays gap-free,
   and say what you adjusted.
2. Show the affected day as a table and ask "Passt das?" (skip this for a
   trivial, unambiguous change like a new ticker message).
3. Steps 7–9 above: check, dev server, commit.

## Commit – always, after every creation or change

Only after the check passed:

```sh
git add src/data/hackday.json src/data/history
git commit -m "chore(data): <what changed>"
```

Message examples: `chore(data): new Hackday plan Gymnasium Nord (2026-10-05)`,
`chore(data): Mittagspause Tag 2 auf 12:00–13:00`. Commit on the branch that
is checked out; do **not** push, switch branches or touch other files. If git
has no author configured, ask the organizer for a name and email and set it
for this repo only (`git config user.name …`, `git config user.email …`).
If the commit fails for another reason, tell the organizer in plain words –
the board still shows the new plan either way.
