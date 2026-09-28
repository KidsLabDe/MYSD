/**
 * Board mode renders a fixed 1920×1080 stage (the design canvas) and scales it
 * uniformly to the viewport, so the 4K whiteboard shows exactly the design
 * instead of a re-flowed layout.
 */

export const BOARD_WIDTH = 1920;
export const BOARD_HEIGHT = 1080;

/** Uniform scale that fits the stage inside a `width × height` viewport. */
export function boardScale(width: number, height: number): number {
  const scale = Math.min(width / BOARD_WIDTH, height / BOARD_HEIGHT);
  return scale > 0 ? scale : 1;
}
