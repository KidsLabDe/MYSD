// Bildschirme title / play (HUD) / name / board: Markup wörtlich aus design/Arcade.dc.html (src/generated/Arcade.ts).
import { html as arcadeGen, vals as arcadeVals } from '../generated/Arcade';
import type { Entry } from './leaderboard';

export type Screen = 'title' | 'play' | 'name' | 'board';
export const pad5 = (n: number) => String(Math.max(0, Math.floor(n))).padStart(5, '0');

export function boardRows(list: Entry[], me: number) {
  return list.map((e, i) => ({ rank: i + 1, name: e.name, score: pad5(e.score), color: i === me ? '#0E1A14' : i === 0 ? '#F2B866' : '#E9F7DF', bg: i === me ? '#F2B866' : 'rgba(0,0,0,0)' }));
}
export function letters(name: string[], cursor: number) {
  return name.map((ch, i) => {
    const act = i === cursor;
    return { ch: ch === ' ' ? '_' : ch, border: act ? '#F2B866' : '#3E6B55', color: act ? '#5E9A78' : '#E9F7DF', arrow: act ? '#F2B866' : 'rgba(0,0,0,0)' };
  });
}

export interface ScreenData { screen: Screen; score: number; hi: number; lives: number; list: Entry[]; me: number; name: string[]; cursor: number; rank: number }

/** Live-Daten → Markup. Auf „play“ zeichnet das Canvas das Spielfeld, das SVG bleibt leer. */
export function screenHtml(d: ScreenData): string {
  const base = arcadeVals({ screen: d.screen });
  const over: Record<string, unknown> = {
    walls: [], dots: [], powers: [], doors: [], bugs: [], player: { x: -100, y: -100, e1: 1, e2: 3 },
    score: pad5(d.score), hi: pad5(d.hi), lives: Array.from({ length: Math.max(0, d.lives - 1) }, () => ({})),
    rank: d.rank, letters: letters(d.name, d.cursor), board: boardRows(d.list, d.me),
    top3: boardRows(d.list, -1).slice(0, 3),
  };
  let h = arcadeGen({ screen: d.screen }, { ...base, ...over });
  if (d.screen === 'title' && d.list.length === 0) {
    // leere Rangliste: statt Top 3 „Noch keine Einträge“ (gleiche Zeile, gleicher Stil)
    h = h.replace('font-size: 20px; color: #7FA58A">\n\n</div>', 'font-size: 20px; color: #7FA58A">\n<span>Noch keine Einträge</span>\n</div>');
  }
  return h;
}
/** Beispielzustand des Designs (für ?arcade=…&demo) */
export const demoHtml = (screen: Screen) => arcadeGen({ screen });
