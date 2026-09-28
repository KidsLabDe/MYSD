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

## Editing the data

All content lives in **[`src/data/groups.json`](src/data/groups.json)**. Add or edit entries there —
no code changes needed. Each group looks like:

```json
{
  "id": "g-001",
  "name": "Team Grünpause",
  "school": "Albert-Einstein-Gymnasium",
  "city": "Berlin",
  "hackday": "Hackday Berlin 2026",
  "memberCount": 5,
  "mentor": "Lena Fischer",
  "project": {
    "title": "SmartBeet",
    "description": "…",
    "category": "Umwelt",
    "tech": ["Arduino", "Sensorik", "3D-Druck"],
    "status": "building"
  }
}
```

`status` is one of `idea` · `building` · `testing` · `done`. The shape is enforced by the types in
[`src/types.ts`](src/types.ts), so an invalid entry fails the type-check.

## Theming

The entire color system is driven by a **single `--brand-hue` variable** in
[`src/index.css`](src/index.css) (currently `204`). Change that one value to re-tint the whole
dashboard. Semantic tokens (`--bg`, `--surface`, `--text`, tone colors…) are defined for the light
theme on `:root` and overridden under `:root[data-theme="dark"]`. Components reference these
variables and `tone-*` classes rather than hard-coded colors.

## Project structure

```
src/
  data/groups.json      # ← edit your groups & projects here
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
