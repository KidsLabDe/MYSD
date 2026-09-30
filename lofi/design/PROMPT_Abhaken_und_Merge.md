> **ERLEDIGT / ersetzt durch `PROMPT_Update_Komplett.md`.** Nicht mehr verwenden.

> **Stand-Hinweis:** Teil 1 (Zusammenführen) ist bereits erledigt. `design/` enthält jetzt Poster und Hoodie-Logo, siehe `design/CHANGES.md`, Update 3. Überspring Teil 1 und prüf nur kurz, dass `design-update/` nichts enthält, was in `design/` fehlt.
> Neu dazugekommen und ebenfalls umzusetzen: Blickrichtungen und Winken (CHANGES Update 2) sowie der 3D-Drucker, Variante 2, mit Druckzyklus (Update 3).

# Auftrag für Claude Code: Design zusammenführen und Abhaken in allen 8 Zeilen umsetzen

Es gibt aktuell ZWEI Design-Stände:

- **`design/`**: Das ist der Hauptstand. Neu darin sind die Holzbank, die neuen Schreib-Arme, `stepA`/`stepB`, der wachsende Strich im Kalender, die Ebene „ganzVorne“ und die neue Tafel `Kalender_Abhaken.dc.html`. Alle Details stehen in `design/CHANGES.md`.
- **`design-update/`**: Das KidsLab-Poster (`Poster.dc.html`, `Poster_Varianten.dc.html`, PNGs in `assets/`) und das Hoodie-Logo (`<g id="hoodie-logo">` in `Person.dc.html`). Die Einzelheiten stehen in `design-update/UPDATE_PROMPT.md`.

Lies zuerst `CLAUDE.md`, `design/CHANGES.md`, `design-update/UPDATE_PROMPT.md` und alle betroffenen `.dc.html`. Danach arbeitest du in zwei Teilen.

## Teil 1: Designdateien zusammenführen (nur `design/`, noch kein Code)

Ziel: `design/` ist danach der EINZIGE, vollständige Stand. Übernimm aus `design-update/` nur das Poster und das Hoodie-Logo. Alles andere in `design/` ist neuer und bleibt so.

1. `design/Poster.dc.html` und `design/Poster_Varianten.dc.html` liegen schon in `design/`. Die Bilder darin zeigen aber noch auf `../assets/…`, und diesen Ordner gibt es nicht.
   - Die Pfade auf `./assets/…` umstellen.
   - `design-update/assets/*.png` nach `design/assets/` kopieren.
2. `design/Room_Back.dc.html`:
   - Den Poster-Block aus `design-update/Room_Back.dc.html` einfügen. Das ist der `<div>` mit `dc-import name="Poster"` bei left 972 / top 30, 378×288.
   - Die Prop `poster` in `data-props` und `renderVals()` ergänzen.
   - Die Bank-Gruppe `#bench` bleibt.
