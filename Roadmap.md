# Roadmap — Ideen Scout

Stand: 27.10.2026. Grundlage: Quellprüfung des übernommenen Hauptzweigs `97b332d`, ohne Ausführung der App oder technischer Prüfungen.

## Ziel und Statusregeln

Bestätigtes Ziel: **Recherchehilfe mit belegbaren Daten; Automatik unterstützt.** Serper bleibt optional. Die frühere pauschale Aussage „alle Phasen abgeschlossen“ wird durch die folgenden Einzelstände ersetzt. Vorhandener Code, technische Prüfung, visuelle Abnahme und Veröffentlichung sind verschiedene Zustände.

## Übernommener Stand

| Bereich | Im Quellcode vorhanden | Grenze / nächster Bedarf |
| --- | --- | --- |
| Ideensammlung | Speichern, Öffnen und Löschen; lokale Speicherung | Speichern und insbesondere Löschen der letzten Idee später gezielt prüfen; kein vollständiger Datenimport/-export |
| Bewertung und Bericht | Gewichteter Score, Bericht, SWOT, Strategie | Vorbelegte Annahmen werden zu weitreichend interpretiert; keine belastbare Validierung bestätigt |
| Externe Recherche | Optionaler Serper-Aufruf für Maps und Suche | Herkunft, Abruffehler, Abdeckung und Kosten sichtbar machen; kein Nachweis von Keyword-Planner- oder Trends-Abfragen |
| Manuelle Recherche | Datenfelder, Typen und Hilfslogik teilweise vorhanden | Der vollständige manuelle Arbeitsablauf ist in der aktuellen Oberfläche nicht vorhanden |
| Ideen ableiten | Regelbasierte Kombination von Eingaben, Kennzeichnung als Hypothese | Hinweise auf aktuelle Suchtrends und hohes Potenzial sind so nicht belegt |
| Vergleich | Tabelle gespeicherter Berichte | Übernimmt deren Datenlücken; Anzeige unvollständiger Daten später prüfen |
| Export | Bericht als Markdown | Keine vollständige Sicherung der Ideensammlung und kein Import |
| Prüfungen | Drei Testdateien für Bewertungs-, Anfrage- und Berichtslogik | Bei dieser Migration nicht ausgeführt; alte grüne Zähler sind keine aktuelle Freigabe |

## Priorität 1 — Daten ehrlich einordnen

Noch umzusetzen, keine technische Umsetzung durch diese Dokumentänderung:

- [ ] Gemessene Werte, abgeleitete Schätzungen, manuelle Angaben und Demo-Annahmen getrennt kennzeichnen.
- [ ] Aus Google-Treffern abgeleitete Werte nicht als gemessenes monatliches Suchvolumen ausgeben.
- [ ] Fehlende Trend-, Zahlungsbereitschafts- und Kundendaten als fehlend behandeln; neutrale Vorgaben nicht als Untersuchungsergebnis darstellen.
- [ ] Quellen und Recherche-Checkliste aus tatsächlich vorhandenen Belegen ableiten; Serper-Suche ersetzt keine Keyword-Planner-, CPC- oder Trends-Prüfung.
- [ ] Quellenbezeichnungen, „Live“-Badge, UI-Versprechen und Berichtsexport an die tatsächliche Datenbasis anpassen.
- [ ] Ideen aus Vorlagen als Hypothesen beschreiben; unbewiesene Trend- und Potenzialaussagen entfernen oder begründen.

## Priorität 2 — Belegbare Recherche unterstützen

- [ ] Einen überschaubaren manuellen Rechercheablauf ausarbeiten: Beobachtung, Quelle, Region, Abrufdatum, Kennzahl und Unsicherheit.
- [ ] Vorhandene Recherchefelder und Hilfsfunktionen nach Eignung wiederverwenden; keine automatische Wiederherstellung der alten Oberfläche.
- [ ] Serper als freiwillige Ergänzung mit nachvollziehbaren Abruffehlern und Quellen behandeln.
- [ ] Aufbewahrung und Löschung des Serper-Schlüssels sowie Einsatzgrenzen vor breiterer Nutzung klären.
- [ ] Abdeckung/Verlässlichkeit der Belege getrennt vom Attraktivitäts-Score erklären.

## Priorität 3 — Daten und Bedienung absichern

- [ ] Vollständigen Datenexport und Import als gesonderten Umfang planen.
- [ ] Persistenz beim letzten Löschvorgang und beim Bearbeiten vorhandener Ideen prüfen.
- [ ] Vergleich und Export auch bei fehlenden Belegen verständlich gestalten.
- [ ] Die bestehenden unveröffentlichten Korrekturen auf `codex/local-demand-build-fix` getrennt prüfen; nicht als Teil dieser Migration übernehmen.

## Spätere Freigaben

- [ ] Begrenzten technischen Prüfumfang ausdrücklich freigeben lassen und durchführen.
- [ ] Oberfläche im freigegebenen Umfang ansehen und visuell abnehmen.
- [ ] Funktionsänderungen separat zur Integration freigeben.
- [ ] Hosting, öffentliche App-Veröffentlichung oder echte kostenpflichtige Abfragen separat beauftragen.

Die bestätigten Richtungsentscheidungen und die Auflösung der alten Widersprüche stehen in [docs/DECISIONS.md](docs/DECISIONS.md). Die alte Roadmap bleibt in der Git-Historie des Übernahmestands erhalten.
