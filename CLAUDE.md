# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A **read-only overview dashboard** for Make Your School (MYS) Hackdays: it displays student
**groups** and their **projects**, with filters and a detail view. There is **no backend and no
mutation** — all content is a static JSON seed. Styled in [KidsLab](https://kidslab.de) branding.

## Commands

```bash
npm run dev              # dev server with HMR → http://localhost:5173
npm run build            # tsc -b (type-check) then vite build → dist/
npm run preview          # serve the production build → http://localhost:4173
npm test                 # run all tests once (vitest run)
npm run test:watch       # vitest in watch mode
npm run test:coverage    # coverage report
npx vitest run src/lib/filter.test.ts        # run a single test file
npx vitest run -t "should filter by hackday" # run tests matching a name
```

`npm run build` is also the type-check gate — there is no separate lint step; TypeScript runs in
`strict` mode with `noUnusedLocals`, `noUnusedParameters`, and `noUncheckedIndexedAccess`.

## Architecture

Data flows one direction: **JSON seed → pure functions → React → UI**.

- **`src/data/groups.json`** is the single source of content. To add/change groups or projects,
  edit only this file — no code changes needed. Its shape is enforced by **`src/types.ts`**
  (`Group`, `Project`, `ProjectStatus`); `App.tsx` casts the import to `DashboardData`.
- **`src/lib/`** holds all business logic as **pure, side-effect-free functions**, kept out of React
  so they are unit-tested directly (`*.test.ts` sit next to their source):
  - `filter.ts` — `applyFilters` / `matchesFilters` over a `Filters` object (search is AND across
    whitespace-separated terms; facets are exact-match; `null` means "no filter").
  - `stats.ts` — `summarize`, `statusBreakdown`, `uniqueValues` (the stat tiles and facet options).
  - `brand.ts` — brand constants, German status labels, and `toneForCategory` (a stable hash → one
    of five palette tones, so a category always renders the same color).
- **`src/App.tsx`** owns all state (`filters`, `selected` group) and composes components. Derived
  values (`visible`, `summary`, `breakdown`, facet lists) are `useMemo`'d over the raw data + filters.
- **`src/components/`** are presentational and controlled by props; `App` passes state down and
  callbacks up. `icons.tsx` is a small inline-SVG set.

## Theming (the important convention)

The entire color system is driven by **one CSS variable, `--brand-hue`** (currently `204`), in
`src/index.css`. Change that single value to re-tint the whole app. Semantic tokens (`--bg`,
`--surface`, `--text`, tone colors…) are defined for light theme on `:root` and overridden under
`:root[data-theme="dark"]`. `useTheme.ts` stamps `data-theme` on `<html>` and persists the choice to
`localStorage`; never hard-code colors in components — reference the CSS variables / `tone-*` classes.

Fonts (Pixelify Sans display, Inter body) load from Google Fonts in `index.html`; `--font-display`
is used for headings/logo, `--font-body` for everything else.

## Build gotcha — don't "fix" this

`tsconfig.node.json` deliberately sets `outDir` and `tsBuildInfoFile` under `node_modules/.tmp/`.
With TypeScript 5.5, `tsc -b` emits from the referenced config; without that redirect it would drop
`vite.config.js`, `vite.config.d.ts`, and `*.tsbuildinfo` into the repo root. Leave the redirect in
place (and the matching `.gitignore` entries) so builds stay clean.

## Conventions

Text is **German** (labels, seed content, UI copy). Follow the user's global rules in
`~/.claude/rules/` — notably TDD (add/extend tests in `src/lib/*.test.ts` for logic changes) and
immutable updates (spread into new objects; never mutate `filters` or data in place).
