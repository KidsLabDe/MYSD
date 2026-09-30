# Design-Update: Abhaken in allen 8 Kalenderzeilen

Alle Koordinaten sind in Szenenpixeln (1 px = 6 CSS-px), sofern nicht „px“ dabeisteht. Die bestehende Grafik ist unverändert. Es wurde nur ergänzt.

## Dateien

| Datei | Status | Was |
|---|---|---|
| `Room_Back.dc.html` | geändert | neue Gruppe `<g id="bench">` (Holzbank) direkt nach dem Boden |
| `Person.dc.html` | geändert | 5 neue Schreib-Arme, Posen `stepA`/`stepB`, Props `arm` und `armDy` |
| `Calendar.dc.html` | geändert | Props `drawRow`/`drawLen` für den wachsenden Strich (`.strike-draw`) |
| `Main.dc.html` | geändert | Props `arm`, `armDy`, `standOn` (boden/stufe/bank), `layer` (auto/hinten/vorne/ganzVorne) und neue Ebene „Person ganzVorne“ über dem Computer |
| `Animation_Ablauf.dc.html` | geändert | Teil A Schritte 03/04 neu, Teil B: Person läuft vor Tisch und Computer |
| `Person_Posen.dc.html` | geändert | zweite Reihe: stepA, stepB, 5 neue Arme |
| `Kalender_Abhaken.dc.html` | **neu** | Referenztafel: 8 Zeilen × Anfang/Ende und die Aufsteige-Sequenz |
| `canvas.json` | geändert | neue Tafel in `boards`/`order`, Tafeln verschoben, Handoff-Zettel ergänzt |

Die bestehenden 8 Posen (stand, walkA, walkB, reach, strike, grab, pullA, pullB) sind pixelgleich. Die neuen Teile greifen nur, wenn `arm` ≠ `auto` oder die Pose stepA/stepB ist.

## Holzbank (`Room_Back`, `#bench`)

