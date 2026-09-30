# Auftrag für Claude Code: Easter Egg „Bug-Jagd“

Referenz ist `design/` (Update 6 in `design/CHANGES.md`). Relevante Tafeln:

- `Arcade.dc.html`: das Spiel. Prop `screen` = title | play | name | board. Das Labyrinth steht als Zeichenketten in `renderVals()`.
- `Arcade_Screens.dc.html`: alle vier Bildschirme.
- `Arcade_Ablauf.dc.html`: Auslöser, Zoom, Regeln, Schwierigkeit, Rangliste.
- `Computer.dc.html`: neuer Zustand `arcade`.

Die Updates 2–5 (Drucker, Kaffee, Winken usw.) sind im Code schon umgesetzt, **nichts davon neu bauen oder verändern**.

Lies zuerst `CLAUDE.md`, `design/CHANGES.md` (Update 6 inkl. Nachtrag) und die vier Dateien oben. Zeig mir dann einen Plan (6–10 Punkte, inkl. Dateistruktur, z. B. `src/arcade/`). **Warte auf mein OK, bevor du Code änderst.**

## Wichtig zum Inhalt

Das Spiel ist ein **eigenes** Labyrinth-Spiel und heißt „Bug-Jagd“. Figuren, Farben, Labyrinth und Texte kommen ausschließlich aus `Arcade.dc.html`. Übernimm keine Namen, Sprites, Labyrinthe oder Sounds aus bestehenden kommerziellen Spielen.

## 1. Auslöser und Übergang (Tafel `Arcade_Ablauf`)

