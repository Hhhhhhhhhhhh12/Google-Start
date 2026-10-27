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
