// Leerlauf-Animationen (Winken, Kaffee, Drucker): reine Regeln, getestet in tests/idle.test.ts.
export type IdleKind = 'wave' | 'coffee' | 'printFetch' | 'printStart';
/** „nie zweimal dieselbe hintereinander“ gilt je Kategorie: Winken / Kaffee / Drucker */
export const category = (k: IdleKind) => (k === 'printFetch' || k === 'printStart' ? 'printer' : k);

export interface IdleInput {
  enabled: boolean;            // L-Taste
  queueEmpty: boolean;         // keine laufende/anstehende Sequenz
  phaseChangePending: boolean; // Abhaken/Jalousie steht an → Vorrang
  remainingMs: number;         // Dashboard-Zeit bis Phasenende (Infinity nach Tagesende)
  due: IdleKind[];             // fällige Kandidaten (in Prioritätsreihenfolge)
  last: IdleKind | null;       // zuletzt gelaufene Leerlauf-Animation
}

export const MIN_REMAINING_MS = 60_000;

/** Welche Leerlauf-Animation darf jetzt starten? null = keine. */
export function pickIdle(i: IdleInput): IdleKind | null {
  if (!i.enabled || !i.queueEmpty || i.phaseChangePending) return null;
  if (i.remainingMs < MIN_REMAINING_MS) return null;
  const lastCat = i.last ? category(i.last) : null;
  return i.due.find((k) => category(k) !== lastCat) ?? null;
}

/** Zufallsabstände in ms (Echtzeit). Testparameter: ?wave=10 / ?coffee=15 → fester Abstand in s. */
export const nextWave = (test: number | null) => (test ? test * 1000 : (90 + Math.random() * 90) * 1000);
export const nextCoffee = (test: number | null) => (test ? test * 1000 : (4 + Math.random() * 4) * 60_000);
