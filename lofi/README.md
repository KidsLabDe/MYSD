# Hackday-Dashboard „Lo-Fi“ (MakeYourSchool)

Zusätzliche Version des MYS-Boards als Pixel-Art-Szene: Schreibtisch mit Röhrenmonitor, Fenster mit Jalousie und Live-Wetter, Wandkalender, den eine Figur abhakt.
Das Original-Board im Hauptverzeichnis bleibt unverändert. Diese Version liegt komplett in `lofi/` und als fertige Datei in `public/lofi/`.

## Im MYSD-Repo

- **Adresse:** https://kidslabde.github.io/MYSD/lofi/ (wird mit dem normalen Pages-Deploy veröffentlicht, weil Vite `public/` 1:1 übernimmt).
- **Plan:** kommt aus `src/data/hackday.json`, also genau der Datei, die der `new-hackday`-Skill pflegt. Die Seite lädt sie live von `raw.githubusercontent.com` und prüft alle 5 Minuten auf Änderungen. Ohne Internet nimmt sie den Stand, der beim letzten Bauen eingebettet wurde.
- **Übersetzung** (`src/mysd.ts`):
  - Tag wie im Original: heute, sonst der nächste Tag, nach dem Event der letzte.
  - `phase` → Jalousie offen (0 %), `meal`/`break` → halb (50 %) und Computer „Pause“, `talk` → zu (100 %).
  - Lücke zwischen zwei Einträgen → Computer „PAUSE“, Jalousie halb.
  - Kalender-Titel = `boardTitle`, Unterzeile = Datum · Schulname (Teil von `title` nach „·“).
  - Mehr als 8 Einträge: Der Kalender zeigt 8 Zeilen und wandert beim Abhaken mit.
- **Wetter-Ort:** steht nicht in `hackday.json`, sondern in `lofi/ort.json` (Name, latitude, longitude, Poster). Bei einer neuen Schule anpassen. Wird ebenfalls live geladen.
- **Neu bauen** (nötig nur für Code-Änderungen oder um den eingebetteten Offline-Stand zu aktualisieren):

  ```bash
  cd lofi
  npm ci
  npm test               # eigene Tests (*.spec-lofi.ts, bewusst nicht vom Haupt-`npm test` erfasst)
  npm run build:mysd     # schreibt ../public/lofi/index.html + assets/
  ```

  Testmodus zusätzlich zu den unten genannten Parametern: `?date=2026-09-28` (fiktiver Tag), `?offline` (nur eingebetteter Stand).
  Ganzer Tag gegen den MYSD-Plan: `public/lofi` per Webserver ausliefern, dann `MYSD_DATE=2026-09-28 BASE=http://localhost:8088/ node tools/dayrun.mjs 120`.

- **Laptop-Version** (ohne Repo, Plan in `event.js`): `npm run build` → `dist/`.

## Laptop-Version

## Am Hackday (ohne Installation)

Ordner **`Dashboard/`** → `index.html` doppelklicken → **F** für Vollbild → Bildschirm auf den Klassenzimmer-Monitor spiegeln.
Plan ändern: `Dashboard/event.js` im Texteditor bearbeiten, Seite neu laden. Details und Tasten: `Dashboard/LIESMICH.txt`.
Läuft offline. Nur das Live-Wetter (Open-Meteo, alle 15 min) braucht Internet.

## Entwicklung

```bash
npm install
npm run dev          # http://localhost:5173/?debug
npm test             # Zeit- und Wetterlogik
npm run build        # dist/ = index.html (eine Datei) + event.js → nach Dashboard/ kopieren
```

Testmodus: `?speed=120`, `?now=10:40`, `?weather=regen`, `?debug`, `?ref` (Designzustand für den Pixelvergleich).

