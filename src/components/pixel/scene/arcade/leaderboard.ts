// Rangliste „Bug-Jagd“: localStorage hackday.bugjagd.v1 als [{name, score, date}], Top 10.
export interface Entry { name: string; score: number; date: string }
export const LS_KEY = 'hackday.bugjagd.v1';
export const MAX = 10, NAME_LEN = 8;
export const NAME_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ';

/** Defekte Daten → leere Liste */
export function parse(raw: string | null): Entry[] {
  if (!raw) return [];
  try {
    const j = JSON.parse(raw);
    if (!Array.isArray(j)) return [];
    const ok = j.every((e) => e && typeof e.name === 'string' && Number.isFinite(e.score) && e.score >= 0 && typeof e.date === 'string');
    return ok ? sort(j.map((e) => ({ name: cleanName(e.name), score: Math.floor(e.score), date: e.date }))).slice(0, MAX) : [];
  } catch { return []; }
}
/** Score absteigend, bei Gleichstand der ältere Eintrag zuerst */
export const sort = (l: Entry[]) => [...l].sort((a, b) => b.score - a.score || (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
export function cleanName(n: string): string {
  const s = n.toUpperCase().split('').filter((c) => NAME_CHARS.includes(c)).join('').slice(0, NAME_LEN).trim();
  return s || '???';
}
/** Kommt der Score in die Top 10? (Gleichstand mit Platz 10 reicht nicht – der ältere bleibt vorn) */
export const qualifies = (l: Entry[], score: number) => score > 0 && (l.length < MAX || score > (l[MAX - 1]?.score ?? 0));
/** Einfügen → neue Liste + Index des neuen Eintrags (-1, falls rausgefallen) */
export function insert(l: Entry[], name: string, score: number, date = new Date().toISOString()): { list: Entry[]; index: number } {
  const e = { name: cleanName(name), score: Math.floor(score), date };
  const list = sort([...l, e]).slice(0, MAX);
  return { list, index: list.indexOf(e) };
}
export function load(): Entry[] { try { return parse(localStorage.getItem(LS_KEY)); } catch { return []; } }
export function save(l: Entry[]) { try { localStorage.setItem(LS_KEY, JSON.stringify(l)); } catch { /* ohne Speicher */ } }
