// Anzeige-Helfer der Szene (aus dem Lo-Fi-Board). Reine Funktionen.

/** "09:05" für eine Uhrzeit in ms. */
export function hhmm(ms: number): string {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Countdown "01:02:03", Sekunden aufgerundet, nie negativ. */
export function hms(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) => String(n).padStart(2, '0')).join(':');
}

/** Der Kalender zeigt 8 Zeilen. Bei mehr Phasen wandert das Fenster mit: die aktuelle Zeile bleibt höchstens in Zeile 6. */
export const CAL_ROWS = 8;
export function calOffset(struck: number, n: number): number {
  return n <= CAL_ROWS ? 0 : Math.max(0, Math.min(n - CAL_ROWS, struck - 5));
}
