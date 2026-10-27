# Geführtes Layout mit reduzierter Seitenleiste

Stand: 27.10.2026. Umsetzung auf `codex/local-demand-core-workflows`, Ausgangspunkt `28e3f5e`.

## Auswahl und Umfang

Der Nutzer hat „Geführter Start“ gewählt, die Seitenleiste befürwortet und eine bessere Übersicht verlangt. Den reduzierten Entwurf hat er mit „So ist es besser. Bau das Layout jetzt in die App ein.“ für die Implementierung freigegeben.

- Dauerhafte Navigation: Idee prüfen, Ideen finden, Ideen vergleichen; Sammlung getrennt darunter, Einstellungen am unteren Rand.
- Prüfung in drei Schritten: Idee, Beobachtungen, Einschätzung. Zielgruppe, Suchbegriffe und Notizen sind optional aufklappbar. Die Region bleibt wie bisher optional; regionale Beobachtungen benötigen weiterhin ihre eigene Region.
- Kein automatisches Speichern oder Abfragen durch einen Schrittwechsel. „Prüfen und speichern“ berechnet und speichert ausdrücklich. Externe Abfragen behalten ihre eigene Aktion und Kosteninformation.
- Bericht mit nachvollziehbarer Datenbasis und nächsten Schritten. Score, Kennzahlen und strategische Arbeitshypothesen sind aufklappbar; Export und Quellen bleiben erhalten.
- Navigation und Bericht sind eigene React-Komponenten. Alte, mehrfach überschreibende CSS-Regeln wurden durch eine einheitliche Gestaltung ersetzt. Scoring, Query Builder, Storage und externe Recherchelogik wurden nicht geändert.
- Bereichs- und Schrittwechsel blenden bestehende Formulare aus, statt sie neu aufzubauen. Dadurch bleiben auch noch nicht vorgemerkte Recherche-Eingaben innerhalb der Sitzung bestehen. Neue oder andere Ideen verwenden weiterhin die vorhandene Verwerfungsbestätigung für geänderte Ideenentwürfe.

## Freigabe und technische Nachweise

Ausdrücklich freigegeben: `npm run test`, `npm run build` und Browserprüfung von Navigation, drei Prüfschritten und mobiler Darstellung mit Beispieldaten. Keine echten Suchabfragen.

- 84 bestehende Tests in 10 Dateien bestanden; TypeScript/Vite-Build bestanden.
- Browser auf eigener lokaler Testadresse `http://127.0.0.1:48174/`: leere Pflichtangabe abgefangen; alle Schritte durchlaufen; Beobachtung erfasst; Wechsel zu Einstellungen und zurück erhält angefangene Eingaben; gespeichert, neu geladen und wieder geöffnet.
- Notizen, Suchbegriffe, Quelle und geändertes Gewicht bleiben nach Neuladen erhalten. Eine Gewichtsänderung blendet den alten Bericht aus; erneute lokale Prüfung bleibt möglich.
- Ideenfindung nutzt die gespeicherten regionalen Beobachtungen; Vergleich zeigt mehrere Berichte. Berichtsexport enthält Titel, Region, Quelle und Beobachtung.
- Schmale Browseransichten mit 390 und 320 Pixeln geprüft. Bei 320 Pixeln kein horizontaler Seitenüberlauf; die Vergleichstabelle besitzt einen separat mit Tastatur bedienbaren horizontalen Scrollbereich. Kein Test auf einem physischen Mobilgerät.
- Keine echten Serper-Abfragen ausgeführt. Die bereits bestehenden Beispielideen bleiben erhalten; für diese Prüfung zusätzlich angelegte Browser-Testdaten werden am Ende entfernt.

## Abnahmestufen

Entwurf ausgewählt und Implementierung beauftragt. Technische Prüfung der lokalen App erfolgt. Die visuelle Abnahme der tatsächlichen App durch den Nutzer sowie Übernahme nach `main` und Veröffentlichung auf GitHub sind separate Stufen; dieser Nachweis behauptet keine Veröffentlichung.

## Fortschreibung: abgenommenes Recherchejournal

Stand: 27.10.2026. Der Nutzer hat anschließend die Journalrichtung gewählt, sechs konkrete Kürzungen kommentiert, den Feinschliff mit Symbolen und Häuser-/Lupenillustration visuell bestätigt und den Einbau beauftragt. Diese Gestaltung ersetzt den oben dokumentierten ersten Layoutentwurf.

