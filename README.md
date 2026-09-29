# MYS Dashboard

A read-only overview dashboard for **[Make Your School](https://www.makeyourschool.de) (MYS)**
Hackdays — see every student **group** and their **project** at a glance, filter by Hackday,
school, theme or status, and drill into any team's details.

Styled in the **[KidsLab](https://kidslab.de)** branding: vivid blue (`hsl(204 100% 50%)`),
*Pixelify Sans* display type, *Inter* body text, rounded corners, and a light/dark theme toggle.
UI copy is in German.

## Features

- **Live stat tiles** — groups, students, schools and Hackdays, recomputed as you filter.
- **Status distribution bar** — how many projects are *Idee · In Arbeit · Testphase · Fertig*.
- **Search + facet filters** — full-text search (group, project, tech, mentor…) plus dropdowns for
  Hackday, school, theme and status, with a one-click reset.
- **Detail drawer** — click any card for the full project description, tech tags and group info
  (close with `Esc` or click-away).
- **Light / dark theme** — remembers your choice and respects your OS preference.
- **Fully static** — no backend, no database; deploy the `dist/` folder anywhere.

## Tech stack

- **Vite + React 18 + TypeScript** (strict mode)
- **Vitest + Testing Library** for unit and component tests
- Plain CSS design system driven by CSS custom properties — no UI framework

## Getting started

```bash
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
npx vitest run src/lib/filter.test.ts
npx vitest run -t "should filter by hackday"
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
  data/history/         # archived plans of past Hackdays
  types.ts              # domain model (Group, Project, ProjectStatus)
  lib/                  # pure logic (brand, filtering, stats) + colocated tests
  hooks/useTheme.ts     # light/dark theme with persistence
  components/           # presentational UI components
  App.tsx               # state + composition
  index.css             # design system (brand tokens, light/dark)
```

Data flows one direction: **JSON seed → pure functions in `lib/` → React → UI**. Business logic is
kept out of components so it can be unit-tested directly.

## Deployment

`npm run build` outputs a static site to `dist/`. Serve it from any static host (Netlify, Vercel,
GitHub Pages, S3, nginx…) — no server-side runtime required.
