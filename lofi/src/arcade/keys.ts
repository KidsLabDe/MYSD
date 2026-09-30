// Tastenfolge G·A·M·E (innerhalb von 2 s) und Routing: Solange das Spiel offen ist, gehören alle Tasten dem Spiel.
export const SEQ = ['g', 'a', 'm', 'e'];
export class GameSequence {
  private buf: { k: string; t: number }[] = [];
  /** true, wenn G, A, M, E gerade vollständig innerhalb von 2 s getippt wurde */
  push(key: string, t: number): boolean {
    const k = key.toLowerCase();
    if (!SEQ.includes(k)) { this.buf = []; return false; }
    this.buf.push({ k, t });
    this.buf = this.buf.slice(-4);
    const ok = this.buf.length === 4 && this.buf.every((b, i) => b.k === SEQ[i]) && t - this.buf[0].t <= 2000;
    if (ok) this.buf = [];
    return ok;
  }
}

export type DashAction = 'next' | 'back' | 'plus' | 'minus' | 'pause' | 'blinds' | 'weather' | 'full' | 'reset' | 'help' | 'escape' | 'printer' | 'coffee' | 'wave' | 'idle';
/** Dashboard-Tastenkürzel. G, A, M, E sind bewusst frei (nur für die Tastenfolge). */
export function dashboardAction(key: string): DashAction | null {
  const M: Record<string, DashAction> = {
    ArrowRight: 'next', ArrowLeft: 'back', '+': 'plus', '=': 'plus', Add: 'plus', '-': 'minus', Subtract: 'minus',
    p: 'pause', j: 'blinds', w: 'weather', f: 'full', r: 'reset', '?': 'help', Escape: 'escape', d: 'printer', k: 'coffee', h: 'wave', l: 'idle',
  };
  return M[key] ?? M[key.toLowerCase()] ?? null;
}
/** Wohin gehört die Taste? */
export const route = (arcadeOpen: boolean): 'arcade' | 'dashboard' => (arcadeOpen ? 'arcade' : 'dashboard');
