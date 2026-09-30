// Bestätigungs-Overlay (2 s) – auf der Bühne, im 6-px-Raster
export class Toast {
  private el: HTMLDivElement;
  private timer = 0;
  constructor(stage: HTMLElement) {
    this.el = document.createElement('div');
    this.el.style.cssText = "position: absolute; left: 36px; top: 978px; z-index: 40; padding: 12px 18px; background: rgba(42,26,24,0.92); border: 6px solid #8A4E30; color: #EDE0C8; font-family: 'Pixelify Sans', monospace; font-size: 30px; line-height: 36px; white-space: nowrap; display: none";
    stage.appendChild(this.el);
  }
  show(text: string, ms = 2000) {
    this.el.textContent = text;
    this.el.style.display = 'block';
    clearTimeout(this.timer);
    this.timer = window.setTimeout(() => (this.el.style.display = 'none'), ms);
  }
}

export function toggleFullscreen() {
  const d = document as Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => void };
  const el = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => void };
  if (document.fullscreenElement || d.webkitFullscreenElement) (document.exitFullscreen?.bind(document) ?? d.webkitExitFullscreen?.bind(d))?.();
  else (el.requestFullscreen?.bind(el) ?? el.webkitRequestFullscreen?.bind(el))?.();
}

/** Mauszeiger über `el` nach 3 s Ruhe ausblenden (Beamer). Liefert das Aufräumen. */
export function autoHideCursor(el: HTMLElement): () => void {
  let t = 0;
  const show = () => {
    el.style.cursor = '';
    clearTimeout(t);
    t = window.setTimeout(() => (el.style.cursor = 'none'), 3000);
  };
  window.addEventListener('mousemove', show);
  show();
  return () => { clearTimeout(t); window.removeEventListener('mousemove', show); el.style.cursor = ''; };
}

/** Hilfe-Overlay (Taste ?): alle Tastenkürzel, im Stil des Toasts, im 6-px-Raster */
export class HelpOverlay {
  private el: HTMLDivElement;
  constructor(stage: HTMLElement) {
    this.el = document.createElement('div');
    this.el.style.cssText = "position: absolute; left: 480px; top: 180px; width: 960px; z-index: 41; box-sizing: border-box; padding: 30px 36px; background: rgba(42,26,24,0.95); border: 6px solid #8A4E30; color: #EDE0C8; font-family: 'Pixelify Sans', monospace; font-size: 30px; line-height: 42px; display: none";
    const rows: [string, string][] = [
      ['Bild ↓ / ↑', 'Kalenderblatt abreißen (Presenter)'],
      ['→', 'nächste Phase jetzt (abhaken)'], ['←', 'eine Phase zurück'],
      ['J', 'Jalousie auf / zu'], ['W', 'Wetter durchschalten (Test)'],
      ['D', 'Drucker einen Schritt weiter'], ['K', 'Kaffeepause jetzt'], ['H', 'Hallo: winken'],
      ['L', 'Leerlauf-Animationen an / aus'], ['F', 'Vollbild'], ['?', 'diese Hilfe (Esc schließt)'],
    ];
    this.el.innerHTML = `<div style="font-size: 36px; margin-bottom: 18px; color: #F2B866">TASTENKÜRZEL</div>` +
      rows.map(([k, t]) => `<div style="display: flex; gap: 24px"><span style="width: 150px; color: #F2B866">${k}</span><span>${t}</span></div>`).join('');
    stage.appendChild(this.el);
  }
  get open() { return this.el.style.display !== 'none'; }
  toggle(v = !this.open) { this.el.style.display = v ? 'block' : 'none'; }
}
