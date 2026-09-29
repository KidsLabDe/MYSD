/**
 * The pixel-art mouse that "clicks" the next phase right as it starts: when
 * to show it, how it is drawn, and where it travels. Pure, so the component
 * only measures the DOM and plays the animation.
 */

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface Size {
  readonly width: number;
  readonly height: number;
}

/** Length of the whole glide → click → leave trip (keep in sync with index.css). */
export const CURSOR_DURATION_MS = 4800;

/**
 * When in the trip the click lands (keep in sync with index.css). The mouse
 * sets off this long before the next item starts, so the click and the switch
 * happen together. A whole number of seconds, to match the clock ticks.
 */
export const CURSOR_CLICK_MS = 2000;

export interface ClickTarget {
  /** The item about to start, i.e. the row to click. */
  readonly id: string;
  /** Identifies this one switch (item + moment), so each is clicked once. */
  readonly key: string;
}

export interface ClickDue extends ClickTarget {
  /** How far into the trip it already is (e.g. the board loaded late). */
  readonly lateMs: number;
}

/**
 * Whether the mouse should be on its way to click `target`, which starts in
 * `untilSeconds`. Due from {@link CURSOR_CLICK_MS} before the start until it.
 */
export function clickDue(target: ClickTarget | null, untilSeconds: number | null): ClickDue | null {
  if (target === null || untilSeconds === null) return null;
  const untilMs = untilSeconds * 1000;
  if (untilMs <= 0 || untilMs > CURSOR_CLICK_MS) return null;
  return { ...target, lateMs: CURSOR_CLICK_MS - untilMs };
}

/** Classic arrow cursor: `B` outline, `W` body, `.` transparent. Tip at (0,0). */
export const CURSOR_BITMAP: readonly string[] = [
  "B",
  "BB",
  "BWB",
  "BWWB",
  "BWWWB",
  "BWWWWB",
  "BWWWWWB",
  "BWWWWWWB",
  "BWWWWWWWB",
  "BWWWWWWWWB",
  "BWWWWWBBBBB",
  "BWWBWWB",
  "BWB.BWWB",
  "BB..BWWB",
  "B....BWWB",
  ".....BWWB",
  "......BB",
];

export type CursorFill = "outline" | "body";

export interface CursorRun {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly fill: CursorFill;
}

const FILLS: Readonly<Record<string, CursorFill>> = { B: "outline", W: "body" };

/** Turns a bitmap into horizontal same-color runs (one `<rect>` each). */
export function cursorRuns(bitmap: readonly string[]): CursorRun[] {
  return bitmap.flatMap((row, y) => {
    const runs: CursorRun[] = [];
    let x = 0;
    while (x < row.length) {
      const fill = FILLS[row.charAt(x)];
      let end = x + 1;
      while (end < row.length && row.charAt(end) === row.charAt(x)) end += 1;
      if (fill !== undefined) runs.push({ x, y, width: end - x, fill });
      x = end;
    }
    return runs;
  });
}

/** How far outside the stage the cursor starts and ends (clears its own size). */
export const CURSOR_MARGIN = 120;

/** How far below the target the cursor comes in, so it glides up-left to it. */
const ENTER_DROP = 260;

export interface CursorPath {
  readonly enter: Point;
  readonly click: Point;
  readonly exit: Point;
}

/** Enters from the right edge, clicks `target`, leaves over the bottom edge. */
export function cursorPath(target: Point, stage: Size): CursorPath {
  return {
    enter: {
      x: stage.width + CURSOR_MARGIN,
      y: Math.min(target.y + ENTER_DROP, stage.height),
    },
    click: target,
    exit: {
      x: Math.min(target.x + ENTER_DROP, stage.width + CURSOR_MARGIN),
      y: stage.height + CURSOR_MARGIN,
    },
  };
}
