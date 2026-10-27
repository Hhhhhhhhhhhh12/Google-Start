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


## Ergänzung: Variantenabgleich vom 27.10.2026

In diesem Chat ausdrücklich bestätigt; Umfang ist Planung, keine Funktionsimplementierung:

| Gegenstand | Entscheidung | Status |
| --- | --- | --- |
| Vollständige Datensicherung | JSON-Export aller Ideen samt Quellen und Berichten ohne API-Schlüssel; geprüfter Import, gleiche ID nur nach Nutzerauswahl ersetzen | Vom User bestätigt; Export/Import im Arbeitszweig umgesetzt, Integration offen |
| Gesamt-Score | Nachrangige Orientierung behalten; Zusammensetzung, Annahmen und fehlende Belege erklären; Formel vorerst erhalten | Vom User bestätigt; Erklärung noch zu ergänzen |
| Was-wäre-wenn und Finanzrechner | Beide als spätere eigenständige Funktionen vormerken | Vom User bestätigt; fachliche Prüfung und Umsetzung offen |

Die bereits im Chat „Local Demand Scanner fortführen“ ausgewählte geführte Oberfläche bleibt berücksichtigt. `codex/local-demand-core-workflows` bei `ac4bb33` ist die empfohlene neueste Arbeitsgrundlage, noch keine hier integrierte oder visuell abgenommene Fassung. Vollständiger Quellenvergleich, Wiederverwendung und Grenzen: [Variantenabgleich](VARIANTENABGLEICH-2026-10-27.txt).


## Umsetzung JSON-Sicherung vom 27.10.2026

Auf ausdrücklichen Folgeauftrag ist D-01 im isolierten Zweig `codex/scout-json-backup-20261027`, aufbauend auf `ac4bb33`, umgesetzt. Datenmodell und Formatversion werden geprüft; bestehende IDs werden nur nach Auswahl ersetzt. Vollständiger technischer Umfang, freigegebene Prüfungen und offene Abnahmestufen stehen in [JSON_BACKUP.md](JSON_BACKUP.md). Die anderen Richtungsentscheidungen bleiben erhalten. Moin-Reparaturen sind der nächste getrennte Arbeitsumfang.
