# MYS Dashboard

A live **agenda board** for **[Make Your School](https://www.makeyourschool.de) (MYS)** Hackdays,
shown on the classroom whiteboard: what's running right now, how long it has left, what comes
next, and a ticker with important notes. **Live:** https://kidslabde.github.io/MYSD/

Styled in the **[KidsLab](https://kidslab.de)** branding: vivid blue (`hsl(204 100% 50%)`),
*Pixelify Sans* display type, *Inter* body text, rounded corners, and a light/dark theme toggle.
UI copy is in German.

## Features

- **Now panel**: the running item with a ring countdown, plus what's next. Gaps, "before the
  day starts" and "tomorrow we continue at …" are handled, and confetti marks the end of the day.
- **Timeline**: the whole day's plan with past, current and upcoming items, colored by kind
  (work phase, meal, break, talk).
- **Multi-day Hackdays**: the board picks today's day from the plan (`Tag 2 von 3`).
- **Live ticker**: a marquee of notes at the bottom, at a constant reading speed.
- **Pixel mouse**: a pixel-art cursor flies over and "clicks" the next item the second it starts.
- **Presenter clicker**: `→`/`PageDown` start the next item now, `←`/`PageUp` go back. Only the
  switch between two items moves, and only in memory. A reload returns to the plan.
- **Whiteboard mode**: on screens of at least 1280×720, a fixed 1920×1080 stage scales to fit
  (e.g. a 4K board). Smaller screens get a responsive layout.
- **Test clock**: `?date=YYYY-MM-DD&time=HH:MM` previews any moment.
- **Light / dark theme**: remembers your choice and respects your OS preference.
- **Fully static**: no backend, no database. The plan is one JSON file.

## Tech stack

- **Vite + React 18 + TypeScript** (strict mode)
- **Vitest + Testing Library** for unit and component tests
- Plain CSS design system driven by CSS custom properties — no UI framework

## Getting started

Needs **Node.js 24** (≥ 24.15, pinned in [`.nvmrc`](.nvmrc)); vitest and jsdom don't run on older
versions. With [nvm](https://github.com/nvm-sh/nvm):

```bash
nvm install        # once; reads .nvmrc
nvm use            # in each new terminal, unless 24 is your nvm default
npm install
npm run dev        # dev server with hot reload → http://localhost:5173
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with HMR (http://localhost:5173) |
| `npm run build` | Type-check (`tsc -b`) **and** production build into `dist/` |
| `npm run preview` | Serve the production build (http://localhost:4173) |
| `npm test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with a coverage report |

Run a single test file or test by name:

```bash
npx vitest run src/lib/schedule.test.ts
npx vitest run -t "should report a gap between two items"
```

There is no separate lint step — `npm run build` is the type-check gate.

## Hackday-Plan pflegen (für Organisator:innen)

Der Plan auf dem Board steht in [`src/data/hackday.json`](src/data/hackday.json). Du musst die
Datei nicht selbst bearbeiten: Ein KI-Assistent führt dich im Gespräch durch alles – auf dem
Notebook, das das Board anzeigt.

### Starten

Voraussetzung: [Claude Code](https://claude.com/claude-code) oder
[Codex](https://developers.openai.com/codex) ist auf dem Notebook installiert und angemeldet.

1. Terminal öffnen und in den Projektordner wechseln, z. B. `cd ~/MYSDashboard`.
2. Assistenten starten und den Assistenten „new-hackday“ aufrufen:

   | Claude Code | Codex |
   |---|---|
   | `claude`, dann `/new-hackday` | `codex`, dann `$new-hackday` |

   Du kannst auch einfach schreiben, was du möchtest – der Assistent erkennt es selbst:

   - „Neuer Hackday“
   - „Mittagspause heute 12–13, danach Arbeitsphase bis 15 Uhr“
   - „Zwischenpräsentation morgen von 15 bis 15:15“
   - „Neuer Hinweis im Ticker: Präsentation in Raum 204!“

### Neuen Hackday anlegen

Der Assistent fragt Schritt für Schritt:

1. **Schule und erster Tag** – Tag 2 und 3 schlägt er selbst vor.
2. **Vorlage** – standardmäßig der letzte Plan. Alternativ kannst du einen neuen Plan einfügen
   (z. B. Zellen aus Excel kopieren oder eine CSV-Datei nennen).
3. **Tag für Tag** – er zeigt jeden Tag als Tabelle und fragt „Passt das, oder was ändert
   sich?“. Antworte ganz normal, z. B. „Mittag erst um 12:30“.
4. **Hinweise im Ticker** – behalten, ändern oder neue dazu.
5. **Zusammenfassung** – erst nach deinem „Ja“ wird der Plan übernommen.

Danach legt er den alten Plan im Archiv `src/data/history/` ab, speichert
den neuen, prüft ihn, startet das Board (falls es nicht läuft) und speichert die Änderung mit
einem Git-Commit.

### Plan ändern

Sag einfach, was sich ändert. Der Assistent passt nur diesen Punkt an (und die Nachbarzeiten,
damit keine Lücken entstehen), zeigt dir den Tag zur Kontrolle, prüft und committet.

Geht es nur spontan früher oder später weiter, reicht ein Presenter: `→` bzw. `PageDown` startet
den nächsten Punkt sofort, `←` bzw. `PageUp` springt zurück. Das gilt nur bis zum Neuladen der Seite,
der Plan selbst bleibt unverändert.

### Vorschau: einen anderen Tag oder eine andere Uhrzeit ansehen

Hänge Datum und/oder Uhrzeit an die Adresse des Boards an:

```
http://localhost:5173/?date=2026-10-05&time=09:00
```

Oben rechts erscheint dann „Testzeit“. Ohne die Angaben zeigt das Board wieder die echte Zeit.

### Was das Board verträgt

Der Assistent achtet darauf, und `npm test` prüft es bei jeder Änderung:

- **genau 3 Tage** pro Hackday
- **höchstens 10 Programmpunkte pro Tag**
- **Titel höchstens 36 Zeichen**, kein Wort länger als 21 Zeichen – Details kommen in den Hinweis
  des Programmpunkts
- keine Überschneidungen; jeder Punkt endet nach seinem Beginn
- das Board ist im Klassenraum öffentlich: interne Notizen und Punkte nur fürs Team
  (z. B. Feedbackrunde der Mentor:innen) gehören nicht hinein

### Für Entwickler:innen

Der Assistent ist ein Skill nach dem offenen [Agent-Skills](https://agentskills.io)-Format:
[`.agents/skills/new-hackday/SKILL.md`](.agents/skills/new-hackday/SKILL.md) (dort sucht Codex),
`.claude/skills/new-hackday` ist ein Symlink darauf (für Claude Code) – es gibt also nur eine
Anleitung. Die Prüfregeln stehen in [`src/lib/validate.ts`](src/lib/validate.ts). Die Datei von Hand
zu bearbeiten geht natürlich auch; danach `npm test` ausführen.

## Theming

The entire color system is driven by a **single `--brand-hue` variable** in
[`src/index.css`](src/index.css) (currently `204`). Change that one value to re-tint the whole
dashboard. Semantic tokens (`--bg`, `--surface`, `--text`, tone colors…) are defined for the light
theme on `:root` and overridden under `:root[data-theme="dark"]`. Components reference these
variables and `tone-*` classes rather than hard-coded colors.

## Project structure

```
.agents/skills/new-hackday/  # AI wizard for creating/changing the plan (see above)
src/
  data/hackday.json     # ← the live Hackday plan (3 days + ticker messages)
  data/history/         # archived past plans (created by the skill on first use)
  types.ts              # domain model (HackdayData, HackdayDay, AgendaItem)
  lib/                  # pure logic + colocated tests:
                        #   schedule (now/next/remaining), days (multi-day), presenter,
                        #   cursor (pixel mouse), ticker, validate (plan rules),
                        #   debugTime, board (stage scale), clock, brand
  hooks/                # clock, theme, board scale, presenter keys, pixel-mouse click
  components/           # Header, NowPanel, Timeline, Ticker, PixelCursor, Confetti, …
  App.tsx               # state + composition
  index.css             # design system (brand tokens, light/dark)
```

Data flows one direction: **`hackday.json` + clock → pure functions in `lib/` → React → UI**. Business logic is
kept out of components so it can be unit-tested directly.

## Deployment

Every push to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). It
runs the tests, builds with the repo name as base path, and publishes to GitHub Pages at
https://kidslabde.github.io/MYSD/. Nothing is published if a test fails. This needs
**Settings → Pages → Source: GitHub Actions** (one-time setup).

`npm run build` outputs a static site to `dist/` that any static host can serve. For hosting
under a subpath, pass it through: `npm run build -- --base=/sub/path/`.
