# Fünf Workflow-Verbesserungen

Stand: 27.10.2026. Ausgangspunkt: `aaace1e`; Arbeitsbranch `codex/local-demand-core-workflows`. Die Migration-Dokumentation in einem anderen Arbeitsbranch wurde nicht integriert.

| Auftrag | Umsetzung | Nachweis |
| --- | --- | --- |
| 1. Speichern/Bearbeiten absichern | ID-basiertes Aktualisieren; Original-Erstellungsdatum, Notizen, Suchbegriffe, Recherche und Gewichte bleiben erhalten. Leere Sammlungen werden gespeichert. Fehler verhindern falsche Erfolgsmeldungen und automatisches Überschreiben nicht lesbarer Daten. Veralteter Bericht verschwindet beim Bearbeiten. | `ideas.test.ts`, `storage.test.ts`; Browser: anlegen, umbenennen, erneut bewerten, neu laden, öffnen, Gewichte/Notizen/Quellen wiederfinden; letzte Idee löschen und erneut laden: leer. |
| 2. Manuelle Recherche | Beobachtungen mit Art, Thema, Region, Quelle, Datum, optionalem Quellenlink und Unsicherheit. Validierung, 0 als bekannter Wert, aktuelle Angabe je Suchbegriff. Quellengebundene Werte in Einschätzung und Export; gespeicherte Originalfelder bleiben erhalten. Query-Builder-Links manuell erreichbar. | `research.test.ts`, bestehende Query-Builder-Tests; Browser: Volumen 120 und Kundenproblem mit Quelle/Datum erfassen und speichern; Wiederöffnen zeigt beide. |
| 3. Drei Hauptwege | Startkarten Idee prüfen, Ideen finden und Ideen vergleichen; Sammlung getrennt erreichbar. Navigation per Tastatur bedienbar, Fokus auf die neue Überschrift. Formular- und Recherche-Details aufklappbar. | Browser: alle drei Wege geöffnet; neue Startansicht und Vergleich direkt angesehen. |
| 4. Regionale Ideenfindung | Nur ausgewählte gültige Beobachtungen derselben normalisierten Region. Angebote nach dem tatsächlichen beobachteten Thema statt bloßem Ortsnamenaustausch; Filter und Quellenübernahme in den Entwurf. Keine Ergebnisse bei fehlenden Signalen. | `generatorEngine.test.ts`; Browser: Freiburg erzeugt Fahrrad-/Gartenservice, Berlin ausschließlich den Solar-Vorschlag seiner eigenen Beobachtung. Zwei Freiburger Vorschläge übernommen, gespeichert und verglichen. |
| 5. Fehler/Schlüssel | Typisierte, geheimnisfreie Fehler bei HTTP, Limit, Schlüssel, Netzwerk, Timeout, Abbruch und ungültigen Antworten. Keine automatischen Wiederholungen; Teilresultate behalten ihre eigenen Daten. Manuelle Daten getrennt von externen Resultaten. Schlüssel nur ausdrücklich speichern; Sitzung als Standard, Gerät freiwillig, beide Ablagen löschbar. | `scraper.test.ts`, `externalResearch.test.ts`, `apiKey.test.ts`; Browser: erfundenen Schlüssel in Sitzung speichern, neu laden, löschen, neu laden: inaktiv. |

## Prüfstand

- Explizite Nutzerfreigabe: gezielte lokale Tests, `npm run test`, `npm run build` sowie Browserprüfung mit Testdaten auf einer eigenen lokalen Adresse.
- 84 Tests in 10 Dateien bestanden. TypeScript/Vite-Build bestanden. Quellen- und Diff-Prüfung durchgeführt.
- Browser auf `http://127.0.0.1:48174/`, ausschließlich eigens eingegebene Testdaten; kein Auslesen des ursprünglichen Browserprofils oder seiner bisherigen lokalen App-Adresse.
- Externe Fehler und Antworten ausschließlich simuliert. Keine echten Serper-Abfragen und keine Kosten ausgelöst.
- Technische Browserprüfung ist erfolgt; visuelle Nutzerabnahme, Integration und Veröffentlichung sind offen. Keine umfassende Barrierefreiheits- oder Geräte-Zertifizierung behauptet.

## Bediengrenzen

Vorgemerkte Beobachtungen und ungespeicherte Entwürfe bleiben bis zum Speichern vorläufig. Bei einem Wechsel zu einer neuen oder anderen Idee wird vor dem Verwerfen ungespeicherter Änderungen gefragt. Rückgängig für Löschungen gilt während der geöffneten Seite. Exakte Regionszuordnung ist bewusst erforderlich; ein automatischer Abgleich von Stadt, Stadtteil und Umland ist nicht Teil des Auftrags.

Die Gewichtungs-/Scoring- und Query-Builder-Funktionen bleiben erhalten. Fehlende Anbieterbewertungen werden bei der Durchschnittsbildung als unbekannt behandelt; ein erfasstes Volumen 0 und ein tatsächlich beobachteter stabiler Trend zählen als vorhandene Angaben. Diese fachlichen Korrekturen können Scores oder Vollständigkeitswerte verändern.