- Ausgangscommit bleibt `ac4bb33`; dessen temporärer Arbeitsordner war nicht mehr vorhanden. Der erhaltene Git-Stand wurde in `/private/tmp/scout-recherchejournal-20261027` auf `codex/scout-recherchejournal-20261027` wiederhergestellt. Die separat geführte Migrationsdokumentation empfiehlt ebenfalls `ac4bb33` als Funktionsgrundlage. Andere Funktionszweige wurden nicht integriert.
- Papiergrund, abgesetzte Seitenleiste, Serifenschrift mit kursiver zweiter Titelzeile, Kontursymbole, linierte Eingaben und kompakte Aktionen sind in der React-App umgesetzt. Obere Zusatzleiste und allgemeiner Fußtext entfallen. Einstellungen sind über ein beschriftetes Zahnrad oben rechts erreichbar; der erste Schritt endet mit „Weiter“.
- Region und Zielgruppe liegen nebeneinander, auf schmalen Ansichten untereinander. Beide bleiben optional. Notizen und Suchbegriffe sind aufklappbar. Explizites Speichern, Änderungsanzeige, Verwerfungsbestätigung, Quellen, Query Builder, Generator, Score/Gewichtung und Berichtsexport bleiben vorhanden. Kein Beispielinhalt des Entwurfs wird als tatsächliche Recherche übernommen.
- Die visuell bestätigte Illustration liegt lokal in `src/assets/journal-stadtlupe.webp` (355.392 Byte). Sie wird durch Vite gebündelt und benötigt keinen externen Bildabruf. Entstehung und Prompts: `src/assets/journal-stadtlupe-prompt.txt`. Desktop: neben der Überschrift; schmale Ansicht: verkleinert oberhalb des Titels. Rein dekorativ, daher leerer Alternativtext.
- Titel und Sprache der Browserseite sind auf Ideen Scout / Deutsch gesetzt. Tastaturfokus, Skip-Link und semantische Navigation bleiben erhalten.

### Konkrete Freigabe und Prüfung des Journal-Einbaus

Der Nutzer hat ausdrücklich `npm run test`, `npm run build` und eine lokale Browserprüfung von Navigation, Prüfschritten und mobiler Darstellung mit ausschließlich neuen Testdaten freigegeben. Keine echten Suchabfragen.

- 84 Tests in 10 Dateien bestanden; TypeScript/Vite-Build bestanden. Die lokale Vorschau läuft unter `http://127.0.0.1:48191/` mit eigener, vorher leerer Sammlung.
- Browser: Titelpflicht geprüft; drei Schritte durchlaufen; Notizen, Suchbegriffe, Zielgruppe und manuelle Beobachtung mit Quelle gespeichert. Einstellungen über Zahnrad geöffnet; noch nicht vorgemerkte Recherche-Eingaben bleiben bei Rückkehr erhalten. Neuladen und Wiederöffnen bestätigen gespeicherte Inhalte und Bericht.
- Gespeicherte regionale Beobachtung zur Ideenfindung genutzt; Vorschlag samt Quelle übernommen und als zweite Idee gespeichert. Vergleich beider Berichte erreichbar. Bei 320 Pixeln scrollt die Tabelle separat und per Pfeiltaste.
- Schmale Ansichten mit 390 und 320 Pixeln geprüft: kein horizontaler Seitenüberlauf; Illustration geladen; Eingaben und Aktionen erreichbar. Desktop-Ansicht gesichtet. Keine Prüfung auf einem physischen Mobilgerät und kein vollständiges Barrierefreiheitsaudit.
- Keine Warnungen oder Fehler im Browserprotokoll. Serverstart benötigte eine Sandbox-Ausnahme für den lokalen Port; ein Aufklappelement wurde nach einem nicht passenden Testselektor erfolgreich über seine direkte Bedienfläche geprüft. Beides war ein Werkzeug-/Umgebungsproblem, kein App-Fehler.
- Die beiden ausschließlich für diese Prüfung erzeugten Testideen wurden über die App entfernt; nach Neuladen ist die Testsammlung wieder leer. Keine ursprünglichen Browserdaten oder Schlüssel ausgelesen, keine externe Abfrage gestartet.

Status: Journalentwurf visuell abgenommen; in separatem Arbeitszweig eingebaut und technisch geprüft. Visuelle Abnahme der tatsächlichen App, Integration nach `main` und GitHub-Veröffentlichung bleiben separate Schritte.
