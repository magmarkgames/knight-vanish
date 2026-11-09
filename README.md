# Knight Vanish v0.1 ♞

Ein minimalistisches Springer-Puzzlespiel mit **25 garantiert lösbaren Leveln**.

## Spielregeln

- Der Springer springt wie im Schach (zwei Felder in eine Richtung, eines senkrecht dazu).
- Die Plattform, von der du abspringst, verschwindet.
- Jede Plattform muss genau einmal besucht werden.
- Das Zielfeld mit der **goldenen Krone** muss als letztes erreicht werden.
- Bei einer Sackgasse kannst du das Level von vorne beginnen.

## Inhalt der ersten Version

- 25 vorab auf Lösbarkeit geprüfte Level, mit zunehmender Größe und Schwierigkeit.
- Hellblauer Hintergrund und Glasplattformen.
- Sprung- und Verschwindeanimation.
- Levelauswahl mit Freischaltung des jeweils nächsten Levels.
- Automatische Speicherung des Fortschritts im **localStorage** des Browsers.
- Neustart-Button.

**Absichtlich noch nicht enthalten:** Sterne, Zug zurück, Hinweise, Daily-Modus, Skins, Konten, Server.

## Schnellstart

Öffne `index.html` im Browser. Es ist keine Installation nötig. Die Dateien `index.html`, `style.css`, `levels.js`, `script.js` und `favicon.svg` müssen im selben Ordner liegen.

## Auf GitHub Pages veröffentlichen

1. Erstelle ein **öffentliches** neues Repository auf <https://github.com/new>, beispielsweise `knight-vanish`.
2. Entpacke die heruntergeladene ZIP-Datei.
3. Wähle im Repository **Add file → Upload files** und lade **die Dateien aus dem entpackten Ordner** hoch. Wichtig: `index.html` muss direkt im obersten Verzeichnis liegen, nicht in einem Unterordner.
4. Klicke **Commit changes**.
5. Öffne **Settings → Pages**. Stelle unter **Build and deployment → Source** auf **Deploy from a branch**.
6. Wähle als Branch **main** und als Verzeichnis **/(root)**. Speichern.
7. Nach der Veröffentlichung findest du die Webseite normalerweise unter `https://DEIN-BENUTZERNAME.github.io/knight-vanish/`.

Siehe auch die offiziellen [GitHub-Pages-Anweisungen](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Technische Hinweise

- Reines HTML, CSS und JavaScript; **keine Abhängigkeiten** und keine Build-Schritte.
- Alle 25 Level wurden mit einem Python-Solver geprüft, der legalen Springerzügen, einmaligem Betreten jedes Felds und dem Ziel als Endposition folgt.
- Der lokale Fortschritt gilt nur für den jeweiligen Browser und das jeweilige Gerät. Wer Browserdaten löscht, verliert den Fortschritt.
- Alle Spielressourcen sind lokal; es werden keine externen Bilder oder Schriftarten geladen.

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` | Drei Ansichten: Startseite, Levelauswahl, Spiel |
| `style.css` | Gestaltung, responsive Layouts und Animationen |
| `levels.js` | Die 25 Level mit Start, Ziel und Plattformfeldern |
| `script.js` | Spielregeln, Bedienung, Freischaltung und Speicherung |
| `favicon.svg` | Kleines Springer-Icon für den Browser |