Prüfwerkzeuge (Dev-Server muss laufen, Playwright/Chromium nötig):
- `node tools/compare.mjs`: Build gegen `design/Main.dc.html`, 28 Zustände, pixelgenau. `tools/dcref.js` führt die `.dc.html` so aus wie der Design-Canvas.
- `node tools/dayrun.mjs`: ganzer Tag bei `?speed=120`
- `node tools/keys.mjs`: Tastenkürzel und Persistenz nach dem Neuladen
- `node tools/abhaken.mjs`: 16 Abhak-Frames + 7 Auf-/Absteige-Frames gegen die Tafel `design/Kalender_Abhaken.dc.html`
- `node tools/gen-sprites.mjs`: erzeugt `src/generated/` (Person, Printer3D, Room_Front) wörtlich aus `design/`. Nach jeder Designänderung an diesen Dateien ausführen.
- `node tools/boards.mjs`: Tafeln Person_Ansichten (9), Drucker_Zyklus (10), Kaffee_Pause (8) gegen den Code
- `node tools/dayrun.mjs 120 "" "&print=40&wave=10&coffee=15"`: Tag mit allen Leerlauf-Animationen und Protokoll (Vorrang, Wiederholung, Tasse/Teil)
- `node tools/tipcheck.mjs`: prüft unabhängig, dass die Stiftspitze am Linienende auf der Linie sitzt
- `node tools/logo-poses.mjs`: Hoodie-Logo in allen Posen und Schreib-Armen sichtbar
- `node tools/dayrun.mjs 40 test-event8.json`: Tag mit 8 Phasen (alle Kalenderzeilen), `?event=datei.json` lädt einen anderen Plan (nur mit Dev-Server)

## Leerlauf-Animationen (Design-Update 2–5)

- **3D-Drucker:** 8 Schichten in 8–12 min, Kopf pendelt ±3 px, danach parkt er pixelweise, LED gelb blinkend. Abholen 20–60 s nach „fertig“ (links 456), neu starten 2–5 min später (links 348, LED 2× grün). Objektfolge bulb → rocket → heart → cube. Test: `?print=40` (Abholen dann nach 5–10 s, Neustart nach 10 s).
- **Winken** alle 90–180 s (`?wave=10`), **Kaffeepause** alle 4–8 min (`?coffee=15`).
- **Regeln** (`src/idle.ts`, getestet): Abhaken/Jalousie haben Vorrang und brechen Leerlauf sofort ab (Tasse/Teil springen in den Endzustand). Nicht in den letzten 60 s vor Phasenende, nie zweimal dieselbe Kategorie (Winken / Kaffee / Drucker) hintereinander.
- **Tasten:** D Drucker weiter · K Kaffee · H Winken · L Leerlauf an/aus (gespeichert) · ? Hilfe. D/K/H werden eingereiht, wenn gerade etwas läuft.
- **Laufen** in Seitenansicht (view left/right), Drehen über 120 ms „Seite stand“.

## Easter Egg „Bug-Jagd“ (Design-Update 6)

- **Start:** G · A · M · E innerhalb von 2 s (oder `?arcade`). Die Figur geht zum Computer, der Monitor zoomt auf 1248×888. ESC schließt.
- **Code:** `src/arcade/`
  - `maze.ts`: Labyrinth wörtlich aus `Arcade.dc.html`
  - `game.ts`: Simulation und Bugs
  - `difficulty.ts`, `leaderboard.ts`, `keys.ts`, `render.ts` (Canvas), `screens.ts`
  - `session.ts`: Zoom, Bildschirme, Tasten
  - Bildschirme wörtlich aus `src/generated/Arcade.ts`
- **Rangliste:** localStorage `hackday.bugjagd.v1`, Top 10. Shift+R zweimal im Rangliste-Bildschirm löscht sie.
- **Test:**
  - `?arcade=title|play|name|board&demo` zeigt die Beispielzustände des Designs, `&demo=canvas` das Spielfeld per Canvas.
  - `node tools/arcade-cmp.mjs` vergleicht die Bildschirme mit dem Design, `node tools/arcade-run.mjs` spielt einmal komplett durch.