- **Tastenfolge G → A → M → E** innerhalb von 2 s (Groß/klein egal). Diese Tasten sind bisher frei. Keine andere Aktion darf dadurch ausgelöst werden.
- **Zusätzlich** `?arcade` in der URL (öffnet direkt den Titel) zum Testen.
- **Läuft gerade Abhaken oder eine andere Animation:** Toast „kommt gleich“, Start danach. Leerlauf-Animationen (Winken, Kaffee, Drucker-Gänge) werden abgebrochen bzw. pausiert.
- **Ablauf:**
  1. Toast „G · A · M · E · Bug-Jagd startet“ (1,5 s).
  2. Figur läuft von rechts in Seitenansicht (view left, Ebene ganzVorne) bis left 960.
  3. Drehen zu back, der Computer zeigt Zustand `arcade` (600 ms).
  4. Zoom: Der Monitor (Rahmen #D8CBB0, Unterkante #B9AA8C, Innenrand #2A2622) wächst in 6 Stufen à 80 ms aus der Bildschirmposition zur Mitte: 1248×888 px, left 336 / top 96. Die Szene wird bis `rgba(14,10,8,0.6)` abgedunkelt.
- **Schließen:** alles rückwärts, dann dreht die Figur nach rechts und läuft raus.

## 2. Spiel (Tafel `Arcade` / `Arcade_Screens`)

- **Darstellung:** Spielfeld 1152×792 px = 192×132 Pixel à 6 px. Am besten ein `<canvas>` 192×132, 6× skaliert, `imageSmoothingEnabled = false`. HUD und Texte als DOM darüber, Fonts wie im Design (Press Start 2P, VT323), Scanlines wie beim Computer.
- **Labyrinth:** 28×20 Kacheln à 6 Pixel, Ursprung x 12 / y 12. Die Zeichenketten 1:1 aus `Arcade.dc.html` übernehmen (Hälfte gespiegelt).
  - `#` Wand
  - `.` Bit (10 Punkte)
  - `o` Kaffee (50 Punkte)
  - `-` Tür des Bug-Nests
  - Zeile 10 ist ein Tunnel.
- **Sprites exakt wie im Design:** Glühbirne 6×6 mit Augen, die in Laufrichtung schauen. Bugs 6×6 in #F0A31B / #C48BC4 / #7FE0C2 / #4CC8F0. Kaffeetasse. Fangbare Bugs in #7FA58A.
- **Bewegung:** kachelweise mit 1-px-Schritten. Eine Pfeiltaste wird vorgemerkt und bei der nächsten möglichen Abzweigung ausgeführt. Tunnel wrappt.
- **Bugs:**
  - SYNTAX jagt direkt.
  - NULL zielt 4 Kacheln vor die Figur.
  - LOOP umrundet einen Bereich des Labyrinths.
  - RACE wählt an Kreuzungen zufällig.
  - Sie starten versetzt aus dem Nest, wechseln zwischen Streuen (7 s) und Jagen (20 s) in 4 Wellen, danach nur Jagen.
  - Im Tunnel halbe Geschwindigkeit.
- **Schwierigkeit je Runde** (Tabelle auf `Arcade_Ablauf`):

| Runde | Bug-Tempo (vom Spieltempo) | Kaffee wirkt |
|---|---|---|
| 1 | 75 % | 6 s |
| 2–4 | 85 % | 5 → 3 s |
| 5–8 | 95 % | 2 → 1 s |
| ab 9 | 95 % | 0 s |

- **Punkte:**
  - Gefangene Bugs: 200 / 400 / 800 / 1600.
  - 3 Leben, +1 Leben bei 10 000 Punkten.
  - Ist das Labyrinth leer, beginnt die nächste Runde.
- **Tasten im Spiel:**
  - Pfeiltasten: laufen
  - P: Pause
  - ESC: zurück zum Dashboard
  - ENTER: Start bzw. Bestätigen
- **Alle anderen Dashboard-Tastenkürzel** (→ ← + − J W F R D K H L ?) sind aus, solange das Spiel offen ist.
- **Automatisch schließen:** nach 45 s ohne Eingabe auf Titel/Rangliste, oder spätestens nach 5 min Spielzeit. Nach 5 min läuft das laufende Leben noch zu Ende, dann Game Over.

## 3. Game Over und Rangliste

- **Namen eintragen:** Nur wenn der Score in die Top 10 kommt, erscheint die Eingabe.
  - Namen bis **8 Zeichen** (A–Z, 0–9, Leerzeichen).
  - ↑↓ wechselt das Zeichen, ←→ das Feld. Direktes Tippen auf der Tastatur ist ebenfalls erlaubt.
  - ENTER speichert, ESC ohne Eintrag.
- **Rangliste:** Top 10, der neue Eintrag ist markiert (Design `board`).
- **Speicherung:** `localStorage` unter `hackday.bugjagd.v1` als JSON `[{name, score, date}]`.
  - Beim Laden validieren (defekte Daten → leere Liste).
  - Sortiert nach Score absteigend, bei Gleichstand der ältere Eintrag zuerst, abgeschnitten auf 10.
  - Namen trimmen, leerer Name wird zu „???“.
- **Zurücksetzen:** Shift+R im Rangliste-Bildschirm, mit Bestätigung (erneut Shift+R innerhalb von 3 s).
- **Titelbild:** zeigt die Top 3 aus der echten Liste. Ist sie leer: „Noch keine Einträge“.

## 4. Zusammenspiel mit dem Dashboard

- Zeit, Countdown, Wetter und Drucker laufen im Hintergrund weiter. Die Leerlauf-Animationen pausieren, solange das Spiel offen ist.
- **Endet eine Phase während des Spiels:** Im HUD blinkt oben „PHASE VORBEI“. Das Abhaken startet unmittelbar nach dem Schließen, vor allem anderen.
- **Nacht-Modus:** Der gezoomte Monitor wird nicht abgedunkelt.
- **Neuladen:** Das Spiel ist danach geschlossen. Die Rangliste bleibt erhalten.

## Prüfen

- **Screenshot-Vergleich** (Tools in `tools/`) von title / play / name / board gegen `Arcade.dc.html`. Für `play` den Beispielzustand aus `renderVals` nachstellen, z. B. per `?arcade=play&demo`.
- **Tests (vitest):**
  - Labyrinth-Parsing: 214 Bits + 4 Tassen, alle erreichbar, Tunnel wrappt.
  - Kollision.
  - Schwierigkeitstabelle.
  - Tastenfolge G-A-M-E inkl. 2-s-Fenster, und dass G, A, M, E einzeln nichts auslösen.
  - Rangliste: Einfügen, Sortierung, Kürzen auf 10, kaputtes JSON, 8-Zeichen-Grenze.
  - Kein Dashboard-Kürzel greift, solange das Spiel offen ist.
- Einmal den ganzen Ablauf im Browser durchspielen: Auslösen → Spielen → Game Over → Eintragen → Rangliste → ESC → Figur läuft raus. Dazu einen Phasenwechsel während des Spiels mit `?speed=120`.
- `npm run build` und `npm test` müssen durchlaufen.
- **Am Ende:** geänderte Dateien auflisten und ehrlich sagen, was noch abweicht, v. a. beim Bug-Verhalten und beim Tempo.
