# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A **live agenda board** for Make Your School (MYS) Hackdays, shown on the classroom whiteboard:
the running item with a countdown, the day's timeline, what's next, and a ticker of notes. There is
**no backend**: the plan is the static JSON file `src/data/hackday.json`, and the only runtime
state is the clock plus in-memory presenter steps. Styled in [KidsLab](https://kidslab.de)
branding. Deployed to GitHub Pages (https://kidslabde.github.io/MYSD/) by
`.github/workflows/deploy.yml` on every push to `main`.

## Commands

```bash
npm run dev              # dev server with HMR → http://localhost:5173
npm run build            # tsc -b (type-check) then vite build → dist/
npm run preview          # serve the production build → http://localhost:4173
npm test                 # run all tests once (vitest run)
npm run test:watch       # vitest in watch mode
npm run test:coverage    # coverage report
npx vitest run src/lib/schedule.test.ts                    # run a single test file
npx vitest run -t "should report a gap between two items"  # run tests matching a name
```

Requires **Node 24** (≥ 24.15, `engines` in `package.json`, `.nvmrc`); vitest 5 and jsdom 30 refuse
older versions. CI reads the same `.nvmrc`. The toolchain is Vite 8 (rolldown bundler), Vitest 5
with jsdom and `@vitest/coverage-v8`.

`npm run build` is also the type-check gate — there is no separate lint step; TypeScript runs in
`strict` mode with `noUnusedLocals`, `noUnusedParameters`, and `noUncheckedIndexedAccess`.

## Architecture

Data flows one direction: **`hackday.json` + clock → pure functions → React → UI**.

- **`src/data/hackday.json`** is the single source of content: `title`, `boardTitle` (the name in the
  header, e.g. "MYS Hackday"), exactly 3 `days` (each a `date` and a `schedule` of `AgendaItem`s),
  and optional ticker `messages`. Its shape is in
  **`src/types.ts`** (`HackdayData`, `HackdayDay`, `AgendaItem`, `AgendaKind`). Organizers change it
  through the **new-hackday skill** (`.agents/skills/new-hackday/SKILL.md`, symlinked from
  `.claude/skills/`), not by hand. The skill archives replaced plans in `src/data/history/` (created on first use).
- **`src/lib/validate.ts`** holds the plan rules (3 days, ≤10 items/day, board title ≤30 chars, item title ≤36 chars, no word
  >21 chars, no overlaps). They are measured against what fits the board. `src/data/hackday.test.ts`
  runs them, so `npm test` guards every data edit.
- **`src/lib/`** holds all logic as **pure, clock-free functions** ("now" is always passed in), with
  `*.test.ts` next to their source:
  - `schedule.ts`: `buildTimeline` (current/next/remaining, day state `before|running|gap|after`),
    countdown formatting, ring fraction, urgency.
  - `days.ts`: which day to show (`selectDay`), seconds on that day's clock, "tomorrow at …".
  - `presenter.ts`: clicker steps (`→`/`PageDown` next, `←`/`PageUp` back) as `Adjustment`s that
    move only the switch between two items, in memory only. They never touch `hackday.json`.
  - `cursor.ts`: the pixel-art mouse that "clicks" the next item as it starts (timing, bitmap, path).
  - `uiChoice.ts`: which board UI (`modern` | `pixel`) to show. The choice is stored for one
    event only (`eventKey` = first/last day) and resets after its last day or when the plan is
    for another event. `?ui=modern|pixel` forces a UI without storing it. `UiSwitch` (an icon
    button next to the theme toggle, in both UIs) flips between them and stores the new choice.
  - `ticker.ts`, `debugTime.ts` (`?date=&time=` test clock), `board.ts` (1920×1080 stage scale),
    `clock.ts`, `brand.ts` (brand constants, German `KIND_LABELS`, `KIND_TONE`).
- **`src/App.tsx`** owns the clock, debug offset and theme, and renders one of three screens: the
  `UiPicker` (first visit / choice expired), `ModernBoard` or `PixelBoard`.
- **Two UIs, one data logic:** `useBoardModel` (presenter adjustments per day, timeline, day
  selection, pixel-mouse click) returns a `BoardModel` that both UIs render. It is recomputed
  every second from the plan, the adjustments and now. UIs never compute schedule state themselves.
- **`src/hooks/`**: `useClock` (ticks on the full second, the single time source), `useTheme`,
  `useBoardScale`, `useBoardModel`, `useUiChoice` (persists the choice to `localStorage` key
  `mys-ui`), `usePresenterKeys`, `useUpcomingClick`.
- **`src/components/`** are presentational and controlled by props. `modern/ModernBoard.tsx`
  composes the Modern UI from the shared components (`Header`, `NowPanel`, `Timeline`, `Ticker`,
  `PixelCursor`, `Confetti`, …; `icons.tsx` is a small inline-SVG set). `UiPicker` has `picker.css`.
- **Pixel UI** (`src/components/pixel/`, ported from the lo-fi board on branch `lofi-dashboard`):
  a pixel-art room (CRT monitor with countdown, wall calendar a character ticks off, window with
  blinds and live weather, 3D printer, idle animations, easter egg "Bug-Jagd" via G·A·M·E).
  `PixelBoard.tsx` mounts `scene/engine.ts` (`PixelScene`, imperative DOM/SVG, its own rAF loop)
  and feeds it each tick from the `BoardModel`: `lib/pixelPhase.ts` maps the timeline to the
  scene's phase state (row, monitor state, blinds per kind). The scene never computes the plan;
  it only animates towards it. Clicker steps stay with `usePresenterKeys`; the scene's own keys
  (J, W, D, K, H, L, F, ?) are listed in its help overlay (`?`). While the game is open, the scene
  captures all keys so arrows don't step the plan. Sprites in `scene/generated/` come verbatim
  from the design files on the `lofi-dashboard` branch. Weather location and poster variant live
  in **`src/data/ort.json`** (update it for a new school); weather comes from Open-Meteo.

**Board mode:** at ≥1280×720 the CSS renders a fixed 1920×1080 stage scaled by `--board-scale`, so the
4K whiteboard shows exactly the design. Smaller screens get a responsive layout.

## Theming (the important convention)

The entire color system is driven by **one CSS variable, `--brand-hue`** (currently `204`), in
`src/index.css`. Change that single value to re-tint the whole app. Semantic tokens (`--bg`,
`--surface`, `--text`, tone colors…) are defined for light theme on `:root` and overridden under
`:root[data-theme="dark"]`. `useTheme.ts` stamps `data-theme` on `<html>` and persists the choice to
`localStorage`. Never hard-code colors in components; use the CSS variables and `tone-*` classes.

Fonts (Pixelify Sans display, Inter body) load from Google Fonts in `index.html`; `--font-display`
is used for headings/logo, `--font-body` for everything else.

## Build gotchas (don't "fix" these)

`tsconfig.node.json` deliberately sets `outDir` and `tsBuildInfoFile` under `node_modules/.tmp/`.
With TypeScript 5.5, `tsc -b` emits from the referenced config; without that redirect it would drop
`vite.config.js`, `vite.config.d.ts`, and `*.tsbuildinfo` into the repo root. Leave the redirect in
place (and the matching `.gitignore` entries) so builds stay clean.

`vite.config.ts` has no `base`. The Pages workflow passes `--base=/<repo>/` on the CLI, so local dev
stays at `/` and no `@types/node` is needed for `process.env`.

## Conventions

Text is **German** (labels, seed content, UI copy). The board is public in the classroom, so no
internal or team-only notes go into the plan. Follow the user's global rules in `~/.claude/rules/`,
notably TDD (add or extend tests in `src/lib/*.test.ts` for logic changes) and immutable updates
(spread into new objects; never mutate the plan, adjustments or state in place).
