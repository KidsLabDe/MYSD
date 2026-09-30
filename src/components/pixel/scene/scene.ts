// Bühne 1920×1080: Ebenen von hinten nach vorn (CLAUDE.md §3)
import { roomBackHtml, roomFrontHtml } from './components/room';
import { windowHtml, rainDrops, stormDrops, snowFlakes } from './components/window';
import { calendarHtml, type CalendarProps } from './components/calendar';
import { computerHtml, type ComputerProps } from './components/computer';
import { personHtml, type PersonProps } from './components/person';
import { printerHtml, type PrinterView } from './printer';
import { posterHtml } from './components/poster';
import type { Weather } from './types';

export const DESK_END = 1392; // ab hier steht die Person VOR dem Tisch

export interface SceneState {
  weather: Weather;
  blinds: number;
  poster: string;
  handleY: number | null;
  rainOff: number;
  snowOff: number;
  bolt: boolean;
  calendar: CalendarProps;
  computer: ComputerProps;
  /** Tasse auf dem Tisch (Room_Front cup) */
  cupOnDesk: boolean;
  /** 3D-Drucker (null = ausgeblendet, nur für die ältere Tafel Kalender_Abhaken) */
  printer: PrinterView | null;
  /** nur Tests: kleine Pflanze wie auf älteren Tafeln */
  smallPlant?: boolean;
  /** layer ganzVorne: vor Tisch UND Computer. top in px (378 Boden, 324 Stufe, 270 Bank). */
  person: PersonProps & { visible: boolean; x: number; layer?: 'auto' | 'ganzVorne'; top?: number };
}

function layer(stage: HTMLElement, id: string, css: string) {
  const d = document.createElement('div');
  d.id = id;
  d.style.cssText = 'position: absolute; ' + css;
  stage.appendChild(d);
  return d;
}

export class Scene {
  private back: HTMLElement; private win!: HTMLElement; private posterSlot!: HTMLElement; private cal: HTMLElement;
  private person: HTMLElement; private front: HTMLElement; private printer: HTMLElement; private night: HTMLElement; private pc: HTMLElement;
  private keys: Record<string, string> = {};

  constructor(public stage: HTMLElement) {
    stage.style.cssText = "width: 1920px; height: 1080px; position: relative; overflow: hidden; background: #4A2E2B; font-family: 'Pixelify Sans', monospace; color: #2A1A18";
    this.back = layer(stage, 'l-back', 'left: 0px; top: 0px; z-index: 1');
    this.cal = layer(stage, 'l-cal', 'left: 1476px; top: 36px; z-index: 2');
    // Reihenfolge wie design/Main.dc.html: Room_Back 1 · Kalender 2 · Person hinten 3 · Room_Front 4 · Drucker 5 ·
    // Person vorne 6 · Nacht-Overlay 7 · Computer 8 · Person ganzVorne 9
    this.person = layer(stage, 'l-person', 'top: 378px; left: 1392px; z-index: 6');
    this.front = layer(stage, 'l-front', 'left: 0px; top: 0px; z-index: 4');
    this.printer = layer(stage, 'l-printer', 'left: 348px; top: 432px; z-index: 5');
    this.night = layer(stage, 'l-night', 'left: 0px; top: 0px; width: 1920px; height: 1080px; background: rgba(12,16,34,0.45); pointer-events: none; z-index: 7; display: none');
    this.pc = layer(stage, 'l-pc', 'left: 828px; top: 360px; z-index: 8');
    this.back.innerHTML = roomBackHtml();
    this.win = this.back.querySelector('#window-slot') as HTMLElement;
    this.posterSlot = this.back.querySelector('#poster-slot') as HTMLElement;
  }

  private set(el: HTMLElement, key: string, val: unknown, html: () => string) {
    const k = JSON.stringify(val);
    if (this.keys[key] === k) return false;
    this.keys[key] = k;
    el.innerHTML = html();
    return true;
  }

  render(s: SceneState) {
    // Fenster: komplett neu nur bei Wetter/Jalousie/Griff; Tropfen & Blitz direkt am Element
    const winKey = { w: s.weather, b: s.blinds, h: s.handleY };
    if (!this.set(this.win, 'win', winKey, () => windowHtml(s))) {
      const drops = this.win.querySelector('#wx-drops');
      if (drops && this.keys.rain !== String(s.rainOff)) drops.innerHTML = s.weather === 'gewitter' ? stormDrops(s.rainOff) : rainDrops(s.rainOff);
      const flakes = this.win.querySelector('#wx-flakes');
      if (flakes && this.keys.snow !== String(s.snowOff)) flakes.innerHTML = snowFlakes(s.snowOff);
      const bolt = this.win.querySelector('#wx-bolt') as SVGElement | null;
      if (bolt) bolt.style.display = s.bolt ? 'inline' : 'none';
    }
    this.keys.rain = String(s.rainOff); this.keys.snow = String(s.snowOff);

    this.set(this.posterSlot, 'poster', s.poster, () => posterHtml(s.poster));
    this.set(this.cal, 'cal', s.calendar, () => calendarHtml(s.calendar));
    this.set(this.front, 'front', [s.weather, s.blinds, s.cupOnDesk, !!s.smallPlant], () => roomFrontHtml(s.weather, s.blinds, { cup: s.cupOnDesk, smallPlant: !!s.smallPlant }));
    this.printer.style.display = s.printer ? 'block' : 'none';
    if (s.printer) this.set(this.printer, 'printer', s.printer, () => printerHtml(s.printer!));
    this.night.style.display = s.weather === 'nacht' ? 'block' : 'none';
    this.set(this.pc, 'pc', s.computer, () => computerHtml(s.computer));

    const p = s.person;
    const x = Math.round(p.x / 6) * 6; // nur ganze Pixel
    this.person.style.display = p.visible ? 'block' : 'none';
    this.person.style.left = x + 'px';
    const top = p.top ?? 378;
    const topmost = p.layer === 'ganzVorne';
    this.person.style.top = top + 'px';
    this.person.style.zIndex = topmost ? '9' : x >= DESK_END ? '6' : '3';
    // Ebene ganzVorne liegt über dem Nacht-Overlay → laut Design brightness(0.6)
    this.person.style.filter = topmost && s.weather === 'nacht' ? 'brightness(0.6)' : '';
    const pp: PersonProps = { pose: p.pose, marker: p.marker, arm: p.arm ?? null, armDy: p.armDy ?? 0, view: p.view ?? 'back', face: p.face ?? 'auto', armLeft: p.armLeft ?? 'down', holding: p.holding ?? 'none', steamDy: p.steamDy ?? 0 };
    if (p.visible) this.set(this.person, 'person', pp, () => personHtml(pp));
  }
}

/** Skalierung auf das Fenster: jede Szenen-Pixelkante landet auf einem ganzen Gerätepixel. */
export function fitStage(viewport: HTMLElement, stage: HTMLElement) {
  const dpr = window.devicePixelRatio || 1;
  const fit = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
  const unit = 6 * dpr; // Gerätepixel pro Szenenpixel bei Skalierung 1
  let s = Math.floor(fit * unit) / unit;
  if (s <= 0) s = fit;
  stage.style.transformOrigin = '0 0';
  stage.style.transform = `scale(${s})`;
  const w = 1920 * s, h = 1080 * s;
  viewport.style.cssText = `position: fixed; left: ${Math.round((window.innerWidth - w) / 2)}px; top: ${Math.round((window.innerHeight - h) / 2)}px; width: ${w}px; height: ${h}px`;
}
