# Handoff for Claude Code: Desktop board redesign ("Whiteboard-Modus")

> **Task:** Build the new desktop layout for the MYS Hackday agenda board so it
> matches the design canvas "MYS Hackday – Agenda-Board" (6 frames, 1920×1080).
> The board runs full-screen on the classroom's digital whiteboard whenever no
> presentation is on. It should be as clean as possible, with calm, meaningful motion.
>
> Scope is **visual and layout only**. Don't change the data model, the JSON
> seed, or the no-backend / no-interaction rule. The light/dark toggle stays
> the only control.

---

## 0. Ground rules (unchanged from the original handoff)

- All UI copy stays **German**.
- Every colour comes from the tokens in `src/index.css`. The brand scale stays driven by
  `--brand-hue` (204). **No hard-coded colours in components.**
- Light **and** dark themes (`data-theme="dark"` on `<html>`).
- `prefers-reduced-motion`: every new animation/transition must switch off.
- Keep the existing semantics: labeled `region`, real `role="progressbar"`,
  `<time>`, `<ol>` + `aria-current` on the running item. Colour is never the only signal.
- WCAG AA contrast in both themes.
- `npm run build` and `npm test` must stay green. Add tests for the new logic (§5).

---

## 1. Layout: what changes

Today it's a single scrolling column (Header → NowPanel → Timeline, max width 1180px).
On wide screens it becomes a **fixed, non-scrolling board**:

```
┌────────────────────────────────────────────────────────────────────────────┐
│ [M] MYS Hackday                                          11:47:30   [☾]   │  header, 64px
│     Make Your School · KidsLab                                             │
├──────────────────────────────────────────────┬─────────────────────────────┤
│ ┌──────────────────────────────────────────┐ │ Tagesplan     3 von 9 erl.  │
│ │ ● JETZT LÄUFT   [🔧 Arbeitsphase]         │ │ 09:00 ▣ Ankommen …  (past)  │
│ │                                          │ │ 09:30 ▣ Ideenfindung (past) │
│ │ Phase 1 · Prototyp                       │ │┌───────────────────────────┐│
│ │ bauen                     (92–112px px)  │ ││10:30 ▣ Phase 1 … [LÄUFT]  ││
│ │ ◷ 10:30 – 12:30   ⌖ Makerspace           │ ││      noch 43 Min · Maker… ││
│ │ Fragen? Einfach die Mentor:innen …       │ ││      ███████░░░░░         ││
│ │                                          │ │└───────────────────────────┘│
│ │  ╭────────╮  ┌─────────────────────────┐ │ │ 12:30 ▣ Mittagessen         │
│ │ │  NOCH   │  │ → ALS NÄCHSTES · in 43 M│ │ │ 13:15 ▣ Phase 2 …           │
│ │ │  42:30  │  │ Mittagessen             │ │ │ …                           │
│ │ │bis 12:30│  │ [🍴 Essen] 12:30–13:15 · │ │ │                             │
│ │  ╰────────╯  └─────────────────────────┘ │ │                             │
│ └──────────────────────────────────────────┘ │                             │
└──────────────────────────────────────────────┴─────────────────────────────┘
```

**Board mode** (at `min-width: 1280px` **and** `min-height: 720px`):

| Element | Spec |
|---|---|
| Page | `height: 100vh; overflow: hidden;` padding `56px 64px`; column flex, `gap: 40px`. Drop `--maxw` in this mode (full-bleed). |
| Main grid | `grid-template-columns: minmax(0,1fr) 640px; gap: 56px;` fills remaining height. |
| Hero (NowPanel) | Card: `--surface`, 1px `--border`, radius **28px**, `--shadow`, padding `56px 64px`, column flex. Top block (eyebrow, title, meta) at the top; ring + next card pinned to the bottom with a `flex:1` spacer between. |
| Timeline | Sits directly on `--bg` (no card). Heading row "Tagesplan" + "{n} von {total} erledigt". |

Designed at 1920×1080. Everything is in px, so on the 1920 whiteboard it maps 1:1.
If the whiteboard runs at a different resolution, scale the board with a CSS
`zoom`/`transform: scale()` wrapper computed from `100vw / 1920` rather than
re-flowing. **Ask the user** which resolution the whiteboard uses before
choosing between those two options.

**Below board mode:** keep today's stacked single-column layout, but reuse the new
components (ring timer, row styling) so there's one visual language.

---

