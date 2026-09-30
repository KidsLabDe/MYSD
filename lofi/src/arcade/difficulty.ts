// Schwierigkeit je Runde (Tafel Arcade_Ablauf): Bug-Tempo relativ zum Spieltempo, Wirkdauer Kaffee.
export function difficulty(round: number): { bugSpeed: number; coffeeSec: number } {
  const r = Math.max(1, Math.floor(round));
  if (r === 1) return { bugSpeed: 0.75, coffeeSec: 6 };
  if (r <= 4) return { bugSpeed: 0.85, coffeeSec: 5 - (r - 2) };            // 5 → 4 → 3 s
  if (r <= 8) return { bugSpeed: 0.95, coffeeSec: +(2 - (r - 5) / 3).toFixed(2) }; // 2 → 1 s
  return { bugSpeed: 0.95, coffeeSec: 0 };
}
/** Spieltempo: 7 Kacheln/s = 42 Pixel/s (1 Pixel alle ≈ 24 ms) */
export const PLAYER_PX_S = 42;
/** Wellen: Streuen 7 s / Jagen 20 s, 4 Wellen, danach nur Jagen */
export const WAVES = [7, 20, 7, 20, 7, 20, 7, 20];
export const modeAt = (sec: number): 'scatter' | 'chase' => {
  let t = sec;
  for (let i = 0; i < WAVES.length; i++) { if (t < WAVES[i]) return i % 2 === 0 ? 'scatter' : 'chase'; t -= WAVES[i]; }
  return 'chase';
};
export const CATCH_POINTS = [200, 400, 800, 1600];
export const BIT_POINTS = 10, CUP_POINTS = 50, EXTRA_LIFE_AT = 10_000, START_LIVES = 3;