- **Vorschläge, wo das Design nichts festlegt:**
  - **Start und Tempo:** Glühbirne startet auf Kachel 13/16. Spieltempo 7 Kacheln/s.
  - **Nest:** SYNTAX startet draußen, NULL, LOOP und RACE kommen nach 2/6/10 s aus dem Nest.
  - **Bugs:** Gefangene Bugs kommen nach 3 s zurück. Gefangbare Bugs laufen mit halbem Tempo und blinken in der letzten Sekunde.
  - **Augen:** links 1/3, rechts 2/4, hoch/runter 1/4. Beim Tod blinkt die Glühbirne 3×.
  - **LOOP** läuft per Wegsuche eine Runde um den Block links unter dem Nest.

## Entscheidungen, wo Design und Spezifikation offen waren

- **→** beendet die Phase jetzt. Die nächste beginnt sofort, ihr geplantes Ende bleibt.
- **←** macht die vorherige Phase ab jetzt mit voller Dauer aktiv. Alles danach verschiebt sich.
- **P** friert die Zeit ein. **J** schaltet zwischen 0 und 100 % um und gilt bis zum nächsten Phasenwechsel. **R** muss zweimal gedrückt werden.
- **Vor der ersten Phase:** Zustand `pause` mit Countdown bis zum Start, kein „JETZT“.
- **KidsLab-Poster (Design-Update 29.09.):** Liegt in Ebene 1 bei 972/30. Standard `"poster": "papier"` in `event.json`, weitere Varianten sind `gerahmt`, `banner` und `duoton`. Es ist absichtlich feiner gerastert (3 px pro Pixel). Abweichend vom Update liegt es im DOM *vor* dem Fenster, damit die Lichtstreifen darüber fallen. Die Bilder liegen in `public/assets/` bzw. `Dashboard/assets/`.
- **Hoodie-Logo:** Das KidsLab-Logo ersetzt den gelben Aufnäher. Es liegt in `#body` und macht so jede Pose mit.
- **Computer-Position:** Sie bleibt bei 828/360. Das Design-Update hat 736/348, `tools/ref.html` gleicht das für den Vergleich aus.
- **Jalousie-Gang (auf Wunsch geändert):** Die Figur läuft **vor** Tisch und Computer zur Schnur (left 462), nicht dahinter wie in CLAUDE.md. Dabei verdeckt sie kurz den Monitor. Nachts wird sie per Farbmatrix genauso abgedunkelt wie der Rest der Szene.
- **Schnurgriff:** Der Griff folgt während des Ziehens der Hand und rutscht danach pixelweise auf die Position aus der Designformel.
- **Abhaken (Design-Update „Kalender_Abhaken“):** Die Figur läuft in Ebene ganzVorne zum Linienanfang. Für die Zeilen 0–1 steigt sie auf die Holzbank. Der Strich wächst in 1-px-Schritten (32 ms/px), die Figur trippelt mit, die Stiftspitze sitzt auf der Linie. Die Werte je Zeile kommen aus `design/CHANGES.md` (`strokePose` in `src/anim.ts`, getestet). Nachts bekommt die Ebene ganzVorne laut Design `brightness(0.6)`.
- **`design/Printer3D.dc.html`** enthält zwei Fassungen hintereinander. Der Generator nimmt die erste (neue).
- **Tafel `Kalender_Abhaken`** zeigt noch die kleine Pflanze und keinen Drucker. Der Vergleich stellt das per `?smallPlant=1&printer=0` nach.
- **LED nach dem Druck** blinkt gelb (Tafel), Dampf wippt nur an der Tasse in der Hand.
- **Lange Namen:** Ein zu langer Kalendername wird in seiner Zeile kleiner gesetzt. Auf dem Monitor fällt „· ENDSPURT“ bzw. „NÄCHSTE“ weg, wenn der Platz fehlt. Optional: `"screen": "KURZ"` in `event.json`.
- **Blitz:** Er ist nur beim Aufblitzen sichtbar, im Designstandbild dagegen dauerhaft.
- **Animationen** laufen in Echtzeit. Sprünge (Neuladen, ←, Laptop war im Ruhezustand) zeigen sofort den Endzustand.
