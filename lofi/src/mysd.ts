// Adapter für das MYSD-Repo (github.com/KidsLabDe/MYSD): src/data/hackday.json → unser EventCfg.
// Reine Funktionen, getestet in tests/mysd.spec-lofi.ts.
import type { EventCfg, PhaseCfg } from './schedule';

export type AgendaKind = 'phase' | 'meal' | 'break' | 'talk';
export interface AgendaItem { id: string; start: string; end: string; title: string; kind: AgendaKind; location?: string; note?: string }
export interface HackdayDay { date: string; schedule: AgendaItem[] }
export interface HackdayData { title: string; boardTitle: string; days: HackdayDay[]; messages?: string[] }
/** lofi/ort.json: Wetter-Ort (fehlt in hackday.json) und Poster-Variante */
export interface Ort { name?: string; latitude: number; longitude: number; poster?: string }

/** Jalousie je Art: Arbeiten offen, Essen/Pause halb, Programm (Vorträge, Präsentationen) zu. */
export const KIND_BLINDS: Record<AgendaKind, number> = { phase: 0, meal: 50, break: 50, talk: 100 };
export const GAP_BLINDS = 50;

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const HM = /^\d{1,2}:\d{2}$/;

export function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Wie im Original (src/lib/days.ts): heutiger Tag, sonst der nächste, nach dem Event der letzte. */
export function selectDay(days: readonly HackdayDay[], now: Date): HackdayDay | null {
  const sorted = days.filter((d) => ISO.test(d.date)).sort((a, b) => a.date.localeCompare(b.date));
  if (!sorted.length) return null;
  const today = isoDate(now);
  return sorted.find((d) => d.date >= today) ?? sorted[sorted.length - 1];
}

/** "Make Your School · Gymnasium Wertingen" → "Gymnasium Wertingen" */
export function schoolName(title: string) {
  const i = title.lastIndexOf('·');
  return (i >= 0 ? title.slice(i + 1) : title).trim();
}

export function validData(d: unknown): d is HackdayData {
  const h = d as HackdayData;
  return !!h && Array.isArray(h.days) && h.days.some((day) => ISO.test(day?.date) && Array.isArray(day.schedule) && day.schedule.length > 0 &&
    day.schedule.every((i) => typeof i?.title === 'string' && HM.test(i.start) && HM.test(i.end)));
}
export function validOrt(o: unknown): o is Ort {
  const r = o as Ort;
  return !!r && Number.isFinite(r.latitude) && Number.isFinite(r.longitude);
}

export function toEventCfg(data: HackdayData, ort: Ort, now: Date): EventCfg | null {
  const day = selectDay(data.days, now);
  if (!day) return null;
  const items = [...day.schedule].filter((i) => HM.test(i.start) && HM.test(i.end)).sort((a, b) => a.start.localeCompare(b.start));
  if (!items.length) return null;
  const phases: PhaseCfg[] = items.map((i) => {
    const kind: AgendaKind = i.kind in KIND_BLINDS ? i.kind : 'phase';
    const p: PhaseCfg = { name: i.title, start: i.start, end: i.end, blinds: KIND_BLINDS[kind] };
    if (kind === 'meal' || kind === 'break') p.type = 'pause';
    return p;
  });
  return {
    title: data.boardTitle || 'Hackday',
    date: day.date,
    day: day.date,
    gapBlinds: GAP_BLINDS,
    poster: ort.poster,
    location: { name: schoolName(data.title || '') || ort.name || '', latitude: ort.latitude, longitude: ort.longitude },
    phases,
  };
}
