# Inputs of the board

All keyboard, mouse and URL inputs, and what they do in each UI. Sources: `src/hooks/usePresenterKeys.ts`,
`src/lib/presenter.ts`, `src/components/pixel/scene/engine.ts`, `scene/arcade/keys.ts`, `scene/arcade/session.ts`,
`scene/tear.ts`.

## Keyboard

### Both UIs (`usePresenterKeys`)

Held keys and Ctrl/Alt/Meta combinations are ignored.

| Key | Modern | Pixel |
|---|---|---|
| `→` | Next phase | Next phase |
| `←` | Previous phase | Previous phase |
| `PageDown` | Next phase | Tears off one page of the tear-off calendar, never steps the plan (the scene intercepts it first; held keys don't count) |
| `PageUp` | Previous phase | Same as `PageDown` |

### Pixel UI only (`dashboardAction`, case-insensitive)

| Key | Action |
|---|---|
| `J` | Toggle blinds open/closed |
| `W` | Cycle weather (manual override) |
| `F` | Toggle fullscreen |
| `?` | Toggle help overlay |
| `Esc` | Close help overlay (nothing if closed) |
| `D` | Printer: if printing, finish now; if done, fetch the part; otherwise start a new print |
| `K` | Coffee break animation |
| `H` | Wave animation ("Hallo") |
| `L` | Toggle idle animations (stored in `localStorage` `hackday:idle`) |
| `V` | Colleague Fabi gives a talk; `V` again cancels |
| `G` `A` `M` `E` | Typed in order within 2 s: opens the "Bug-Jagd" game |

### While the Bug-Jagd game is open

The game captures all keys, so `→`/`←`/`PageDown`/`PageUp` no longer step the plan or tear the calendar.

| Screen | Keys |
|---|---|
| Title | `Enter` starts, `Esc` closes |
| Play | Arrow keys steer, `P` pauses, `Esc` closes |
| Name entry | `↑`/`↓` change letter, `←`/`→` move cursor, letters type directly, `Backspace` clears, `Enter` saves, `Esc` skips |
| Leaderboard | `Enter` plays again, `Esc` closes, `Shift+R` twice within 3 s clears the board |
| Demo (`?arcade&demo`) | `Esc` only |

## Mouse and buttons

- **Theme toggle** (`Header`): light/dark, stored in `localStorage`. Both UIs.
- **`UiSwitch`**: switches Modern/Pixel and stores the choice for the current event. Both UIs.
- **`UiPicker`**: one button per UI on first visit or when the stored choice has expired.
- **Pixel UI**: the mouse cursor hides after 3 s without movement.

## URL parameters

| Parameter | Effect | UI |
|---|---|---|
| `?ui=modern\|pixel` | Forces a UI without storing it | both |
| `?date=YYYY-MM-DD&time=HH:MM[:SS]` | Test clock | both |
| `?weather=<type>` | Forces the weather (disables `W`) | Pixel |
| `?print=<sec>` | Print duration in seconds, for testing | Pixel |
| `?wave=<n>`, `?coffee=<n>` | Interval for the wave/coffee animations, for testing | Pixel |
| `?debug` | Debug panel for Fabi | Pixel |
| `?kollege=<pose>&kview=&kface=&kleft=` | Pins Fabi in a given pose | Pixel |
| `?arcade[=title\|play\|name\|board]` | Opens the game directly | Pixel |
| `&demo[=canvas]` | Static demo screens for the game (needs `arcade` and a screen value) | Pixel |
