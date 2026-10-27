# Local Demand Scanner / Ideen Scout

Lokale Recherchehilfe für regionale Geschäftsideen mit React, Vite und TypeScript. Die Seitenleiste führt durch **Idee prüfen**, **Ideen finden** und **Ideen vergleichen**. Bewertungen und Vorschläge beruhen auf festen Regeln; ein hoher Score ist keine Marktvalidierung.

## Bedienung

- **Idee prüfen:** Die drei Schritte „Idee“, „Beobachtungen“ und „Einschätzung“ führen durch die Prüfung. Mit Titel und optionaler Region beginnen. Suchbegriffe, Zielgruppe und Notizen lassen sich ergänzen. „Entwurf speichern“ sichert die Eingaben; „Prüfen und speichern“ erstellt lokal eine neue Einschätzung. Geänderte Eingaben blenden den vorherigen Bericht aus. Gespeicherte Ideen werden anhand ihrer festen ID bearbeitet, auch beim Umbenennen.
- **Manuelle Recherche:** Unter „Beobachtung hinzufügen“ Art, Thema, Region, Quelle und Datum erfassen. Quellenlinks und Unsicherheiten sind optional. Suchvolumen, Trend, Anbieterzahl und Kundenprobleme können die Einschätzung ergänzen; 0 ist ein gültiger erfasster Wert. Recherchelinks aus dem Query Builder werden erst auf ausdrücklichen Klick geöffnet.
- **Ideen finden:** Eine Region wählen, passende Beobachtungen aus gespeicherten Ideen auswählen oder neue vormerken. Vorschläge tragen ihre verwendeten Quellen und ihr Datum mit. Neue Beobachtungen werden beim Übernehmen eines Vorschlags Teil des Entwurfs und mit dessen Speicherung gesichert. Ein anderer Regionsname allein erzeugt keine erfundenen Nachfragesignale.
- **Ideen vergleichen:** Gespeicherte Berichte mit Orientierungs-Score, Datenbasis, passenden Beobachtungen und fehlenden Kennzahlen nebeneinander ansehen.

„Sammlung“ und „Einstellungen“ sind getrennte Bereiche in der Seitenleiste. Entwürfe und noch nicht vorgemerkte Recherche-Eingaben bleiben beim Wechsel zwischen diesen Bereichen während der Sitzung erhalten.

Die Sammlung liegt im Browserspeicher. Ungespeicherte Änderungen sind gekennzeichnet. Löschen wird auch für die letzte Idee gespeichert; in der laufenden Seite kann es rückgängig gemacht werden. Nicht lesbare Daten werden nicht automatisch überschrieben. Der Berichtsexport enthält die Quellen und Beobachtungen. Unter „Sammlung → Sammlung sichern oder importieren“ gibt es zusätzlich eine vollständige JSON-Sicherung mit geprüftem Wiederimport.

## Vollständige JSON-Sicherung

- „JSON-Sicherung herunterladen“ exportiert die gespeicherte Sammlung mit allen Modellfeldern, einschließlich Quellen, Berichten, Gewichten, IDs und Zeitangaben. API-Schlüssel, Browsereinstellungen und ungespeicherte Eingaben gehören nicht zur Sicherung.
- Eine JSON-Datei auswählen, die Vorschau prüfen und für jede vorhandene Ideen-ID ausdrücklich „behalten“ oder „ersetzen“ wählen. Erst „Import jetzt speichern“ schreibt die Daten. Neue IDs werden hinzugefügt; andere vorhandene Ideen bleiben erhalten.
- Fehlerhafte Daten, doppelte Ideen-/Beobachtungs-IDs, unbekannte Felder/Versionen und Dateien über 10 MiB werden abgewiesen. Maximal 10.000 Ideen pro Sammlung. Ältere JSON-Arrays ohne Formatversion werden unterstützt, sofern sie die vollständige Modellprüfung bestehen.
- Ungespeicherte Ideenentwürfe und laufende externe Abfragen sperren den Import. Bei nicht lesbarem Originalspeicher bleiben Import und Export gesperrt. Speicherfehler und Änderungen aus anderen Tabs verhindern ein Überschreiben aus einer veralteten Vorschau.
- Für einen Umzug: an der bisherigen App-Adresse exportieren, die Datei an der neuen Adresse auswählen, Vorschau prüfen und ausdrücklich importieren. Die bisherige Sammlung wird dadurch nicht gelöscht. Quellenrichtigkeit und eine tatsächliche Übertragung deiner persönlichen Browserdaten werden nicht automatisch bestätigt.

Technischer Stand und Prüfnachweise: [JSON-Sicherung](docs/JSON_BACKUP.md).

## Optionale externe Recherche

Serper kann Such- und Maps-Ergebnisse ergänzen. Der normale Prüfweg arbeitet lokal. Eine externe Anfrage beginnt ausschließlich über „Such- und Maps-Abfrage starten“ und sendet Titel und Region an Serper; dabei können Credits anfallen. Es wurden für diese Änderungen keine echten Serper-Abfragen ausgeführt.

Schlüssel werden in den Einstellungen ausdrücklich über „Schlüssel verwenden“ hinterlegt, standardmäßig nur für die Browsersitzung. „Auf diesem Gerät speichern“ ist freiwillig. „Schlüssel löschen“ entfernt Sitzungskopie und Geräteablage. Eine Geräteablage ist für JavaScript unter derselben Adresse zugänglich. Abfragefehler werden verständlich angezeigt; bei Teilfehlern bleiben vorhandene Quellen mit ihrem jeweiligen Abrufdatum erhalten. Manuelle Angaben werden durch externe Ergebnisse nicht überschrieben.

## Datenbasis und Grenzen

Quellen, manuelle Angaben, Annahmen und ungeklärte ältere Berichte werden gekennzeichnet. Trefferzahlen werden nicht in monatliches Suchvolumen umgerechnet. Die Recherche-Vollständigkeit bestätigt keine unabhängig geprüfte Datenqualität. Manuelle Beobachtungen gelten für die ausdrücklich angegebene Region; die App führt keine automatische geografische Zuordnung durch.

Der Speicher gehört zur lokalen Adresse und zum Browserprofil. Projektordner oder Quellcode nach GitHub zu kopieren überträgt keine Browserdaten oder Schlüssel.

## Entwicklung und Prüfstatus

Vorhandene Befehle: `npm run dev`, `npm run test`, `npm run build`, `npm run lint`. Ihre Existenz erteilt keine Testfreigabe. Technische Prüfungen werden gemäß Projektanweisung nur im ausdrücklich freigegebenen Umfang ausgeführt.

Layout, Prüfumfang und Abnahmestufen: [Geführtes Layout](docs/GUIDED_LAYOUT.md).

Weitere Prüfnachweise und offene Abnahmestufen: [Workflow-Verbesserungen](docs/WORKFLOW_IMPROVEMENTS.md). Weitere Aufgaben: [Roadmap](Roadmap.md).