## 2. Tokens: additions to `src/index.css`

Keep the existing names (`--tone-blue`, `--tone-blue-bg`, …, `--surface-2`, `--text-faint`, …).
Add **only** these new semantic tokens, derived from `--brand-hue`:

```css
:root {                                  /* light */
  --track:   hsl(var(--brand-hue) 30% 92%);          /* ring + progress track */
  --on-brand:#ffffff;                                /* text on solid brand fill */
  --halo:    hsl(var(--brand-hue) 85% 45% / .35);    /* pulsing glow on current dot */
  --radius-xl: 28px;                                 /* hero card */
}
[data-theme="dark"] {
  --track:   hsl(var(--brand-hue) 20% 18%);
  --on-brand:hsl(var(--brand-hue) 40% 8%);           /* dark text on light-ish brand */
  --halo:    hsl(var(--brand-hue) 90% 62% / .35);
}
```

Reference values used in the design, in case the existing ones differ. **Keep the
existing tokens unless they fail AA.**

| Token | Light | Dark |
|---|---|---|
| `--bg` | `hsl(H 38% 96%)` | `hsl(H 32% 7%)` |
| `--surface` | `#fff` | `hsl(H 26% 11%)` |
| `--surface-2` | `hsl(H 40% 94%)` | `hsl(H 22% 15%)` |
| `--text` | `hsl(H 45% 11%)` | `hsl(H 30% 95%)` |
| `--text-muted` | `hsl(H 14% 34%)` | `hsl(H 14% 72%)` |
| `--text-faint` | `hsl(H 10% 45%)` | `hsl(H 10% 58%)` |
| `--border` | `hsl(H 25% 88%)` | `hsl(H 20% 19%)` |
| brand (solid) | `hsl(H 85% 38%)` | `hsl(H 90% 62%)` |
| tone blue / bg | `hsl(214 72% 42%)` / `hsl(214 80% 95%)` | `hsl(214 90% 72%)` / `hsl(214 45% 19%)` |
| tone purple / bg | `hsl(268 46% 48%)` / `hsl(268 60% 96%)` | `hsl(268 80% 78%)` / `hsl(268 32% 21%)` |
| tone orange / bg | `hsl(24 88% 40%)` / `hsl(28 95% 94%)` | `hsl(28 95% 64%)` / `hsl(28 45% 18%)` |
| tone green / bg | `hsl(152 60% 28%)` / `hsl(150 50% 93%)` | `hsl(150 55% 60%)` / `hsl(150 38% 16%)` |

(`H` = `var(--brand-hue)`.) Orange is also the **urgency** colour (§4).

**Type:** Pixelify Sans for the logo, titles, times, clock and countdown. Always use
`font-variant-numeric: tabular-nums` on numbers. Inter for everything else.

---

## 3. Components

### 3.1 `Header.tsx`

- Left: a 52×52 logo tile (radius 14, `background: var(--brand)`, Pixelify "M" 30px in `--on-brand`)
  + "MYS Hackday" (Pixelify 30/600) over "Make Your School · KidsLab" (17px, `--text-muted`).
- Right: clock `<time>` in Pixelify **56px**/500, `HH:MM` in `--text` and `:SS` in
  `--text-faint`, so the seconds tick without pulling focus.
- Theme toggle: 52×52 button, radius 14, `--surface` bg, 1px `--border`, 22px icon
  (moon in light, sun in dark), `aria-label="Farbschema wechseln"`.
- In board mode the header is not sticky, because the page doesn't scroll.

### 3.2 `NowPanel.tsx` → hero card

Top block (fades up on mount, see §6):

1. **Eyebrow row:** a 12px dot + uppercase label (20px/600, letter-spacing .1em),
   both coloured per state (§4). Next to it a **kind badge** pill: tone-bg fill, tone
   text, 20px icon + label, 18px/600, padding `8px 16px 8px 12px`.
2. (gap state only) "Weiter geht's mit" in 30px `--text-muted`.
3. **Title** `<h1>`: Pixelify 600, line-height 1.02, `text-wrap: balance`.
   Size **112px**, or **92px** when the title is longer than 22 characters. It must wrap to 2 lines cleanly.
4. **Meta row:** 26px `--text-muted`, with clock icon + "10:30 – 12:30" and pin icon + location, gap 32px.
5. **Note** (optional): 24px `--text-muted`, max-width 900px.

Bottom row (`align-items: flex-end; gap: 48px`):

