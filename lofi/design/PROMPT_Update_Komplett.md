# Auftrag für Claude Code: Design-Updates 2–5 umsetzen und neue Tastenkürzel

Referenz ist ausschließlich `design/`. Die Details stehen in `design/CHANGES.md` (Update 2 bis 5) und im Handoff-Zettel in `design/canvas.json`. Der ältere Auftrag `PROMPT_Abhaken_und_Merge.md` ist erledigt bzw. hierin enthalten: Abhaken, Bank, Poster und Hoodie-Logo sind im Code schon umgesetzt, bitte nicht neu bauen, nur nichts kaputt machen.

Lies zuerst `CLAUDE.md`, `design/CHANGES.md` (ab „Update 2“) und diese `.dc.html`:
- `Main`
- `Person`
- `Room_Front`
- `Printer3D`
- `Person_Ansichten`
- `Drucker_Zyklus`
- `Kaffee_Pause`

Vergleiche danach den Code (`src/`) mit dem Design und zeig mir einen Plan (6–10 Punkte). **Warte auf mein OK, bevor du Code änderst.**

## 1. Szene

- **3D-Drucker** (`Printer3D`, Variante `open`) bei **left 348 / top 432** px, Ebene zwischen Room_Front und Person.
  - Die **kleine Pflanze entfällt** (`small-plant=false`). Die hohe Pflanze bleibt.
  - `state`: printing | done | empty
  - `layer`: 0–8, Objekt über ein verschachteltes svg auf die Schichten zugeschnitten
  - `headX`: −4…4
  - `obj`: bulb | rocket | heart | cube
  - X-Achse bei gy = 31 − layer, beim Parken gy 14 / headX +8.
  - LED: grün / gelb / aus.
- **Bücher gibt es nicht mehr.** Die Kaffeetasse steht auf dem Tisch (x 104–125). Mit `cup=false` bleibt nur die Untertasse stehen.
- Die Pixelgenauigkeit gilt wie bisher: nur ganze Pixel, keine Rotation.

## 2. Person

- **Blickrichtung `view`:**
  - back: bisher
  - right: Seitenansicht
  - left: right gespiegelt mit `translate(44 0) scale(-1 1)`
  - front: Vorderansicht mit Gesicht
- **Laufen immer in Seitenansicht.** Drehen über 1 Zwischenbild „Seite stand“ (120 ms).
- **Gesicht `face`:** auto | neutral | smile | grin | blink.
- **Posen vorne:** `waveA`/`waveB` (Winken), `cupLow`/`cupDrink` (Kaffee).
- **Linker Arm hinten `armLeft`:** down | greifen | druecken.
- **`holding`:** none | bulb | cube | rocket | heart | cup, in der Hand (hinten) bzw. vor der Brust (seitlich).
- **Brust-Logo vorne:** nur die Glühbirne (`#chest-logo`). Das Rücken-Logo bleibt.
- **Bestehende Posen hinten** (inkl. Schreib-Arme, stepA/B, Jalousie) müssen pixelgleich bleiben.

## 3. Animationen (Warteschlange)

- **Laufwege:** Rein- und Rauslaufen jetzt mit `view` left/right. Am Ziel zu back drehen (Kalender, Schnur).
- **Drucker-Zyklus** (Tafel `Drucker_Zyklus`):
  - Drucken: 8 Schichten in 8–12 min, der Kopf pendelt ±3 px pro 300 ms.
  - Fertig: Kopf parkt, LED gelb.
  - Abholen: 20–60 s nach „fertig“. Rein → greifen bei **left 456** → Teil in die Hand → mit Teil raus.
  - Neu starten: nach 2–5 min. Rein → drücken bei **left 348** → nächstes Objekt (bulb → rocket → heart → cube).
  - Testmodus: `?print=40`.
- **Zufällig winken** (Tafel `Person_Ansichten`): alle 90–180 s, Ablauf wie dort beschrieben. Testmodus: `?wave=10`.
- **Kaffeepause** (Tafel `Kaffee_Pause`): alle 4–8 min, ca. 9 s, Greifen bei **left 660**. Testmodus: `?coffee=15`.
- **Regeln für alle Leerlauf-Animationen** (Winken, Kaffee, Drucker abholen/starten):
  - nur bei leerer Warteschlange
  - nicht in den letzten 60 s vor einem Phasenende
  - nie zweimal dieselbe hintereinander
  - Abhaken bricht sie sofort ab: Teil/Tasse ohne Animation in den Endzustand, dann Abhaken
- **Ebene:** Die Figur läuft bei allen diesen Wegen in Ebene **ganzVorne**. Nachts gilt `brightness(0.6)` wie gehabt.
- **Beim Neuladen** keine nachgeholten Animationen. Der Drucker startet in einem plausiblen Zustand (printing, zufällige Schicht).

## 4. Neue Tastenkürzel

Die bestehenden bleiben: → ← + − P J W F R.

| Taste | Aktion |
|---|---|
| `D` | Drucker einen Schritt weiter: printing → sofort fertig · done → Abhol-Animation · empty → Start-Animation |
| `K` | Kaffeepause jetzt |
| `H` | Hallo: Winken jetzt |
| `L` | Leerlauf-Animationen an/aus (Winken, Kaffee, Drucker-Gänge). Der Drucker druckt trotzdem weiter. Zustand in localStorage. |
| `?` | Hilfe-Overlay mit allen Tastenkürzeln (erneut `?` oder Esc schließt) |

- Jede Aktion bestätigt das bestehende Toast-Overlay (2 s).
- D/K/H werden in die Warteschlange gestellt, falls gerade etwas läuft. Toast dann: „kommt gleich“.
- Das Debug-Panel (`?debug`) bekommt dazu Felder für view, face, armLeft, holding, cupOnDesk und die Drucker-Props.
- `tools/keys.mjs` um die neuen Tasten erweitern.

## Prüfen

- **Screenshot-Vergleich** mit den Tools in `tools/` gegen:
  - `Main.dc.html`
  - `Person_Ansichten.dc.html` (alle 9 Ansichten)
  - `Drucker_Zyklus.dc.html` (alle 10 Bilder)
  - `Kaffee_Pause.dc.html` (alle 8 Bilder)
  - `Kalender_Abhaken.dc.html` darf sich NICHT verschlechtert haben.
- **Ganzer Tag im Zeitraffer** (`?speed=120&print=40&wave=10&coffee=15`) ohne Fehler: Abhaken hat immer Vorrang, keine zwei Animationen gleichzeitig, Tasse und Druckteil verschwinden/erscheinen korrekt.
- `npm run build` und `npm test` müssen durchlaufen. Dazu Tests für die Leerlauf-Regeln (Vorrang, 60-s-Sperre, keine Wiederholung).
- **Am Ende:** geänderte Dateien auflisten und ehrlich sagen, was noch abweicht.
