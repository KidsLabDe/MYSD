import { describe, expect, it } from 'vitest';
import { dashboardAction } from './arcade/keys';
import {
  ENTER_MS, K_OFF, K_SPOT, K_TURN_MS, LEAVE_AT, TALK_MS, TALK_STEPS, kollegeAt, kollegeTotalMs, nextBlink,
} from './kollege';

describe('Kollege: Taste V', () => {
  it('V und v starten den Vortrag', () => {
    expect(dashboardAction('v')).toBe('talk');
    expect(dashboardAction('V')).toBe('talk');
  });
  it('V war vorher frei: keine andere Aktion hat talk', () => {
    for (const k of ['j', 'w', 'f', '?', 'd', 'k', 'h', 'l']) expect(dashboardAction(k)).not.toBe('talk');
  });
});

describe('Kollege: Vortrags-Timeline', () => {
  it('Summe der Dauern: 14,6 s Vortrag + 4×(180+180) Applaus + 4×(250+250) Winken', () => {
    expect(TALK_STEPS.slice(0, 8).map((s) => s.ms)).toEqual([1500, 3000, 2000, 600, 2000, 1500, 2000, 2000]);
    expect(TALK_MS).toBe(14_600 + 1_440 + 2_000);
    expect(LEAVE_AT).toBe(ENTER_MS + TALK_MS);
  });
  it('Reihenfolge wie auf der Tafel Kollege_Vortrag', () => {
    const order = TALK_STEPS.map((s) => s.pose);
    expect(order.slice(0, 8)).toEqual(['open', 'talk', 'point', 'clicker', 'talk', 'pointUp', 'think', 'talk']);
    expect(order.slice(8, 16)).toEqual(['clap', 'open', 'clap', 'open', 'clap', 'open', 'clap', 'open']);
    expect(order.slice(16)).toEqual(['waveA', 'waveB', 'waveA', 'waveB', 'waveA', 'waveB', 'waveA', 'waveB']);
  });
  it('läuft von links herein (view right), in 6-px-Schritten, bis zum Standplatz', () => {
    expect(kollegeAt(0)).toMatchObject({ x: K_OFF, view: 'right', pose: 'walkA' });
    for (let t = 0; t < ENTER_MS; t += 37) {
      const k = kollegeAt(t)!;
      expect(Math.abs(k.x % 6)).toBe(0);
      expect(k.x).toBeLessThanOrEqual(K_SPOT);
    }
    expect(kollegeAt(ENTER_MS - K_TURN_MS / 2)).toMatchObject({ x: K_SPOT, view: 'right', pose: 'stand' });
    expect(kollegeAt(ENTER_MS)).toMatchObject({ x: K_SPOT, view: 'front', pose: 'open' });
  });
  it('spricht in talk/point/pointUp/open/clicker: Mund wechselt alle 200 ms', () => {
    const t = ENTER_MS + 1500; // Beginn talk
    expect(kollegeAt(t)?.face).toBe('talk');
    expect(kollegeAt(t + 200)?.face).toBe('smile');
    expect(kollegeAt(t + 400)?.face).toBe('talk');
    const think = ENTER_MS + 1500 + 3000 + 2000 + 600 + 2000 + 1500; // Beginn think
    expect(kollegeAt(think)).toMatchObject({ pose: 'think', face: 'auto' });
  });
  it('blinzelt nur in der Vorderansicht', () => {
    expect(kollegeAt(ENTER_MS + 10, null, true)?.face).toBe('blink');
    expect(kollegeAt(10, null, true)?.face).toBe('auto');
    expect(nextBlink(0)).toBe(3000);
    expect(nextBlink(0.999)).toBeLessThan(6000);
  });
  it('geht nach dem Vortrag nach links (view left) hinaus und ist dann weg', () => {
    expect(kollegeAt(LEAVE_AT + 10)).toMatchObject({ x: K_SPOT, view: 'left', pose: 'stand' });
    expect(kollegeAt(LEAVE_AT + K_TURN_MS + 200)).toMatchObject({ view: 'left' });
    expect(kollegeAt(LEAVE_AT + K_TURN_MS + 200)!.x).toBeLessThan(K_SPOT);
    expect(kollegeAt(kollegeTotalMs())).toBeNull();
  });
});

describe('Kollege: Abbruch per V', () => {
  it('mitten im Vortrag: geht sofort ab, von seinem Standplatz', () => {
    const abort = ENTER_MS + 5000;
    expect(kollegeAt(abort - 1, abort)).toMatchObject({ view: 'front' });
    expect(kollegeAt(abort, abort)).toMatchObject({ x: K_SPOT, view: 'left', pose: 'stand' });
    expect(kollegeTotalMs(abort)).toBeLessThan(kollegeTotalMs());
    expect(kollegeAt(kollegeTotalMs(abort), abort)).toBeNull();
  });
  it('schon beim Hereinlaufen: dreht an Ort und Stelle um', () => {
    const abort = 500;
    const x = kollegeAt(abort - 1)!.x;
    expect(kollegeAt(abort, abort)).toMatchObject({ x, view: 'left' });
    expect(kollegeAt(kollegeTotalMs(abort), abort)).toBeNull();
  });
  it('ein Abbruch nach dem Ende ändert nichts', () => {
    expect(kollegeTotalMs(LEAVE_AT + 99_999)).toBe(kollegeTotalMs());
  });
});
