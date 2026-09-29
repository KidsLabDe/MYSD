/** Milliseconds until the next whole second, so clock ticks land on the second. */
export function msUntilNextSecond(nowMs: number): number {
  return 1000 - (((nowMs % 1000) + 1000) % 1000);
}
