// Nach dem Build: Liesmich dazulegen und prüfen, dass keine externen URLs außer Open-Meteo drin sind
// Aufruf: node tools/postbuild.mjs [mysd]
import { readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
const mysd = process.argv[2] === 'mysd';
const out = mysd ? (process.env.MYSD_OUT || '../public/lofi') : 'dist';
const html = readFileSync(`${out}/index.html`, 'utf8');
const allowed = mysd ? /open-meteo\.com|w3\.org|raw\.githubusercontent\.com/ : /open-meteo\.com|w3\.org/;
const urls = [...new Set(html.match(/https?:\/\/[a-z0-9.-]+/gi) || [])].filter((u) => !allowed.test(u));
if (urls.length) { console.error('Externe URLs im Build:', urls); process.exit(1); }
if (existsSync(`${out}/event.json`)) rmSync(`${out}/event.json`); // für den Laptop gilt event.js
if (existsSync(`${out}/test-event8.json`)) rmSync(`${out}/test-event8.json`); // nur für Tests
if (mysd) { console.log(`${out}/ fertig (MYSD):`, (html.length / 1024).toFixed(0), 'KB'); process.exit(0); }
writeFileSync('dist/LIESMICH.txt', `HACKDAY-DASHBOARD
=================

Starten:   index.html doppelklicken (Chrome, Edge, Firefox oder Safari).
           Die Datei läuft ohne Internet. Nur das Live-Wetter braucht Internet.
Vollbild:  F drücken.
Beamer:    Bildschirm spiegeln oder Fenster auf den großen Bildschirm ziehen, dann F.

Poster: in event.js "poster": "papier" | "gerahmt" | "banner" | "duoton".
           Der Ordner assets/ muss neben index.html liegen bleiben.

Plan ändern: event.js mit einem Texteditor öffnen und Zeiten, Namen, Ort
(latitude/longitude für das Wetter) und Jalousie (0 = offen … 100 = zu) anpassen.
Danach die Seite neu laden (Cmd+R / F5). Maximal 8 Phasen.
"type": "pause" markiert eine Pause. Optional "screen": "KURZNAME" für den Monitor.

Tasten:
  →      nächste Phase jetzt (mit Abhak-Animation)
  ←      eine Phase zurück
  + / -  aktuelle Phase 5 Minuten länger / kürzer (alles danach verschiebt sich)
  P      Countdown pausieren / fortsetzen
  J      Jalousie auf / zu
  W      Wetter durchschalten (Test), nach "nacht" wieder live
  F      Vollbild
  R      zweimal drücken: alle Änderungen zurück auf den Plan

Änderungen (+, -, →, ←, P, J) bleiben beim Neuladen erhalten.

Psst: G · A · M · E schnell hintereinander tippen startet das Spiel „Bug-Jagd“ (ESC beendet).

Testmodus (an die Adresse anhängen):
  index.html?speed=60          Zeit läuft 60× schneller
  index.html?now=10:40         so tun, als wäre es 10:40
  index.html?weather=regen     Wetter erzwingen
  index.html?debug             Debug-Panel
`);
console.log('dist/ fertig:', (html.length / 1024).toFixed(0), 'KB');
