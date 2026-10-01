// Live-Wetter über Open-Meteo (kein Key). Fällt nie aus: Fehler → letzter Wert, sonst sonnig.
import { WEATHERS, type Weather } from './types';

export function mapWeather(code: number, isDay: number): Weather {
  if (isDay === 0) return 'nacht';
  if (code <= 1) return 'sonnig';
  if (code <= 3 || code === 45 || code === 48) return 'bewoelkt';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'regen';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'schnee';
  if (code >= 95 && code <= 99) return 'gewitter';
  return 'bewoelkt';
}

const LS = 'hackday:weather';
const INTERVAL = 15 * 60_000;

export class WeatherService {
  live: Weather = 'sonnig';
  /** W-Taste: Testwetter (null = live) */
  manual: Weather | null = null;
  forced: Weather | null = null;
  lastOk = 0;
  status = 'noch nicht abgerufen';

  constructor(private lat: number, private lon: number, forced: string | null) {
    if (forced && (WEATHERS as readonly string[]).includes(forced)) this.forced = forced as Weather;
    try { const v = localStorage.getItem(LS); if (v && (WEATHERS as readonly string[]).includes(v)) this.live = v as Weather; } catch { /* egal */ }
  }

  get current(): Weather { return this.forced ?? this.manual ?? this.live; }

  private timer = 0;
  private inflight: AbortController | null = null;
  private onOnline = () => void this.fetchNow();

  start() {
    if (this.forced) { this.status = 'erzwungen per ?weather'; return; }
    void this.fetchNow();
    this.timer = window.setInterval(() => void this.fetchNow(), INTERVAL);
    window.addEventListener('online', this.onOnline);
  }

  stop() {
    this.inflight?.abort();
    clearInterval(this.timer);
    window.removeEventListener('online', this.onOnline);
  }

  async fetchNow() {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${this.lat}&longitude=${this.lon}&current=weather_code,is_day`;
    const ctl = new AbortController();
    this.inflight = ctl;
    const to = setTimeout(() => ctl.abort(), 10_000);
    try {
      const r = await fetch(url, { signal: ctl.signal, cache: 'no-store' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const j = await r.json();
      const code = Number(j?.current?.weather_code), isDay = Number(j?.current?.is_day);
      if (!Number.isFinite(code) || !Number.isFinite(isDay)) throw new Error('unerwartete Antwort');
      this.live = mapWeather(code, isDay);
      this.lastOk = Date.now();
      this.status = `ok (Code ${code}, is_day ${isDay})`;
      try { localStorage.setItem(LS, this.live); } catch { /* egal */ }
    } catch (e) {
      this.status = 'Fehler: ' + (e as Error).message + ' – behalte ' + this.live;
    } finally { clearTimeout(to); }
  }

  /** W: sonnig → … → nacht → live → sonnig … */
  cycle(): string {
    if (this.manual === null) this.manual = WEATHERS[0];
    else {
      const i = WEATHERS.indexOf(this.manual);
      this.manual = WEATHERS[i + 1] ?? null;
    }
    return this.manual ?? 'live (' + this.live + ')';
  }
}
