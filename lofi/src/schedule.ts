// Zeitmodell: Konfiguration + manuelle Eingriffe + Uhrzeit → aktueller Zustand.
// Reine Funktionen, keine DOM-Abhängigkeit (getestet in tests/schedule.test.ts).
import type { PcState } from './types';

export interface PhaseCfg { name: string; start: string; end: string; blinds?: number; type?: string; screen?: string }
export interface EventCfg {
  title: string; date?: string;
  /** KidsLab-Poster: papier (Standard) | gerahmt | banner | duoton */
  poster?: string;
  location: { name: string; latitude: number; longitude: number };
  phases: PhaseCfg[];
  /** ISO-Datum, auf das sich die Zeiten beziehen (MYSD-Plan). Ohne: heute. */
  day?: string;
  /** Jalousie in einer Lücke zwischen zwei Phasen (ohne: die der nächsten Phase) */
  gapBlinds?: number;
}

/** Manuelle Eingriffe, in Reihenfolge gespeichert (localStorage). Zeiten = Epoch-ms der Dashboard-Uhr. */
export type Op =
  | { t: 'extend'; at: number; ms: number }            // +/-: aktuelle Phase verlängern, alles danach verschiebt sich
  | { t: 'skip'; at: number }                          // →: aktuelle Phase endet jetzt, nächste beginnt jetzt (ihr Ende bleibt)
  | { t: 'back'; at: number }                          // ←: vorherige Phase läuft ab jetzt mit voller Dauer, Rest verschiebt sich
  | { t: 'pause'; from: number; to: number | null }    // P: Zeit steht, aktuelle Phase wird um die Pause länger
  | { t: 'blinds'; at: number; value: number };        // J: Jalousie-Override bis zum nächsten Phasenwechsel

export interface Slot { start: number; end: number }
const MIN = 60_000;

export function dayStart(now: number) { const d = new Date(now); d.setHours(0, 0, 0, 0); return d.getTime(); }
export function parseHM(s: string) { const [h, m] = s.split(':').map(Number); return (h * 60 + m) * MIN; }
export function hhmm(ms: number) { const d = new Date(ms); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; }
export function hms(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) => String(n).padStart(2, '0')).join(':');
}

export function anchor(cfg: EventCfg, now: number) {
  const m = cfg.day?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime() : dayStart(now);
}
export function baseSlots(cfg: EventCfg, now: number): Slot[] {
  const d0 = anchor(cfg, now);
  return cfg.phases.map((p) => ({ start: d0 + parseHM(p.start), end: d0 + parseHM(p.end) }));
}

/** Index der Phase, die zum Zeitpunkt t aktiv ist (oder als nächste kommt); n = Tag vorbei. */
export function indexAt(slots: Slot[], t: number) {
  for (let i = 0; i < slots.length; i++) if (t < slots[i].end) return i;
  return slots.length;
}
const shift = (slots: Slot[], from: number, ms: number) => {
  for (let k = from; k < slots.length; k++) { slots[k].start += ms; slots[k].end += ms; }
};

export function applyOps(base: Slot[], ops: Op[], now: number): Slot[] {
  const s = base.map((x) => ({ ...x }));
  const n = s.length;
  const planned = base.map((x) => x.end - x.start);
  for (const op of ops) {
    if (op.t === 'blinds') continue;
    const at = op.t === 'pause' ? op.from : op.at;
    const i = indexAt(s, at);
    if (op.t === 'extend') {
      if (i >= n) continue;
      if (at < s[i].start) shift(s, i, op.ms);           // vor Beginn: Start verschieben
      else { s[i].end += op.ms; shift(s, i + 1, op.ms); }
      if (s[i].end - s[i].start < MIN) s[i].end = s[i].start + MIN; // mind. 1 Minute
    } else if (op.t === 'pause') {
      if (i >= n) continue;
      const len = Math.max(0, (op.to ?? now) - op.from);
      if (op.from < s[i].start) shift(s, i, len);
      else { s[i].end += len; shift(s, i + 1, len); }
    } else if (op.t === 'skip') {
      if (i >= n) continue;
      if (at < s[i].start) { s[i].start = at; continue; } // vor Beginn: jetzt starten
      s[i].end = at;
      if (i + 1 < n) {
        s[i + 1].start = at;
        if (s[i + 1].end <= at) s[i + 1].end = at + planned[i + 1];
      }
    } else if (op.t === 'back') {
      if (i === 0) continue;
      const p = i - 1;
      s[p].start = at; s[p].end = at + planned[p];
      if (i < n) shift(s, i, s[p].end - s[i].start);
    }
  }
  return s;
}

export interface Resolved {
  n: number;
  idx: number;          // aktuelle Phase (n = Tag vorbei)
  waiting: boolean;     // vor Beginn von idx (vor der ersten Phase oder in einer Lücke)
  gap: boolean;         // Lücke zwischen zwei Phasen (waiting && idx > 0)
  ende: boolean;
  slots: Slot[];
  remaining: number;    // ms bis Phasenende (bzw. bis Start, wenn waiting)
  state: PcState;
  struck: number;
  nowRow: number;
  blinds: number;
  fill: number;         // 0–16
  paused: boolean;
}

export function resolve(cfg: EventCfg, ops: Op[], now: number): Resolved {
  const n = cfg.phases.length;
  const slots = applyOps(baseSlots(cfg, now), ops, now);
  const idx = indexAt(slots, now);
  const ende = idx >= n;
  const waiting = !ende && now < slots[idx].start;
  const paused = ops.some((o) => o.t === 'pause' && o.to === null);
  let remaining = 0, fill = 16, state: PcState = 'ende';
  if (!ende) {
    const sl = slots[idx];
    remaining = waiting ? sl.start - now : sl.end - now;
    const dur = sl.end - sl.start;
    fill = waiting ? 0 : Math.max(0, Math.min(16, Math.floor(((now - sl.start) / dur) * 16)));
    if (waiting || cfg.phases[idx].type === 'pause') state = 'pause';
    else state = remaining <= 5 * MIN ? 'endspurt' : 'laeuft';
  }
  const pIdx = Math.min(idx, n - 1);
  const gap = waiting && idx > 0;
  let blinds = clampBlinds(gap && cfg.gapBlinds !== undefined ? cfg.gapBlinds : cfg.phases[pIdx]?.blinds ?? 0);
  // Jalousie-Override (J) gilt nur, solange dieselbe Phase aktiv ist
  for (const o of ops) if (o.t === 'blinds' && indexAt(slots, o.at) === idx) blinds = clampBlinds(o.value);
  return { n, idx, waiting, gap, ende, slots, remaining, state, struck: idx, nowRow: ende || waiting ? -1 : idx, blinds, fill, paused };
}

export const clampBlinds = (b: number) => Math.max(0, Math.min(100, Math.round(b / 10) * 10));

/** Kalender zeigt 8 Zeilen. Bei mehr Phasen wandert das Fenster mit: die aktuelle Zeile bleibt höchstens in Zeile 6. */
export const CAL_ROWS = 8;
export function calOffset(struck: number, n: number) {
  return n <= CAL_ROWS ? 0 : Math.max(0, Math.min(n - CAL_ROWS, struck - 5));
}