- **`<RingTimer>` (new component):** 320×320 SVG, r=146, stroke 16, round cap,
  rotated −90°. The track uses `--track`. The arc shows the **remaining** fraction
  (`stroke-dasharray: C; stroke-dashoffset: C × (1 − remainingFraction)`, C = 2π·146 ≈ 917.35).
  Centered inside it:
  - label (18px/600 uppercase, `--text-muted`): "Noch" or "Beginnt in"
  - countdown: Pixelify 600. **84px** for `M:SS`, **58px** for `H:MM:SS`
  - sub-line (18px, `--text-muted`): "bis 12:30" or "um 15:45"

  The wrapper carries `role="progressbar"`, `aria-valuemin=0`, `aria-valuemax=100`,
  `aria-valuenow` = elapsed %, and an `aria-label` ("Verbleibende Zeit" or "Zeit bis zum Beginn").
  This **replaces** the old linear bar in the hero.
- **Next card:** `flex:1`, `--surface-2`, radius 22, padding `32px 36px`, gap 16:
  - eyebrow: arrow icon + "ALS NÄCHSTES" (or "DANACH") + `· in 43 Min` in brand colour (20px, normal case)
  - title: Pixelify 44px/600
  - small kind pill (17px) + "12:30 – 13:15 · Mensa" (20px, muted)
  - hidden when there is no following item.

### 3.3 `Timeline.tsx`

- `<ol>`, gap 6px. Each row is a grid: `84px 44px 1fr`, column-gap 16, padding
  `12px 20px 12px 12px`, radius 18, min-height 70.
  - time: Pixelify 26px/500, right-aligned
  - kind tile: 44×44, radius 13, 20px icon
  - title: Inter 23px/600; meta line 17px `--text-muted`
- **Rail:** a 2px vertical line through the tile centres (`::before`, `left: 133px`). It is clipped
  to start and end at the first and last tile. Past segments use brand at 50% opacity.
- Row states:

| State | Time | Tile | Title | Meta | Extra |
|---|---|---|---|---|---|
| `past` | `--text-faint` | `--surface-2` bg, faint icon | `--text-muted` | "bis 09:30 · Aula" | none |
| `current` | brand | solid tone bg, `--surface` icon, **halo pulse** | `--text` | "noch 43 Min · Makerspace" | Row gets `--surface` bg + `--shadow`. "LÄUFT" pill (brand bg, `--on-brand`, 13px/700 uppercase). 6px progress bar with a moving sheen. |
| `upcoming` | `--text-muted` | tone-bg tile, tone icon | `--text` | "12:30 – 13:15 · Mensa" | none |

- Heading counter: "{done} von {total} erledigt".
- Keep `aria-current="step"` on the running row.

---

## 4. The time states: visual rules

Driven by `buildTimeline(...).dayState` plus one new derived flag, **`urgent`**.

| State | Eyebrow (text · colour · dot) | Hero title | Ring | Next card |
|---|---|---|---|---|
| `before` | "Gleich geht's los" · brand · dot **breathes** (opacity 1→.35, 2.4s) | first item | brand arc = time until start, over a **60-min window** (full ring ≥ 60 min out). Whole ring scales 1→1.03 slowly (4s). Label "Beginnt in", sub "um 09:00". | "Danach · um 09:30" + 2nd item |
| `running` | "Jetzt läuft" · brand · dot with **pulse halo** | current item | brand arc = remaining / duration. Label "Noch", sub "bis 12:30". | "Als Nächstes · in 43 Min" |
| `running` + **urgent** (≤ 300 s left) | "Endspurt" · **orange** · pulse | current item | arc **and** countdown turn **orange** (0.6s colour transition), and the arc pulses its opacity (1.4s). | unchanged |
| `gap` | "Kurze Pause" · `--text-muted` · static dot | "Weiter geht's mit" + next item | **grey** arc (`--text-faint`) = time until start, over the gap's length. The track is **dashed** (`2 12`) and slowly rotates (40s/turn). Label "Beginnt in". | "Danach · um …" |
| `after` | "Hackday beendet" · green · static dot | "Geschafft!" + "Der Hackday ist zu Ende. Danke fürs Mitmachen!" (30px muted) | no ring. Bottom row shows 2 stats: "9 Programmpunkte" and "09:00–17:00 Hackday" (Pixelify 72px brand). | none |

