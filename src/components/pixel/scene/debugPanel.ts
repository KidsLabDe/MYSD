// ?debug: Panel, das den Kollegen fest anzeigt (Pose, Ansicht, Mimik, Standplatz). Nur zum Prüfen der Sprites.
import { KOLLEGE_FACES, KOLLEGE_POSES, KOLLEGE_VIEWS, type KollegeFace, type KollegePose, type KollegeView } from './components/kollege';

export interface KollegeDebug { on: boolean; pose: KollegePose; view: KollegeView; face: KollegeFace; left: number }

/** Hängt das Panel an den Body und liefert das Aufräumen. `d` wird live verändert. */
export function buildKollegeDebug(d: KollegeDebug): () => void {
  const box = document.createElement('div');
  box.style.cssText = 'position: fixed; left: 8px; bottom: 8px; z-index: 1000; width: 250px; background: rgba(20,12,10,0.92); color: #EDE0C8; font: 12px/1.4 system-ui, sans-serif; padding: 10px; border-radius: 6px';
  const row = (label: string, el: HTMLElement) => { const l = document.createElement('label'); l.style.cssText = 'display: flex; justify-content: space-between; align-items: center; gap: 8px; margin: 4px 0'; l.append(label, el); box.appendChild(l); };
  const sel = (opts: readonly string[], v: string, on: (v: string) => void) => { const s = document.createElement('select'); for (const o of opts) s.add(new Option(o, o)); s.value = v; s.onchange = () => on(s.value); return s; };
  const h = document.createElement('div'); h.textContent = 'Debug · Kollege Fabi'; h.style.cssText = 'font-weight: 700; margin-bottom: 6px'; box.appendChild(h);
  const chk = document.createElement('input'); chk.type = 'checkbox'; chk.checked = d.on; chk.onchange = () => (d.on = chk.checked);
  row('sichtbar (fest)', chk);
  row('pose', sel(KOLLEGE_POSES, d.pose, (v) => (d.pose = v as KollegePose)));
  row('view', sel(KOLLEGE_VIEWS, d.view, (v) => (d.view = v as KollegeView)));
  row('face', sel(KOLLEGE_FACES, d.face, (v) => (d.face = v as KollegeFace)));
  const left = document.createElement('input');
  Object.assign(left, { type: 'number', step: '6', min: '-264', max: '1920', value: String(d.left) }); left.style.width = '70px';
  left.oninput = () => { const v = Number(left.value); if (Number.isFinite(v)) d.left = v; };
  row('left (px)', left);
  // Tasten im Panel gehören dem Panel, nicht der Szene
  box.addEventListener('keydown', (e) => e.stopPropagation(), true);
  document.body.appendChild(box);
  return () => box.remove();
}
