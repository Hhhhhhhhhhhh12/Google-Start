# JSON-Sicherung: aktueller Nachweis und Nutzerabnahme

Stand: 31.10.2026. Gilt für die Zusammenführung des JSON-Commits `f1b7eb4` mit dem Recherchejournal aus `main` `6bdc33c` und der Dokumentationsbasis aus PR #3. Noch kein Merge nach `main` und keine Veröffentlichung.

## Durchgeführte technische Prüfung

- Lockfile-basierte Einrichtung mit `npm ci --ignore-scripts --no-audit --no-fund`; keine Paketänderungen.
- `npm test`: **103 Tests in 11 Dateien bestanden**. Enthalten sind 19 Backup-/Importfälle: vollständiger Modellrundlauf, Quellen/Berichte/Gewichte/Zeitangaben, Schlüssel-Ausschluss über Feldlisten, ungültige und unbekannte Felder/Versionen, Altformat, doppelte IDs, Größen-/Mengengrenzen, Pflichtauswahl bei Konflikten, Erhalt anderer Ideen, Speicherausfall und veralteter Speicherstand.
- `npm run build`: **TypeScript und Vite 8.0.11 bestanden**; die lokale Journalillustration wird gebündelt.
- Quellenvergleich: Nur die 20 ursprünglichen JSON-Zeilen werden in `App.tsx` ergänzt; der neuere `NavigationIcon`-Import bleibt erhalten. Die zehn Backup-CSS-Zeilen werden an das Journal-CSS angehängt. Die drei neuen JSON-Komponenten-/Logik-/Testdateien entsprechen unverändert PR #4. Alle anderen Anwendungsdateien und Paketdateien entsprechen `main`.
- Dokumentationslinks, Konfliktmarker und `git diff --check` geprüft. Keine neue Lintprüfung oder echten Serper-Abfragen.

Die 103 Tests und der Build wurden nach der App-Konfliktauflösung neu ausgeführt. Nachfolgende Bearbeitung betrifft nur Dokumentation; frühere Browsernachweise vom 27.10.2026 gehören ausschließlich zum damaligen Arbeitsstand und gelten nicht als erneute Browserprüfung des Journals mit Backup.

## Browserprüfung: ausdrücklich noch offen

Für einen isolierten synthetischen Browserdurchlauf fehlt in dieser Umgebung der Testbrowser. Seine Installation wurde von der automatischen Freigabeprüfung abgelehnt: Der aktuelle Auftrag wurde nicht als ausdrückliche Freigabe einer neuen Laufzeit-/Browserprüfung gewertet. Es fand deshalb kein neuer Browserdurchlauf statt. Ein kurz gestarteter lokaler Vite-Server wurde beendet. Keine persönlichen Browserdaten, Schlüssel oder echten externen Abfragen wurden verwendet. Die vorbereiteten Schritte unten sind keine bestandenen Tests.

## Prüfung des Schutzes vorhandener Daten

`mergeBackup` verlangt für jede bereits vorhandene ID explizit `keep` oder `replace`; es ergänzt neue IDs und erhält nicht importierte vorhandene Ideen. Keine automatische Entscheidung anhand von Namen oder Zeitangaben. Reine Vorschau und Abbruch schreiben nichts. `saveImportedIdeas` liest vor dem Schreiben den aktuellen Ideenspeicher erneut und verweigert beschädigte Daten und Abweichungen vom Vorschauzustand. Fehler beim Schreiben werden zurückgegeben; erst danach wird der React-Zustand aktualisiert. Ein gespeicherter offener Entwurf wird synchronisiert, kollidierende Lösch-Rückgängig-Einträge werden entfernt. Ungespeicherte Ideenentwürfe und laufende Abfragen blockieren den Import.

Export liest ausschließlich erlaubte Modellfelder; weder Schlüssel- noch Einstellungsablagen werden eingelesen. Das ist kein semantischer Geheimnisfilter: Selbst in Notizen, Quellentexten oder URLs eingetragene Schlüssel wären normaler Dateiinhalt. Dateien sind unverschlüsselt und sollten entsprechend aufbewahrt werden.