`after` also shows **pixel confetti**: about 30 small squares (10/14px, radius 2) in brand and the
four tones. They fall behind the hero content, inside the card only
(`translateY(0→900px) rotate(0→450deg)`, 4.5–7.3s, staggered delays, fading out at the end).
Decorative only: `aria-hidden`, hidden under reduced motion.

---

## 5. Logic changes (`src/lib/schedule.ts`): keep them pure and tested

Add these (or equivalent) and cover each with tests in `schedule.test.ts`:

```ts
export const URGENT_SECONDS = 300;
export const BEFORE_WINDOW_SECONDS = 3600;

/** 0..1, share of the ring that is still "full". */
export function ringFraction(tl: Timeline, nowSec: number): number
//  running → (end - now) / (end - start)
//  before  → min(1, (first.start - now) / BEFORE_WINDOW_SECONDS)
//  gap     → (next.start - now) / (next.start - prev.end)
//  after   → 0

export function isUrgent(tl: Timeline, nowSec: number): boolean   // running && remaining <= URGENT_SECONDS

/** "in 43 Min", "in 1 Std", "in 1 Std 5 Min" (minutes rounded UP, min 1). */
export function formatIn(seconds: number): string
```

The countdown format stays `formatCountdown`: `M:SS` under an hour, `H:MM:SS` above.
Rendered-state tests to add: the urgent state shows "Endspurt"; `after` shows "Geschafft!" and no progressbar;
the `gap` state shows "Weiter geht's mit".

---

## 6. Motion spec (all in `index.css`)

| Name | Where | Definition |
|---|---|---|
| `fadeUp` | hero top block; bottom row delayed .15s | `opacity 0→1, translateY(18px→0)`, .9s `cubic-bezier(.2,.7,.2,1)`, once on mount |
| ring drain | ring arc | `transition: stroke-dashoffset 1s linear, stroke .6s ease` (updated every second → continuous motion) |
| `pulse` | live eyebrow dot `::after` | scale 1→3.2, opacity .6→0, 1.8s ease-out ∞ |
| `breathe` | `before` dot; urgent arc (1.4s) | opacity 1→.35→1, 2.4s ∞ |
| `ringBreathe` | `before` ring wrapper | scale 1→1.03→1, 4s ∞ |
| `spin` | `gap` dashed track | rotate 360°, 40s linear ∞ (`transform-box: fill-box; transform-origin: center`) |
| `halo` | current timeline tile | `box-shadow: 0 0 0 0 var(--halo)` → `0 0 0 14px transparent`, 2s ∞ |
| `sheen` | current row progress fill `::after` | a narrow white-alpha highlight sweeps −100%→100%, 2.8s ∞; fill width `transition: 1s linear` |
| `fall` | confetti (after only) | see §4 |
| theme switch | page bg/colour, row bg | `.6s ease` transitions |

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
  .confetti { display: none; }
}
```

Nothing else moves. Don't add hover effects: it's a display, not an app.

---

## 7. Icons

Keep `src/components/icons.tsx`. Use stroke icons with `stroke-width: 2`, round caps and joins, `currentColor`:
wrench (phase), fork & knife (meal), coffee cup (break), microphone (talk), plus clock,
map pin, arrow-right, sun and moon for the new UI. Sizes: 20px (badges, tiles), 24px (hero meta),
18px (next-card pill), 22px (toggle).

---

## 8. Acceptance checklist

- [ ] At 1920×1080 the board fills the screen with **no scrollbar** in all four states, with 9 items.
- [ ] The whole board looks right in light and dark, and toggling animates smoothly.
- [ ] 2-line titles (e.g. "Phase 2 · Weiterbauen & testen") wrap cleanly in the hero at 92px.
- [ ] The ring drains smoothly every second. Digits don't jitter (tabular-nums).
- [ ] In the last 5 minutes it switches to "Endspurt" + orange ring and countdown, and switches back at the next item.
- [ ] `before` / `gap` / `after` are visually distinct as described in §4.
- [ ] Reduced motion: no animation anywhere, confetti hidden, everything still readable.
- [ ] Contrast is AA in both themes (check `--text-faint` on `--bg`, and the "LÄUFT" pill in dark).
- [ ] The narrow/phone layout still works (stacked), using the new components.
- [ ] Tests and build pass. New logic in §5 is unit-tested.

**Open question for the user:** the whiteboard's native resolution and aspect ratio.
The design assumes 16:9 at 1920×1080.
