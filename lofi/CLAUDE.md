# Hackday-Dashboard (MakeYourSchool) – Bauanleitung

Ein Vollbild-Dashboard für Hackdays, das am Beamer läuft. Es ist eine Pixel-Art-Lo-Fi-Szene: ein Schreibtisch mit Röhrenmonitor, ein Fenster mit Jalousie und ein Wandkalender mit den Phasen des Tages. Eine Figur läuft ins Bild, streicht beendete Phasen durch und bedient die Jalousie. Das Wetter im Fenster entspricht dem echten Wetter vor Ort.

Das Design ist fertig und liegt in `design/`. Aufgabe ist, es **pixelgenau** umzusetzen und zum Leben zu erwecken, nicht es neu zu gestalten.

---

## 1. Die Designdateien lesen

`design/*.dc.html` sind Quelldateien eines Design-Canvas. Sie sind **Referenz**, nicht lauffähiger Code:

- Das Bildmaterial steckt als **inline SVG** darin. Das SVG sollst du übernehmen.
- `{{name}}` sind Platzhalter. Ihre Werte berechnet die `renderVals()`-Funktion im `<script type="text/x-dc">` am Dateiende. Dort steht die ganze Zustandslogik: welches Wetter welche Farben hat, wie hoch die Jalousie ist, welche Pose welche Transforms nutzt.
- `<sc-if value="…">` ist ein bedingter Block, `<sc-for list="…">` eine Schleife, `<dc-import name="X" …>` bettet `X.dc.html` mit Props ein.
- `./support.js` ist die Laufzeit des Canvas. Sie wird **nicht** gebraucht.
- `canvas.json` enthält nur die Anordnung der Tafeln und einen Handoff-Zettel (`notes.handoff`). Den solltest du lesen.

Reine Referenz-Tafeln (nicht nachbauen, nur lesen): `Computer_States`, `Fenster_Zustaende`, `Person_Posen`, `Jalousie_Sequenz`, `Animation_Ablauf`. Die letzte beschreibt Timing, Jalousie-Logik und das Wetter-Mapping.

## 2. Pixel-Raster (wichtig)

- Die Szene ist **320 × 180 Pixel**. Ein Pixel entspricht 6 CSS-px, das ergibt 1920 × 1080.
- Alle SVGs nutzen `viewBox` in Pixel-Einheiten und `shape-rendering="crispEdges"`. So beibehalten.
- Positionen und Bewegungen nur in **ganzen Pixeln**, also 6-px-Schritten bei 1920 Breite. Keine Sub-Pixel-Easings bei Figur und Jalousie. Bewegung soll „steppen“ wie bei Sprites.
- Die Bühne ist ein festes 1920×1080-Element und wird per `transform: scale()` auf das Fenster eingepasst, Letterbox bei anderem Seitenverhältnis. Möglichst **ganzzahlige Skalierung** (z. B. 1× bei 1080p, 2× bei 4K). Sonst `image-rendering: pixelated` und Skalierung auf Vielfache von 1/6.

## 3. Ebenen (von hinten nach vorn), alle `position:absolute` auf der 1920×1080-Bühne

| # | Ebene | Quelle | Position (px) |
|---|---|---|---|
| 1 | Wand, Boden, Ranke + Fenster | `Room_Back.dc.html` (bettet `Window.dc.html` ein) | 0, 0 |
| 2 | Kalender | `Calendar.dc.html` | left 1476, top 36 |
| 3a | Person **hinter** dem Tisch | `Person.dc.html` | top 378, left variabel, wenn left < 1392 |
| 4 | Schreibtisch, Pflanzen, Lichtfleck | `Room_Front.dc.html` | 0, 0 |
| 3b | Person **vor** dem Tisch | `Person.dc.html` | top 378, wenn left ≥ 1392 |
| 5 | Nacht-Overlay `rgba(12,16,34,.45)` | – | nur bei Wetter `nacht` |
| 6 | Computer | `Computer.dc.html` | left 828, top 360 |

Die Person ist **ein** Element, das je nach x-Position die Ebene wechselt (z-index). Bei x = 1392 endet der Tisch, der Wechsel ist dort unsichtbar.

## 4. Komponenten und ihre Zustände

- **Window** (`weather`, `blinds 0–100`):
  - Jalousiehöhe `round(88·b/100/3)·3` Pixel, der Rest steht in `renderVals`.
  - Lichtstreifen auf Wand, Tisch und Boden hängen von Wetter und Jalousie ab. `Room_Front` bekommt dieselben Props.
- **Calendar** (`struck 0–8`): Zeilen < struck sind durchgestrichen (Pixel-Strich, 45 % Deckkraft, Haken), Zeile == struck ist „JETZT“. Zeile i liegt lokal bei y = 156 + i·60, Höhe 60.
- **Computer** (`state`: laeuft | endspurt | pause | ende): Countdown, Phasenname, Fortschrittsbalken (16 Zellen), „Nächste“, LED-Farbe. Die Beispieltexte in `renderVals` werden durch echte Daten ersetzt.
- **Person** (`pose`, `marker`):
  - Posen: stand, walkA, walkB, reach, strike, grab, pullA, pullB.
  - Rechter Arm: drei Sprite-Varianten (down/up/diag), **nicht rotieren**.
  - Stift nur beim Kalender, bei grab/pullA/pullB immer aus.