Grenzen: Der lokale Speicher bietet keine atomare tabübergreifende Transaktion. Der erneute Vergleich erkennt vor dem Lesen abgeschlossene Änderungen; ein gleichzeitiger Schreibzugriff zwischen Vergleich und Speichern ist nicht ausgeschlossen. Für die tatsächliche Datenübernahme andere App-Tabs schliessen und vorher sichern. Das allgemeine Speichern in anderen Tabs gehört nicht zum neuen Importprotokoll. Noch nicht aufgenommene Rechercheformulare sind keine gespeicherten Ideen und gehören nicht zur Sicherung; das bestehende Layout hält sie separat im Arbeitsspeicher. Keine persönliche Migration behauptet.

## Konkrete Abnahme in einem neuen Testprofil

Den Head von PR #4 in einem separaten Checkout öffnen, `npm ci`, dann `npm run dev -- --host 127.0.0.1 --port 48239 --strictPort`. Ein frisches Testprofil und ausschließlich künstliche Ideen sowie einen unbrauchbaren Dummy-Schlüssel verwenden. Keine echte Serper-Abfrage starten. Die technische Browserprüfung benötigt eine eigene ausdrückliche Freigabe.

| Schritt | Erwartetes Ergebnis |
| --- | --- |
| Drei Hauptwege, Sammlung und Einstellungen öffnen | Aktuelles Recherchejournal, Symbolnavigation und Illustration erhalten; Eingaben und Quellen bedienbar |
| Zwei künstliche Ideen mit Quellen, Notizen, Gewichten und Bericht speichern; JSON herunterladen | Beide vollständigen Objekte samt IDs und Zeitangaben enthalten; Dummy-Schlüssel aus den Schlüsselablagen nicht enthalten |
| Beschädigte Datei und unbekannte Version wählen | Verständlicher Fehler; vorhandener Speicher unverändert |
| Datei mit neuer Idee und geänderter Kopie einer vorhandenen ID wählen | Vorschau zeigt neu/konfliktbehaftet; ohne ausdrückliche Auswahl kein Speichern |
| Vorschau abbrechen | Speicher unverändert |
| Konflikt zuerst mit Behalten importieren | Neue Idee ergänzt; vorhandenes Objekt und weitere Ideen vollständig erhalten |
| Dieselbe ID bewusst ersetzen | Genau dieses Objekt ersetzt; Original-ID, Quellen, Bericht und Zeitangaben aus Datei erhalten |
| Neu laden und erneut exportieren | Vollständige Objekte entsprechen dem erwarteten Stand, ohne Neuberechnung der Berichte |
| Während der Vorschau in zweitem Testtab speichern | Import lehnt veralteten Speicherstand ab; neuere Daten bleiben erhalten |
| Speicherausfall mit künstlichem Speicher simulieren | Fehlermeldung; gespeicherter und angezeigter Stand nicht als erfolgreich importiert ausgegeben |
| Idee bearbeiten, ohne sie zu speichern | Import gesperrt; Export betrifft nur gespeicherte Ideen |
| Gelöschte Idee importieren und Rückgängig prüfen | Importierte Idee wird durch alten Rückgängig-Eintrag nicht überschrieben |
| Desktop sowie 390 und 320 Pixel Breite | Vorschau, Auswahl und Buttons erreichbar; kein Seitenüberlauf; Tastaturbedienung möglich |

Nach technischer Browserprüfung folgt die visuelle Nutzerabnahme der tatsächlichen App. Feedback am konkreten PR-Head festhalten. Ein grüner Build oder GitHub-Mergefähigkeit ersetzt diese Abnahme nicht. Merge nach `main`, echte Datenübernahme, kostenpflichtige Abfragen und Veröffentlichung bleiben separat.
