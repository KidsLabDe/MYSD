// 3D-Drucker: Zustandsmaschine (Tafel Drucker_Zyklus) + Darstellung aus design/Printer3D.dc.html (erzeugt).
import { html as printerGen, vals as printerVals } from './generated/Printer3D';

export const OBJS = ['bulb', 'rocket', 'heart', 'cube'] as const; // Reihenfolge laut Tafel
export type PrintObj = (typeof OBJS)[number];
export type PrintState = 'printing' | 'done' | 'empty';

export interface PrinterView {
  state: PrintState; layer: number; headX: number; obj: PrintObj;
  /** Übersteuerungen für Zwischenzustände, die das Design nur als Regel beschreibt */
  park?: { gy: number; hx: number } | null;   // Kopf fährt in 1-px-Schritten in die Parkposition
  led?: string | null;                         // LED-Blinken (fertig: gelb, Start: 2× grün)
}

export function printerHtml(p: PrinterView): string {
  const over: Record<string, unknown> = {};
  if (p.park) Object.assign(over, { gy: p.park.gy, hx: p.park.hx, carY: p.park.gy - 4, fanY: p.park.gy - 2, nozY: p.park.gy + 5, glowY: p.park.gy + 7, glow: false });
  if (p.led) over.led = p.led;
  return printerGen({ variant: 'open', state: p.state, layer: p.layer, headX: p.headX, obj: p.obj }, over);
}

const LED_OFF = '#5E5A54', LED_GREEN = '#7BD389', LED_YELLOW = '#F2B866';

/** Zeiten in Echtzeit-ms. ?print=40 → Druck 40 s, Abholen nach 5–10 s, Neustart nach 10 s. */
export function printerTimings(testSec: number | null) {
  if (testSec) return { print: () => testSec * 1000, fetchDelay: () => 5000 + Math.random() * 5000, startDelay: () => 10_000 };
  return { print: () => (8 + Math.random() * 4) * 60_000, fetchDelay: () => (20 + Math.random() * 40) * 1000, startDelay: () => (2 + Math.random() * 3) * 60_000 };
}

export class Printer {
  state: PrintState = 'printing';
  layer = 0; headX = 0; objIdx = 0;
  private dir = 1; private tHead = 0; private tLayer = 0; private layerMs = 60_000;
  private park: { gy: number; hx: number } | null = null; private tPark = 0;
  /** Zeitpunkt (performance.now), ab dem abgeholt bzw. neu gestartet werden darf */
  fetchAt = Infinity; startAt = Infinity;
  ledOverride: string | null = null;

  constructor(private t = printerTimings(null)) {
    // Beim Laden: plausibel mitten im Druck (zufällige Schicht, zufälliges Objekt)
    this.objIdx = Math.floor(Math.random() * OBJS.length);
    this.begin(performance.now(), Math.floor(Math.random() * 7));
  }
  get obj(): PrintObj { return OBJS[this.objIdx] ?? OBJS[0]; }

  private begin(now: number, layer = 0) {
    this.state = 'printing'; this.layer = layer; this.headX = 0; this.dir = 1; this.park = null;
    this.layerMs = this.t.print() / 8; this.tLayer = now; this.tHead = now; this.fetchAt = this.startAt = Infinity;
  }
  private finish(now: number) {
    this.state = 'done'; this.layer = 8;
    // Kopf parkt in 1-px-Schritten: von der letzten Schichthöhe (gy 23) nach gy 14, headX → +8
    this.park = { gy: 31 - 8, hx: this.headX }; this.tPark = now;
    this.fetchAt = now + this.t.fetchDelay();
  }

  tick(now: number) {
    if (this.state === 'printing') {
      if (now - this.tHead >= 300) {                       // Kopf pendelt ±3 px alle 300 ms
        this.tHead = now;
        if (this.headX + this.dir > 3 || this.headX + this.dir < -3) this.dir = -this.dir;
        this.headX += this.dir;
      }
      if (now - this.tLayer >= this.layerMs) {              // nächste Schicht, X-Achse 1 px höher
        this.tLayer = now; this.layer++;
        if (this.layer >= 8) this.finish(now);
      }
    } else if (this.state === 'done' && this.park && now - this.tPark >= 60) {
      this.tPark = now;
      const p = this.park;
      if (p.gy > 14) p.gy--; else if (p.hx < 8) p.hx++; else this.park = null; // geparkt → Design-Zustand done
    }
  }

  /** Teil entnommen (Figur greift) */
  take(now: number) { this.state = 'empty'; this.layer = 0; this.park = null; this.fetchAt = Infinity; this.startAt = now + this.t.startDelay(); }
  /** Taste gedrückt: nächstes Objekt drucken */
  start(now: number) { this.objIdx = (this.objIdx + 1) % OBJS.length; this.begin(now); }
  /** D-Taste im Zustand printing: sofort fertig */
  finishNow(now: number) { if (this.state === 'printing') { this.layer = 8; this.finish(now); this.fetchAt = now; } }

  view(now: number): PrinterView {
    let led = this.ledOverride;
    if (!led && this.state === 'done') led = Math.floor(now / 500) % 2 ? LED_OFF : LED_YELLOW; // „LED gelb blinkt“
    return { state: this.state, layer: this.layer, headX: this.headX, obj: this.obj, park: this.park, led };
  }
}
export const LED = { OFF: LED_OFF, GREEN: LED_GREEN, YELLOW: LED_YELLOW };
export { printerVals };
