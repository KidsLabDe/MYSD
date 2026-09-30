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
    const ok = this.buf.length === 4 && this.buf.every((b, i) => b.k === SEQ[i]) && t - (this.buf[0]?.t ?? t) <= 2000;
    if (ok) this.buf = [];
    return ok;
  }
}

export type DashAction = 'blinds' | 'weather' | 'full' | 'help' | 'escape' | 'printer' | 'coffee' | 'wave' | 'idle' | 'talk';
/**
 * Tastenkürzel der Szene. Phasenwechsel (→/←) gehören usePresenterKeys, der Presenter-Klick
 * (PageDown/PageUp) dem Abreißkalender (tear.ts, direkt in engine.ts). G, A, M, E sind bewusst frei (nur für die Tastenfolge).
 */
export function dashboardAction(key: string): DashAction | null {
  const M: Record<string, DashAction> = {
    j: 'blinds', w: 'weather', f: 'full', '?': 'help', Escape: 'escape', d: 'printer', k: 'coffee', h: 'wave', l: 'idle',
    v: 'talk', // Vortrag: Kollege Fabi tritt auf (nochmal V: bricht ab)
  };
  return M[key] ?? M[key.toLowerCase()] ?? null;
}
/** Wohin gehört die Taste? */
export const route = (arcadeOpen: boolean): 'arcade' | 'dashboard' => (arcadeOpen ? 'arcade' : 'dashboard');