3. `design/Person.dc.html`:
   - Die zwei alten Aufnäher-Rects (`x="17" y="38"` #E0A94A und `x="19" y="41"` #C4493A) durch die komplette Gruppe `<g id="hoodie-logo">` aus `design-update/Person.dc.html` ersetzen, Koordinaten 1:1.
   - Alle neuen Arme, stepA/stepB und die Props `arm`/`armDy` bleiben.
4. `design/Main.dc.html`:
   - Die Prop `poster` (enum papier|gerahmt|banner|duoton, Default papier) ergänzen und an `Room_Back` durchreichen.
   - **Computer bleibt bei left 828 / top 360.** Die 736/348 aus `design-update/Main.dc.html` NICHT übernehmen.
5. `design/canvas.json`:
   - Die Tafeln `Poster.dc.html` und `Poster_Varianten.dc.html` in `boards` und `order` eintragen, ohne Überlappung mit bestehenden Tafeln.
   - Im Handoff-Zettel das Poster ergänzen: Ebene 1, left 972 / top 30, 378×288, feineres Raster 3 px, absichtlich.
6. `design/CHANGES.md` um einen Abschnitt „Zusammengeführt aus design-update“ ergänzen.
7. Zeig mir einen kurzen Diff-Überblick. Den Ordner `design-update/` löschst du erst nach meinem OK.

## Teil 2: Im Code umsetzen

Referenz ist ausschließlich das zusammengeführte `design/`. Umsetzen:

1. **Poster** und 2. **Hoodie-Logo** sind im Code schon umgesetzt (`src/components/poster.ts`, `#hoodie-logo` in `src/components/person.ts`, `public/assets/`).
   - Nur prüfen, dass beides mit den neuen Armen, stepA/stepB und der Bank noch stimmt.
   - Das Hoodie-Logo darf von keinem neuen Arm verdeckt werden, außer wo der Arm wirklich davor liegt.
   - Die Bank darf das Poster nicht berühren. Das Poster endet bei Szene-y 53, die Bank beginnt bei y 143.
3. **Holzbank** in der Room_Back-Ebene.
4. **Person:**
   - Neue Armvarianten `steil`, `flach`, `waagrecht`, `leichtRunter`, `runter` als gezeichnete Sprites.
   - Posen `stepA`/`stepB` inklusive Hosenbein-Verlängerung bei stepB.
   - Arm-Override (`arm`, `armDy`): Beine der Pose bleiben, kein Körper-Wippen.
   - Die bestehenden 8 Posen müssen pixelgleich bleiben.
5. **Kalender:** Der Strich wächst in 1-px-Schritten (`drawRow`/`drawLen`, sichtbare Breite `(2 + drawLen) · 6` px).
6. **Ebene „ganzVorne“:** Person über Tisch UND Computer. Nachts `filter: brightness(0.6)`.
7. **Animations-Queue, Teil A „Durchstreichen“:**
   - Werte je Zeile (Standfläche, Arm, left-Bereich, armDy) aus der Tabelle in `design/CHANGES.md`.
   - Ablauf:
     1. Zeilen 0–1 auf die Bank steigen (stand → stepA → stepB → stand, je 150 ms, top 378/378/324/270).
     2. Arm der Zeile setzen.
     3. Strich wächst 62 px à ≈ 32 ms. Pro Pixel: `left = (Linienende − Spitze-x) · 6`, `armDy` nach Linienstufe (y5/y4), Beine walkA/walkB alle 3 px.
     4. Absteigen (Zeilen 0–1), Zeile 45 %, Haken, „JETZT“ weiter.
   - Beim Abhaken ist die Person in Ebene ganzVorne.
8. **Jalousie-Gang (Teil B):** Die Person läuft in Ebene ganzVorne, also VOR Tisch und Computer, ohne Stift zur Schnur bei left 462.

## Prüfen

- **Screenshot-Vergleich** mit den vorhandenen Tools in `tools/` (z. B. `compare.mjs`, `shot.mjs`) gegen:
  - `design/Kalender_Abhaken.dc.html`: alle 16 Ausschnitte plus die Aufsteige-Sequenz. Die Stiftspitze muss exakt auf der Linie sitzen.
  - `design/Person_Posen.dc.html`: alte und neue Posen, Hoodie-Logo in jeder Pose sichtbar und nicht vom Arm verdeckt.
  - `design/Main.dc.html` mit Poster `papier`.
- **Ganzer Tag im Testmodus** (`?speed=120`): jede der 8 Zeilen wird abgehakt, die Figur steigt bei Zeile 0 und 1 auf die Bank und wieder herunter, die Jalousie-Gänge laufen vor dem Tisch.
- `npm run build` und `npm test` müssen durchlaufen.
- **Am Ende:** Liste der geänderten Dateien und ehrlich, was noch abweicht.

## Regeln

- Bestehende Grafik nicht neu gestalten. Nur ganze Pixel, keine Rotation, keine Sub-Pixel-Easings.
- Zeig mir VOR Teil 1 einen kurzen Plan (5–8 Punkte) und warte auf mein OK.
- Zeig mir zwischen Teil 1 und Teil 2 den Diff-Überblick und warte wieder auf mein OK.
