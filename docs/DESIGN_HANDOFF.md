# Design Handoff — MYS Hackday Agenda Board

> A briefing for a design pass (human or Claude). It describes **what the app is**,
> **what's on screen today**, the **design system it already uses**, and the
> **open questions** a redesign should answer. Everything here reflects the code
> as it currently stands — file paths are given so you can map designs to code.

---

## 1. Product in one paragraph

A **read-only, live agenda board** for a Make Your School (MYS) Hackday, styled in
[KidsLab](https://kidslab.de) branding. On a big screen in the room (or a phone),
it answers one question at a glance: **"What's happening right now, and what's
next?"** — plus the full plan for the day. There is **no backend and no
interaction** beyond a light/dark toggle: all content is a static JSON seed and
the only moving part is time itself.

**Audience / context:** students, mentors and organizers glancing at a wall
display or their phones during the event. Readability from across a room matters.

**Language:** all UI copy is **German**. Keep it German.

---

## 2. What's on screen (current state)

The whole app is a **single scrolling screen**, three parts top to bottom:

```
┌──────────────────────────────────────────────────────────┐
│ HEADER (sticky)   logo · KidsLab      [🕘 14:07:33] [ 🌙 ] │
├──────────────────────────────────────────────────────────┤
│ NOW PANEL  ("Jetzt läuft")                                │
│   ▸ kind badge + big current title                        │
│   ▸ time range · location · note                          │
│   ▸ ████████████░░░░░░  animated progress bar             │
│   ▸ "Noch  12:45"  (big ticking countdown)                │
│   ├───────────────────────────────────────────────┐      │
│   │ ↦ Als Nächstes · in 18 Min   Mittagessen  12:30│      │
│   └───────────────────────────────────────────────┘      │
├──────────────────────────────────────────────────────────┤
│ TIMELINE (the full time table)                            │
│   09:00 ▸ ● Ankommen & Begrüßung        (past, dimmed)    │
│   09:30 ▸ ● Ideenfindung                (past, dimmed)    │
│   10:30 ▸ ● Phase 1 · Prototyp bauen    (CURRENT, lit)    │
│           ████████░░░  progress                           │
│   12:30 ▸ ● Mittagessen                 (upcoming)        │
│   …                                                       │
└──────────────────────────────────────────────────────────┘
```

That's it — no groups list, no stats, no filters, no footer. The brief for the
last iteration was explicitly *"only the time table and the current + next
parts, nothing else."* **Keep that focus.**

---

## 3. The four time states (most important interaction)

The Now Panel and Timeline are driven entirely by the current time vs. the
schedule. The pure logic lives in `src/lib/schedule.ts` (`buildTimeline`) and
returns one of four `dayState`s. **Design must cover all four:**

| `dayState` | When | Now Panel shows | Design need |
|---|---|---|---|
| `before` | Before the first item starts | "Gleich geht's los" → next item + "Beginnt in H:MM:SS" | Anticipation / warm-up look |
| `running` | Inside an item | Current item + progress + "Noch M:SS", plus a "next" strip | The hero state; most-seen |
| `gap` | Between two items | "Kurze Pause – weiter geht's mit" → next item + countdown | Clearly *not* an active phase |
| `after` | After the last item ends | "Geschafft 🎉 — Der Hackday ist zu Ende" | Friendly closing state |

Currently these three states share almost the same card layout — **a designer
could make each feel distinct** (color temperature, iconography, energy).

---

## 4. Content & data model

Seed file: `src/data/hackday.json`; types in `src/types.ts`.

```ts
HackdayData = { title: string; date: string; schedule: AgendaItem[] }

AgendaItem = {
  id: string;
  start: "HH:MM"; end: "HH:MM";   // 24h
  title: string;
  kind: "phase" | "meal" | "break" | "talk";
  location?: string;              // e.g. "Makerspace"
  note?: string;                  // one short line
}
```

**Four item kinds**, each with a label, color tone, and icon
(`src/lib/brand.ts`, `src/components/icons.tsx`):

| kind | German label | tone | icon |
|---|---|---|---|
| `phase` | Arbeitsphase | blue | wrench |
| `meal` | Essen | orange | fork & knife |
| `break` | Pause | green | coffee cup |
| `talk` | Programm | purple | microphone |

Real content ranges 09:00–17:00 with 9 items. Titles can be long
(e.g. "Phase 1 · Prototyp bauen") — **design for wrapping**.

---

## 5. Design system already in place

All tokens live as CSS custom properties in `src/index.css`. **The whole palette
is driven by one variable** — change `--brand-hue` (currently `204`, KidsLab
blue) to re-tint everything. Respect this; don't hard-code colors in components.

**Type**
- Display / headings / numbers: **Pixelify Sans** (`--font-display`) — pixel look, on-brand, playful.
- Body: **Inter** (`--font-body`).
- Loaded from Google Fonts in `index.html`.

**Color tokens** (light + dark both defined; `data-theme="dark"` on `<html>`):
- Brand scale `--brand-50 … --brand-700` from `--brand-hue`.
- Categorical tones: `--tone-{blue,purple,orange,green,pink}` (+ `-bg` tints).
- Semantic: `--bg`, `--surface`, `--surface-2`, `--text`, `--text-muted`, `--text-faint`, `--border`, `--border-strong`, `--shadow`, `--shadow-lg`.

**Shape & spacing**
- Radii: `--radius-sm: 8px`, `--radius: 14px`, `--radius-lg: 20px`.
- Content max width: `--maxw: 1180px`; 24px side gutters.

**Both light and dark themes are first-class** — every mock should be shown in both.

---

## 6. Motion (the app feels "alive" through time)

- **Header clock** ticks every second (`src/hooks/useClock.ts`).
- **Countdowns** (`Noch M:SS`, `Beginnt in …`) re-render each second — tabular-nums so digits don't jitter.
- **Progress bars** (Now Panel + current timeline row) grow with `transition: width 1s linear`, so each per-second update eases smoothly.
- **"Live" dot** in the Now Panel eyebrow has a pulsing halo (`@keyframes pulse`).
- **`prefers-reduced-motion`** is honored (animations/transitions collapsed). Any new motion must degrade the same way.

Opportunity: the countdown and progress are functional but plain — a design pass
could make the "time left" the emotional centerpiece (ring timer? large numeric
treatment? color shift as time runs low?).

---

## 7. Components → files

| On screen | Component | File |
|---|---|---|
| Sticky top bar + clock | `Header` | `src/components/Header.tsx` |
| Current + next hero | `NowPanel` (with `CurrentCard`, `UpcomingCard`, `NextStrip`, `KindBadge`) | `src/components/NowPanel.tsx` |
| Full day list | `Timeline` | `src/components/Timeline.tsx` |
| Kind badges / icons | `icons.tsx` (`kindIcon`) | `src/components/icons.tsx` |
| Tokens & global styles | — | `src/index.css` |
| Time logic (no UI) | `buildTimeline`, `formatCountdown`, `formatHuman` | `src/lib/schedule.ts` |

Timeline row states: `.tl--past` (dimmed), `.tl--current` (brand-lit + "läuft"
badge + progress), `.tl--upcoming` (default).

---

## 8. Responsive & accessibility (must-keep constraints)

- Works down to **~360px** (phone) and up to a **wall display** — the current
  timeline uses a `58px | 40px | 1fr` grid; check long titles + narrow widths.
- Consider a **large / TV mode**: from across a room, the current item and its
  countdown should be the biggest things on screen.
- Semantics already present, keep them: Now Panel is a labeled `region`; progress
  bar is a real `role="progressbar"`; clock is a `<time>`; timeline is an `<ol>`
  with `aria-current` on the running item. Color is never the only signal (labels + icons back it up).
- Contrast must pass **WCAG AA** in both themes.

---

## 9. Open questions for the design pass

1. **Hierarchy:** should the current item dominate the fold and the timeline sit
   below, or is a split view (now on the left, plan on the right) better on wide screens?
2. **Countdown treatment:** keep M:SS text, or a visual timer (ring/arc)? Should it
   change color/urgency in the last few minutes?
3. **Distinguishing the 4 states** (§3) — how different should `before` / `gap` /
   `after` look from `running`?
4. **Kind expression:** are the four tones + icons enough, or should meals/breaks
   read very differently from work phases at a glance?
5. **Density vs. calm:** it's a glance display — how much can be stripped from each
   timeline row while keeping time, title, kind and location legible?
6. **Big-screen mode** — is that in scope? If so, what breakpoint/behavior?

---

## 10. Run it / see it live

```bash
npm run dev       # http://localhost:5173  (live clock, HMR)
npm run build     # type-check + production build
npm test          # 24 tests (schedule logic + rendered states)
```

To preview a specific time state without waiting, temporarily set the system
time, or (in a test) `buildTimeline(schedule, parseTime("12:45")*60)` — see
`src/lib/schedule.test.ts` for every state.

**Non-negotiables for any redesign:** single `--brand-hue`-driven palette · light
**and** dark · German copy · `prefers-reduced-motion` support · no backend / no
new interactions · keep the scope to *current + next + timetable*.
