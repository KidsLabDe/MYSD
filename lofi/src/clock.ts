// Echte Uhr oder Testuhr: ?speed=60 (60× schneller), ?now=10:40 (fiktive Startzeit heute), ?date=2026-09-28 (fiktiver Tag)
export class Clock {
  readonly speed: number;
  readonly test: boolean;
  private base: number;
  private t0 = performance.now();
  constructor(q: URLSearchParams) {
    this.speed = Math.max(0.01, Number(q.get('speed')) || 1);
    const nowP = q.get('now');
    let base = Date.now();
    const dateP = q.get('date');
    const dm = dateP?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dm) { const d = new Date(base); d.setFullYear(Number(dm[1]), Number(dm[2]) - 1, Number(dm[3])); base = d.getTime(); }
    if (nowP && /^\d{1,2}:\d{2}(:\d{2})?$/.test(nowP)) {
      const [h, m, s] = nowP.split(':').map(Number);
      const d = new Date(base); d.setHours(h, m, s || 0, 0); base = d.getTime();
    }
    this.base = base;
    this.test = this.speed !== 1 || !!nowP || !!dm;
  }
  now() { return this.test ? this.base + (performance.now() - this.t0) * this.speed : Date.now(); }
}
