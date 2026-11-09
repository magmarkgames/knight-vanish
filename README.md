# Knight Vanish v0.1.1 ♞

Minimalistisches Springer-Puzzlespiel mit **25 garantiert lösbaren Leveln**.

## Spielregeln

- Springe wie ein Springer im Schach (1×2 Felder in L-Form).
- Jede verlassene Plattform verschwindet dauerhaft für diesen Versuch.
- Besuche jede Plattform genau einmal und erreiche die goldene Krone zuletzt.
- Neustart setzt das aktuelle Level zurück; Verlassen führt zur Levelübersicht.

## Neu in v0.1.1

- **Aufgeräumter Spielbildschirm:** nur `Level X`, `Verlassen` und `Neustart`.
- **Größeres Spielfeld:** füllt die verfügbare Fläche auf Handy, Tablet und Desktop besser aus.
- **Blauerer Spielbereich:** Glasplattformen heben sich deutlicher ab.
- **Schnellere Springerin-Animation:** ca. 140 ms statt 340 ms.
- **Sofortige Eingabe:** weitere Sprünge können bereits während der Animation eingegeben werden. Aktuelle Animationen werden beim nächsten Sprung abgebrochen, der neue Spielzustand wird sofort verarbeitet.
- Die bisherigen 25 Level und die Speicherkennung sind unverändert – **dein bisheriger Fortschritt bleibt im selben Browser erhalten**.

## Installation auf GitHub Pages / Update der bestehenden Version

1. Entpacke die ZIP-Datei.
2. Öffne dein vorhandenes GitHub-Repository.
3. Wähle **Add file → Upload files** und lade alle entpackten Dateien hoch. Bestätige das **Ersetzen** gleichnamiger Dateien und klicke **Commit changes**.
4. Lass deine bisherigen **Settings → Pages**-Einstellungen wie sie sind. Nach dem erfolgreichen Deployment ist die neue Version unter deiner bisherigen GitHub-Pages-Adresse verfügbar.
5. Falls noch das alte Design zu sehen ist, die Seite einmal hart neu laden oder im privaten Tab testen.

**Alternativ:** Mit `knight-vanish-v0.1.1-update-only.zip` brauchst du nur `index.html`, `style.css` und `script.js` zu aktualisieren. Die übrigen Dateien bleiben unverändert.

## Neue Veröffentlichung

Für ein neues öffentliches Repository `knight-vanish`: alle ZIP-Dateien ins Stammverzeichnis hochladen, dann unter **Settings → Pages** als Quelle **Deploy from a branch**, Branch **main**, Verzeichnis **/(root)** wählen. Die fertige Adresse lautet normalerweise `https://DEIN-BENUTZERNAME.github.io/knight-vanish/`.

## Technische Details

- HTML, CSS, JavaScript, keine externen Abhängigkeiten.
- 25 feste, vorab mit einem Solver geprüfte Level.
- Erledigte Level und freigeschalteter Fortschritt werden per `localStorage` gespeichert, unter derselben Speicherkennung wie v0.1 (`knight-vanish-v0.1-unlocked`).
- Keine Sterne, keine Rücknahme, keine Hinweise, keine Skins und kein Daily-Modus.
- `pointerdown` sorgt für unmittelbare Touch-Steuerung; eine alternative Tastaturbedienung bleibt möglich.

## Dateien

- `index.html` — Startseite, Levelübersicht, aufgeräumte Spielansicht
- `style.css` — Design, Glasplattformen, responsive Darstellung und Animationen
- `script.js` — Logik, sofortige Eingabe, Fortschritt, Navigation
- `levels.js` — die 25 unveränderten Level
- `favicon.svg` — Browser-Icon
- `.nojekyll` — GitHub-Pages-Unterstützung