## 5. Laufzeit-Logik

### Konfiguration
`public/event.json` (Vorlage: `event.example.json`) enthält Titel, Datum, Ort mit Koordinaten und die Phasen mit Start, Ende, Jalousie-Stufe und Computer-Zustand. Sie wird beim Start geladen. Ohne Build-Schritt änderbar.

### Zeitsteuerung
- Die aktuelle Phase ergibt sich aus Uhrzeit, Konfiguration und **manuellem Offset**.
- Countdown bis zum Ende der aktuellen Phase. In den letzten 5 Minuten wird `state` zu `endspurt`.
- Phasen mit `"type": "pause"` bekommen `state` `pause`, nach der letzten Phase `ende`.

### Animations-Warteschlange
Animationen laufen nie parallel. Eine Queue arbeitet Sequenzen nacheinander ab.
- **Phase endet** (Tafel „Abläufe“, Teil A): Bildschirm blinkt 3×, Figur läuft von rechts (left 1968) in 6-px-Schritten zu left 1392 (walkA/walkB alle 180 ms), reach bzw. strike, Strich per `clip-path` in 6-px-Stufen aufdecken (~0,8 s), Haken, „JETZT“ springt weiter.
  - Unterscheidet sich `blinds` der neuen Phase: Figur läuft **ohne Stift** hinter dem Tisch nach left 462 und macht Sequenz B.
  - Sonst rechts raus.
- **Jalousie** (Teil B, Tafel „Jalousie-Animation“): Zyklus grab → pullA → pullB je 150 ms, pro Zyklus ±20 %, bis zum Zielwert. Der Griff der Schnur (`cord-handle` im Window) folgt der Hand. Dann rechts raus.
- Beim Laden oder Neuladen mitten am Tag **keine** nachgeholten Animationen. Direkt den korrekten Endzustand zeigen.

### Wetter
- Open-Meteo, kein Key: `https://api.open-meteo.com/v1/forecast?latitude=…&longitude=…&current=weather_code,is_day`.
- Alle 15 Minuten abrufen.
- Mapping:

| Wetter | Bedingung |
|---|---|
| `nacht` | `is_day = 0` (hat Vorrang) |
| `sonnig` | Code 0–1 |
| `bewoelkt` | Code 2–3, 45, 48 |
| `regen` | Code 51–67, 80–82 |
| `schnee` | Code 71–77, 85–86 |
| `gewitter` | Code 95–99 |

- Bei Fehler oder offline: letzten Wert behalten, sonst `sonnig`. Das Dashboard darf nie daran scheitern.
- Regen und Schnee: Tropfen und Flocken in 1-Pixel-Schritten nach unten wandern lassen, gewrappt, innerhalb der Glasfläche. Gewitter: Blitz alle 6–12 s zweimal kurz aufblitzen.

## 6. Manuelle Steuerung (Pflicht, Hackdays laufen nie nach Plan)

Tastenkürzel am Beamer-Laptop, dazu ein dezentes Overlay (2 s eingeblendet), das die Aktion bestätigt:

| Taste | Aktion |
|---|---|
| `→` | nächste Phase jetzt (löst die Abhak-Animation aus) |
| `←` | eine Phase zurück (ohne Animation) |
| `+` / `-` | aktuelle Phase ±5 min verlängern (verschiebt alle folgenden) |
| `P` | Countdown pausieren/fortsetzen |
| `J` | Jalousie-Sequenz manuell auf/zu |
| `W` | Wetter durchschalten (Test) |
| `F` | Vollbild |

Der Offset wird in `localStorage` gespeichert, damit ein Neuladen ihn nicht verliert. Reset über `R` mit Bestätigung.

## 7. Testmodus

- URL-Parameter `?speed=60` lässt die Zeit 60× schneller laufen.
- `?now=10:40` setzt eine fiktive Startzeit.
- `?weather=regen` erzwingt ein Wetter.

## 8. Technik

- Vite + TypeScript, **kein** UI-Framework nötig. SVG-Komponenten als Funktionen, die DOM oder SVG-Strings erzeugen und per Props aktualisiert werden.
- Fonts lokal einbinden (offline!): `@fontsource/vt323`, `@fontsource/pixelify-sans`, `@fontsource/press-start-2p`.
- Ergebnis: `npm run build` erzeugt einen statischen Ordner, der aus jedem Webserver oder als Datei im Browser läuft. Bereit für Vercel.
- Keine Tracker, keine externen Requests außer Open-Meteo.

## 9. Abnahme

- [ ] Bei 1920×1080 deckungsgleich mit `Main.dc.html` (Screenshot-Vergleich bei gleichen Props).
- [ ] Alle 8 Posen, 6 Wetter, 4 Computer-Zustände und Jalousie 0–100 % darstellbar.
- [ ] Ein ganzer Tag läuft im Testmodus (`?speed=120`) ohne Fehler durch, jede Phase wird abgehakt, und die Jalousie folgt der Konfiguration.
- [ ] Alle Tastenkürzel funktionieren. Nach einem Neuladen stimmen Offset und Zustand.
- [ ] Ohne Internet läuft alles außer dem Live-Wetter.
- [ ] Die Figur bewegt sich nur in ganzen Pixeln, und nichts verschwimmt.