- **Sitzfläche:** x 212–311, y 143–145 (#A8663A), Lichtkante y 143 (#B8703F), Unterkante y 146 (#5E3320).
- **Front:** x 214–309, y 147–158 (#8A4E30), Lichtkante oben und links (#A8683E), zwei Felder (#744024) mit Griffen (#3A2320), dunkle Kante y 159 (#5E3320).
- **Füße:** y 160 (#744024), x 215–219 und 304–308. Der Bodenschatten liegt bei x 210–313, y 161–162 (#1A0F0D, 50 %).
- **Maße:** 18 Pixel hoch (y 143–160) und steht auf dem Boden.
- **Figur darauf:** top 45 (270 px). Die Füße (Sprite-x 10–34) bleiben für left 206–276 auf der Bank.
- **Abweichung vom Auftrag:** Die Bank beginnt bei x 212 statt 220, weil die Figur für Zeile 1 (Arm steil) bis left 206 nach links muss. Das linke Ende liegt teilweise hinter dem rechten Tischbein (Room_Front). Das ist gewollt.

## Neue Armvarianten (`Person.dc.html`, Prop `arm`)

Spitze = dunkles Pixel (#2A1A18), 2×2 groß. „Spitze-x“ ist das rechteste Pixel, „Spitze-y“ die beiden Zeilen, jeweils in Sprite-Koordinaten.

| Arm | Zeile | Spitze x | Spitze y |
|---|---|---|---|
| `steil` | 1 (Bank) | 45–46 | 2–3 |
| `flach` | 4 | 52–53 | 14–15 |
| `waagrecht` | 5 | 55–56 | 24–25 |
| `leichtRunter` | 6 | 53–54 | 34–35 |
| `runter` | 7 | 53–54 | 44–45 |
| `up` (bestehend) | 0, 2 | 37–38 | −8…−7 |
| `diag` (bestehend) | 3 | 56–58 (Stift ohne dunkle Spitze, oberes Pixel) | 5 |

**Prop `arm`** überschreibt die Armvariante der Pose. Die Beine der Pose bleiben erhalten, z. B. walkA/walkB beim Trippeln. Der Körper wippt dann nicht (`body` = 0), damit der Stift ruhig bleibt.

**Prop `armDy`** verschiebt nur den rechten Arm vertikal, für die Stufen der Linie.

**Zwei Abweichungen von der Tabelle im Auftrag:**
- **Zeile 2 (`up` am Boden):** Die dunkle Spitze liegt bei y −8…−7, also 2 px über der Linie. Sie braucht `armDy` +2 (Stufe y5) bzw. +1 (Stufe y4).
- **Zeile 3 (`diag`):** Das oberste Stiftpixel liegt bei y 5. Nötig ist `armDy` −1 (y5) bzw. −2 (y4).

## Positionen je Zeile

**Strichlinie:** lokal x 2–63, also Szene-x 251–**312**. Das letzte Pixel ist 312, nicht 313.

**Stufen:** lokal 2–15 → y5, 16–35 → y4, 36–51 → y5, 52–63 → y4. Linien-Oberkante in der Szene = 32 + 10·i + (5 | 4).

**Formeln:**
- `left = Linienende − Spitze-x`
- `armDy = Linien-Oberkante − (top + Spitze-y oben)`

| Zeile | Stand | top (px) | Arm | left Anfang → Ende (px) | armDy Anfang / Ende |
|---|---|---|---|---|---|
| 0 | Bank | 270 | up | 1284 → 1644 | 0 / −1 |
| 1 | Bank | 270 | steil | 1236 → 1596 | 0 / −1 |
| 2 | Boden | 378 | up | 1284 → 1644 | +2 / +1 |
| 3 | Boden | 378 | diag | 1164 → 1524 | −1 / −2 |
| 4 | Boden | 378 | flach | 1194 → 1554 | 0 / −1 |
| 5 | Boden | 378 | waagrecht | 1176 → 1536 | 0 / −1 |
| 6 | Boden | 378 | leichtRunter | 1188 → 1548 | 0 / −1 |
| 7 | Boden | 378 | runter | 1188 → 1548 | 0 / −1 |

„Anfang“ bedeutet 2 px gezogen (`drawLen` 2, Linienende x 252), „Ende“ 62 px (Linienende x 312).

**Ebene:** Die Figur braucht Positionen links von left 1392. Sie würde dort sonst hinter Tisch, Farn und Computer verschwinden. Beim Abhaken liegt sie deshalb in der neuen Ebene **ganzVorne**, über dem Computer. Nachts bekommt diese Ebene `filter: brightness(0.6)`, weil sie über dem Nacht-Overlay liegt.

## Auf- und Absteigen

| Frame | Pose | top (Szenenpixel / px) | Dauer |
|---|---|---|---|
| 1 | stand | 63 / 378 | – |
| 2 | stepA (rechtes Bein 9 px hoch) | 63 / 378 | 150 ms |
| 3 | stepB (rechter Fuß auf der Bank y 143, linker Fuß am Boden y 161, Hosenbein verlängert) | 54 / 324 | 150 ms |
| 4 | stand (auf der Bank) | 45 / 270 | 150 ms |

- **Absteigen:** stand(270) → stepB(324) → stepA(378) → stand(378), je 150 ms.
- **Arm:** bleibt beim Auf- und Absteigen `down`, der Stift ist sichtbar.
- **Wann:** Die Figur steigt nur für die Zeilen 0 und 1 auf die Bank. Dafür steigt sie an der Startposition der Zeile auf, bei left 1284 bzw. 1236.

## Ablauf „Durchstreichen“ (Tafel Abläufe, Teil A 03/04)

1. Zeilen 0–1: aufsteigen (0,6 s).
2. In die Armvariante der Zeile wechseln, Figur an left(Anfang) stellen.
3. Der Strich wächst in 1-px-Schritten (≈ 32 ms/px, 62 px ≈ 2 s). Pro Schritt `left` +6 px, dazu `armDy` passend zur Stufe. Beine wechseln alle 3 px zwischen walkA und walkB, der Arm hält die Pose.
4. Von der Bank steigen (0,6 s), Zeile auf 45 %, Haken, „JETZT“ springt weiter.

**Jalousie (Teil B):** Die Figur läuft in der Ebene ganzVorne, also **vor** Tisch und Computer, ohne Stift zur Schnur bei left 462.

## Offen / Hinweise

- **Poster und Hoodie-Logo:** Die Änderungen aus `design-update/` sind hier **nicht** eingearbeitet.
  - Die Bank ist eine eigene Gruppe `#bench` und lässt sich ohne Konflikt in `design-update/Room_Back.dc.html` übernehmen.
  - Das Hoodie-Logo liegt im Torso, die neuen Arme in `#armR`. Beides kollidiert nicht.
- **Computer-Position:** In `Main.dc.html` steht der Computer weiterhin bei 828 / 360, wie im Code.

---

# Update 2: Blickrichtungen, Winken, 3D-Drucker-Vorschläge

## Dateien

| Datei | Status | Was |
|---|---|---|
| `Person.dc.html` | geändert | Seiten- und Vorderansicht, Props `view` und `face`, Posen `waveA`/`waveB`. Die Rückenansicht ist in `<sc-if viewBack>` gekapselt und pixelgleich. |
| `Person_Ansichten.dc.html` | **neu** | alle neuen Ansichten plus Regeln für Laufen, Drehen und zufälliges Winken |
| `Room_Front.dc.html` | geändert | Props `tallPlant`, `smallPlant`, `fern` (Default `true`), damit Pflanzen einzeln ausblendbar sind. Nur für die Drucker-Vorschläge. |
| `Printer3D.dc.html` | **neu** | 3D-Drucker, Varianten `box` (32×40) und `open` (46×46), Prop `printing` |
| `Drucker_Vorschlaege.dc.html` | **neu** | drei Szenen-Vorschläge mit Drucker. **Noch nicht entschieden, nicht bauen.** |
| `Animation_Ablauf.dc.html`, `canvas.json` | geändert | Hinweise und neue Tafeln |

## Person: `view` und `face`

- **`view="back"`** (Default): Hier ist alles wie bisher, inklusive Schreib-Armen, stepA/stepB und Jalousie-Posen.
- **`view="right"`**: Seitenansicht mit Profilkopf (Auge, Nase, Ohr, Mund), Kapuze hinten und dem vorderen Arm. Posen `stand`, `walkA` (Schrittstellung, Arm schwingt zurück) und `walkB` (Durchschwingen, Körper −1 px). Stift optional über `marker`.
- **`view="left"`**: dieselben Pixel, gespiegelt mit `translate(44 0) scale(-1 1)`. Das ist ganzzahlig und damit rasterfest.
- **`view="front"`**:
  - Gesicht mit Augen (mit Lichtpunkt), Mund und Wangenröte (#E0909E).
  - Hoodie mit Kordeln und Bauchtasche.
  - Posen `stand`, `waveA` (Hand senkrecht oben) und `waveB` (Hand nach außen gekippt). Gewinkt wird mit dem Arm links im Bild, das ist die rechte Hand der Figur.
  - In der Vorderansicht gibt es keinen Stift.
- **`face`**:
  - `auto` ergibt beim Stehen `smile` und beim Winken `grin` (Lach-Augen, offener Mund).
  - `blink` zeigt geschlossene Augen mit Lächeln.
  - `neutral` zeigt einen geraden Mund.
- **Grenze der Pixel-Art:** Mehr Mimik als diese vier Gesichter liest man bei 6 px pro Pixel auf dem Beamer nicht. Das Lächeln funktioniert über den Mundbogen und die Wangenröte.

## Laufen, Drehen, Winken (Tafel Person_Ansichten)

- **Laufen:** Beim Rein- und Rauslaufen immer Seitenansicht. Von rechts nach links `left`, nach rechts `right`.
- **Drehen:** Seite → Rücken bzw. Rücken → Publikum über **ein** Zwischenbild „Seite stand“ (120 ms).
- **Zufälliges Winken:**
  - **Wann:** Nur bei leerer Warteschlange und wenn die nächste Phase frühestens in 60 s endet. Abstand zufällig 90–180 s, zum Testen `?wave=10`.
  - **Ablauf:**
    1. rein bis left 1500 (ganzVorne)
    2. zum Publikum drehen, smile 400 ms
    3. 3 × waveA/waveB je 250 ms
    4. blink 150 ms, smile 600 ms
    5. raus
  - **Vorrang:** Das Abhaken hat Vorrang und bricht das Winken ab.

## 3D-Drucker: drei Vorschläge

Bei allen drei Vorschlägen bleibt der Bildschirm 348×240 px groß. Ein Drucker-Pixel entspricht 6 px. Die Unterkante liegt bei Sprite-y 44 (box) bzw. 45 (open), also auf der Tischplatte bei Szene-y ≈ 120.

| # | Drucker | Position | Weg fällt | Sonstiges | Fenster sichtbar (grob) |
|---|---|---|---|---|---|
| 1 | box | left 1272 / top 456 | Farn | Computer auf left 732 | 100 % |
| 2 | open | left 84 / top 450 | hohe Pflanze | – | ≈ 95 % (Rahmen offen) |
| 3 | box | left 384 / top 456 | kleine Pflanze | – | ≈ 93 % |

---

# Update 3: Zusammenführung, 3D-Drucker (Variante 2), Druckzyklus

## Zusammengeführt aus `design-update/` (Teil 1 des alten Prompts ist damit erledigt)

- **`Room_Back`:** Das KidsLab-Poster steht bei left 972 / top 30, 378×288. Prop `poster`, Default `papier`.
- **`Person`:** `<g id="hoodie-logo">` ersetzt in der Rückenansicht den gelben Aufnäher.
- **`Poster.dc.html`:** Bildpfade auf `./assets/…`, die PNGs liegen in `design/assets/`.
- **`Main`:** Der Computer bleibt bei 828 / 360.

## 3D-Drucker: entschieden für Variante 2

- **Aufstellung:** Offener Rahmen links auf dem Tisch, left 84 / top 450. Die hohe Pflanze ist aus (`Room_Front` `tall-plant=false` in `Main`).
- **`Printer3D` (Variante `open`) Props:**
  - `state`: printing | done | empty
  - `layer`: 0–8, gedruckte Pixelzeilen
  - `headX`: −4…4
  - `obj`: bulb | cube | rocket | heart
- **Druckbett:** Oberkante Sprite-y 38. Das Objekt wird über ein verschachteltes `<svg>` auf die untersten `layer` Zeilen zugeschnitten.
- **X-Achse:** gy = 31 − layer, Druckkopf `translate(headX 0)`. Die Düse sitzt immer direkt über der obersten Schicht.
- **Geparkt** (done/empty): gy 14, headX +8.
- **LED:**
  - printing: grün
  - done: gelb
  - empty: aus

## Person: Drucker bedienen

- **`armLeft`** (Rückenansicht, linker Arm = links im Bild):
  - `down`
  - `greifen`: Hand x 2–7, y 44–48 = Druckbett-Höhe bei top 378
  - `druecken`: Hand x 1–7, y 36–40 = Taste des Druckers, Szene x 14–20 / y 99–107
- **`holding`:** none | bulb | cube | rocket | heart.
  - Rückenansicht mit `greifen`: Das Teil liegt in der Hand.
  - Seitenansicht: Das Teil wird vor der Brust getragen.
- **Positionen:**
  - Greifen: left 192 px (Hand über der Objektmitte, Szene-x 36)
  - Drücken: left 72 px
  - Die Figur ist dabei in Ebene ganzVorne.

## Ablauf (Tafel „3D-Drucker · Druckzyklus mit Figur“)

- **Drucken:**
  - 8 Schichten in 8–12 min (Test `?print=40`).
  - Der Kopf pendelt alle 300 ms um 1 px zwischen −3 und +3.
  - Fertig: Der Kopf parkt, die LED wird gelb.
- **Abholen:**
  - 20–60 s nach „fertig“, nur bei leerer Warteschlange und nicht in den letzten 60 s vor einem Phasenende.
  - Ablauf: rein (view left) → drehen → greifen → Teil in die Hand → drehen → mit Teil raus (view right).
- **Neu starten:**
  - 2–5 min später: rein bis left 72 → drücken → LED blinkt → nächstes Objekt → raus.
  - Reihenfolge der Objekte: bulb → rocket → heart → cube.
- **Vorrang:** Das Abhaken hat immer Vorrang.

---

# Update 4: Drucker-Position, Bücherstapel, Brust-Logo

- **3D-Drucker:** Jetzt **Variante 3 mit offenem Rahmen**, das ersetzt Update 3.
  - Position: unter dem Fenster, left 348 / top 432 (Szene-x 58–103; top von dir im Canvas auf 432 angehoben).
  - Die kleine Pflanze ist aus (`small-plant=false`), die hohe Pflanze ist wieder da.
  - Figur beim Greifen: left 456 px. Beim Drücken der Taste: left 348 px.
  - Die Greif-Position liegt fast genau an der Jalousie-Schnur (left 462), das passt zusammen.
- **Bücher (`Room_Front`, `#desk-props`):**
  - Buch und Notizblock lagen vor dem Drucker. Jetzt liegen sie gestapelt rechts daneben (x 105–124), das grüne Buch unten, der Notizblock darauf.
  - Die Tasse steht obendrauf, um 9 px angehoben.
- **Person, Vorderansicht:** Kleines KidsLab-Logo auf der Brust, rechts im Bild (`#chest-logo`, x 22–33 / y 35–42).
  - Oranges „K“, blaues „L“ und eine Glühbirne mit Sockelstreifen.
  - Jeweils 1 px dunkler Schatten wie beim Rückenlogo.

---

# Update 5: Bücher weg, Glühbirnen-Logo, Kaffeepause

- **`Room_Front`:** Die Bücher sind entfernt. Die Kaffeetasse steht wieder auf dem Tisch (x 104–125).
  - Neue Prop `cup` (Default `true`). Bei `false` verschwindet die Tasse und nur die Untertasse bleibt stehen.
- **Person, Brust-Logo vorne:** Nur noch die KidsLab-Glühbirne, 5×8 Pixel bei x 28–32 / y 35–42.
  - Glaskolben gelb mit rotem Herz-Pixel, Sockel in Orange/Koralle/Blau.
  - 1 px Schatten wie beim Rückenlogo.
- **Person, Kaffee:**
  - `holding="cup"`: Die Tasse liegt beim Greifen in der Hand (Rückenansicht) bzw. wird vor der Brust getragen (Seitenansicht).
  - Neue Vorderansicht-Posen `cupLow` (Tasse vor der Brust, dampft) und `cupDrink` (Tasse am Mund). Bei `cupDrink` ist das Gesicht automatisch `blink`.
- **Main:** Tweak `cupOnDesk` → `Room_Front` `cup`. Die Posen-Liste ist um cupLow/cupDrink ergänzt, `holding` um `cup`.
- **Neue Tafel `Kaffee_Pause`:** 8 Bilder vom Reinkommen über Greifen, Trinken und Abstellen bis zum Rausgehen, mit Timing.
  - Greif-Position: left 660 px.
  - Die Kaffeepause ist eine zufällige Leerlauf-Animation wie das Winken, alle 4–8 min.
  - Abhaken hat Vorrang.

---

# Update 6: Easter Egg „Bug-Jagd“ (FREIGEGEBEN – umsetzen, siehe PROMPT_EasterEgg.md)

- **Neue Tafeln:** `Arcade.dc.html` (Komponente, Prop `screen`: title | play | name | board), `Arcade_Screens.dc.html`, `Arcade_Ablauf.dc.html`.
- **Computer:** neuer Zustand `arcade` (BUG-JAGD / READY? / ENTER = START).
- **Spiel:** eigenes Labyrinth-Spiel, keine Kopie eines bestehenden Spiels.
  - Figuren: die KidsLab-Glühbirne als Spielfigur, vier Bugs (SYNTAX, NULL, LOOP, RACE), Kaffeetasse als Power-up.
  - Labyrinth: eigenes Layout, 24×15 Kacheln à 8 px (Zeilen stehen in `renderVals` von `Arcade.dc.html`). Geprüft: alle 132 Bits und 4 Tassen sind erreichbar.
  - Spielfeld: 1152×792 px = 192×132 Pixel à 6 px. HUD y 0–11.
- **Ablauf, Regeln, Rangliste:** siehe Text auf `Arcade_Ablauf`.
  - Auslöser: Tastenfolge G·A·M·E.
  - Die Rangliste liegt in localStorage, also nur auf dem Beamer-Rechner.

- **Nachtrag zu Update 6:**
  - **Labyrinth:** jetzt 28×20 Kacheln à 6 px, 214 Bits, keine Sackgassen.
  - **Schwierigkeit:** steigt je Runde wie bei einem klassischen Automaten. Die Tabelle steht auf `Arcade_Ablauf`.
  - **Ranglisten-Namen:** bis 8 Zeichen.
  - **Name und Aussehen:** bleiben eigenständig („Bug-Jagd“).
