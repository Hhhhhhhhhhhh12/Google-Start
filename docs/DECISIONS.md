# Entscheidungen und geklärte Widersprüche

## Bestätigt am 27.10.2026

| Gegenstand | Geltungsbereich | Entscheidung | Status |
| --- | --- | --- | --- |
| Produktziel | Ideen Scout | Recherchehilfe mit belegbaren Daten; Automatik unterstützt | Vom User bestätigt |
| Serper | Ideen Scout | Freiwillige Ergänzung; Datenherkunft und Schätzungen klar ausweisen | Vom User bestätigt; fachliche Anpassungen noch offen |
| GitHub-Standardzweig | Repository Google-Start | `main` statt des älteren Zweigs mit Job Radar als Standardansicht | Vom User bestätigt |
| Reihenfolge | Antigravity-Übernahme | Zuerst Ideen Scout, danach Schnacker; Quellstände zu GitHub und Weiterarbeit in Codex vorbereiten | Vom User beauftragt |

## Widersprüche der bisherigen Dokumentation

| Alte Aussage | Quellbefund am Übernahmestand | Geklärte Einordnung |
| --- | --- | --- |
| README: keine APIs, kein Scraping | `App.tsx` ruft Funktionen aus `lib/scraper.ts` auf, die Serper abfragen | README beschreibt einen älteren Stand; optionale Serper-Nutzung ist vorhanden und bleibt Zielbestandteil |
| README: Vergleich, Generator, Recherchefelder, Export fehlen | Vergleich, regelbasierte Ableitung und Berichtsexport sind im aktuellen Einstieg vorhanden | Nicht pauschal als fehlend führen; Berichtsexport ist kein vollständiger Datenexport |
| Roadmap: manueller Rechercheworkflow abgeschlossen | Viele Datentypen existieren, die aktuelle Oberfläche erfasst aber hauptsächlich Idee, Region, Zielgruppe und Gewichte | Frühere Implementierung und heutige Bedienbarkeit auseinanderhalten; manueller Rechercheablauf bleibt offen |
| Roadmap: fertiger AI Business Validator mit Marktinsights | Berichte und Generator beruhen auf Regeln/Vorlagen; kein generatives Modell im aktuellen Aufrufpfad | Prototyp einer Recherchehilfe; keine abgeschlossene KI- oder Marktvalidierung |
| Roadmap: Suchvolumen und Trends validiert | Trefferzahlen werden als Volumensignal geschätzt; Trends und weitere Faktoren bleiben vorbelegt | Belegbare Daten haben Vorrang; Schätzungen und fehlende Belege gesondert ausweisen |
| Roadmap: alle Phasen abgeschlossen | Quellenkennzeichnung, Datenqualität, manueller Workflow und vollständiger Datentransfer haben offene Punkte | Einzelstatus in der neuen Roadmap; keine pauschale Fertigmeldung |

## Grenzen und noch offene Umsetzung

Die Entscheidungen betreffen Ziel und Dokumentation. Die App wurde dadurch fachlich noch nicht umgebaut. Technische Tests, Builds, Laufzeitprüfungen, visuelle Abnahme und öffentliche App-Veröffentlichung sind im Migrationsauftrag nicht ausdrücklich freigegeben. Die beauftragte GitHub-Sicherung ist davon getrennt.
