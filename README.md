# MYS Dashboard

A read-only overview dashboard for **Make Your School (MYS)** Hackdays — see all
student **groups** and their **projects** at a glance, filter by Hackday, school,
theme or status, and drill into any team's details.

Styled in the **[KidsLab](https://kidslab.de)** branding: vivid blue
(`hsl(204 100% 50%)`), *Pixelify Sans* display type, *Inter* body text, rounded
corners, and a light/dark theme toggle.

## Stack

- **Vite + React 18 + TypeScript** (strict)
- **Vitest + Testing Library** for tests
- No backend — data comes from a static JSON file

## Getting started

```bash
npm install
npm run dev        # start the dev server (http://localhost:5173)
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
npm test           # run the unit/component tests
```

## Editing the data

All content lives in **[`src/data/groups.json`](src/data/groups.json)**. Add or
edit entries there — no code changes needed. Each group looks like:

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

`status` is one of `idea` · `building` · `testing` · `done`. The shape is
enforced by the types in [`src/types.ts`](src/types.ts).

## Project layout

```
src/
  data/groups.json      # ← edit your groups & projects here
  types.ts              # domain model
  lib/                  # pure logic (brand, filtering, stats) + tests
  hooks/useTheme.ts     # light/dark theme with persistence
  components/           # UI components
  App.tsx               # composition + state
  index.css             # design system (brand tokens, light/dark)
```

## Branding

The color scale is driven by a single `--brand-hue` in `index.css`. Change that
one value to re-tint the whole dashboard.
