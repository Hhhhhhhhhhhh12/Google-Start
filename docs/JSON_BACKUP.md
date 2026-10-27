# Vollständige JSON-Sicherung und geprüfter Import

Stand: 27.10.2026. Arbeitszweig `codex/scout-json-backup-20261027`, Ausgangspunkt `ac4bb33` mit dem geführten Layout. Bestehende andere Arbeitszweige, `main` und ursprüngliche Browserdaten wurden nicht verändert.

## Datenumfang und Format

Formatkennung `ideen-scout-backup`, Version `1`, ISO-Exportdatum und vollständige Liste gespeicherter Ideen. Alle derzeitigen Felder aus `BusinessIdea`, `MarketAnalysis`, `ResearchEntry` und `ExternalResearch` sind ausdrücklich abgebildet; TypeScript prüft die Vollständigkeit dieser Feldlisten. Quellen, Links, Unsicherheitsnotizen, Such-/Maps-Abrufzeiten, Berichte, Gewichte, Checklisten, IDs und Erstellungs-/Änderungszeiten bleiben erhalten. Berichte werden beim Import nicht neu berechnet.

Export verwendet ausschließlich erlaubte Modellfelder und liest keine Schlüssel-/Einstellungsablage. Fremde Eigenschaften werden nicht exportiert. Inhalte eigener Notizen und Quellen sind Bestandteil der Datei und werden nicht semantisch auf Geheimnisse untersucht. Die Sicherungsdatei ist lokales, unverschlüsseltes JSON; es erfolgt kein Upload.

Import prüft Felder und verschachtelte Strukturen, Zahlenbereiche, Kalenderdaten, Quellenlinks, Version sowie doppelte Ideen- und Beobachtungs-IDs. Unbekannte Felder werden abgewiesen, statt sie still zu verwerfen. Gültige ältere reine JSON-Ideenlisten sind lesbar; eine unvollständige alte Liste wird nicht durch erfundene Standarddaten ergänzt. Höchstens 10 MiB und 10.000 Ideen sind unterstützt; auch eine Zusammenführung darf diese Grenzen nicht überschreiten.

## Bedienung und Schutz des vorhandenen Stands

Unter „Sammlung“ liegt ein aufklappbarer Bereich. Dateiauswahl und Prüfung führen nur zur Vorschau. Für jede gleiche ID ist eine ausdrückliche Auswahl nötig. „Behalten“ erhält das vorhandene Objekt, „ersetzen“ übernimmt das importierte Objekt mit seinen ursprünglichen Zeitangaben. Neue IDs werden ergänzt, nicht enthaltene vorhandene Ideen nicht gelöscht. „Import abbrechen“ schreibt nichts.

Erst „Import jetzt speichern“ speichert die gesamte vorbereitete Sammlung. Der React-Zustand wird erst nach erfolgreichem Schreiben aktualisiert. Seit der Vorschau geänderte Sammlungen, Änderungen aus anderen Tabs, nicht lesbare Originaldaten und Schreibfehler stoppen den Import. Ungespeicherte Ideenentwürfe oder laufende externe Abfragen sperren den Import. Ungespeicherte Rechercheformulare bleiben im bestehenden Layout erhalten; sie gehören erst nach Aufnahme und Speichern zur Sammlung. Export bei bereits nicht lesbarem Originalspeicher ist gesperrt, um eine irreführende leere Sicherung zu vermeiden.

Eine offene unveränderte Idee wird nach einem erfolgreichen Import mit dem gespeicherten Stand synchronisiert. Rückgängig-Einträge für Löschungen, deren IDs durch den Import wieder vorhanden sind, werden entfernt, damit ein späteres Rückgängigmachen keine importierte Idee überschreibt. Andere Rückgängig-Einträge bleiben erhalten.

## Freigegebene technische Prüfung

Der Nutzer hat für `/private/tmp/scout-json-backup-20261027` ausdrücklich gezielte Tests, gesamte Testsuite, TypeScript/Vite-Build und begrenzte Browserprüfung mit künstlichen Daten auf eigener lokaler Adresse erlaubt. Kein Zugriff auf das bisherige Browserprofil oder echte Serper-Abfragen.

- 103 Tests in 11 Dateien bestanden, darunter 19 neue Backup-/Importfälle: vollständiger Rundlauf aller Modellfelder, unbekannte/verschachtelte Felder, Nullwerte, alte JSON-Arrays, leere Sammlung, kaputte Daten, doppelte IDs, Schlüssel-Ausschluss, Größen-/Mengengrenzen, Konfliktauswahl, Erhalt anderer Ideen, Schreibfehler und veralteter Speicherstand.
- TypeScript/Vite-Produktionsbuild bestanden. Ein anfänglicher Typfehler bei der Erkennung eines Validierungsabbruchs wurde korrigiert.
- Browser ausschließlich auf `http://127.0.0.1:48175/`: künstliche Idee mit Bericht angelegt; JSON heruntergeladen; beschädigten Import abgewiesen; gültige Vorschau ohne Speichern; Abbruch ohne Veränderung; neue Idee plus „behalten“; danach ausdrückliches „ersetzen“; Neuladen zeigt gespeicherte Daten; erneuter Export dateiweise mit den erwarteten Objekten verglichen. IDs, Quellen, Notizen, Berichte und Zeitangaben vollständig erhalten.
- Import bei ungespeichertem Ideenentwurf gesperrt, Export gespeicherter Sammlung bleibt erreichbar. Keine echten Schlüssel verwendet und keine externen Suchabfragen ausgeführt.
- Eigene künstliche Browserideen am Ende über die Oberfläche entfernt; Neuladen bestätigt eine leere Testsammlung. Keine Browser-Konsolenfehler festgestellt.

## Getrennt offen

Visuelle Nutzerabnahme und Integration nach `main` sind nicht durch die technische Prüfung freigegeben. Eine tatsächliche Migration persönlicher Browserdaten ist ebenfalls nicht durchgeführt. Der Arbeitszweig enthält den neueren, bisher nicht nach `main` integrierten Workflow-/Layoutstand als Voraussetzung. Veröffentlichung einer laufenden App und geräteübergreifende Prüfung sind nicht Teil dieses Tickets.
