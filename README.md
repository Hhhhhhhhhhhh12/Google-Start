# Ideen Scout

Ideen Scout ist ein Prototyp zur Recherche regionaler Geschäftsideen. Die App verwendet React, TypeScript und Vite.

## Bestätigte Richtung

Am 27.10.2026 bestätigt: **Recherchehilfe mit belegbaren Daten; Automatik unterstützt.** Serper bleibt eine freiwillige Ergänzung. Datenherkunft, Annahmen und Schätzungen müssen erkennbar sein. Berichte und Ideen entstehen derzeit durch feste Regeln und Vorlagen; eine angebundene generative KI gibt es im aktuellen App-Einstieg nicht.

## Im Quellcode vorhanden

- Übersicht gespeicherter Ideen, Eingabe von Idee, Region und Zielgruppe.
- Regelbasierte Bewertung und Bericht mit Strategie, SWOT und vorgeschlagenen nächsten Schritten.
- Optionale Abfragen an Serper für Maps- und Suchergebnisse.
- Ideenableitung aus Eingabebegriffen nach festen Kombinationsregeln.
- Vergleich gespeicherter Berichte und einstellbare Bewertungsgewichte.
- Speicherung von Ideen im lokalen Browserspeicher und Export eines Berichts als Markdown.

Diese Aufzählung beschreibt den gelesenen Quellcode. Sie bestätigt keine erfolgreiche technische Prüfung oder visuelle Abnahme.

## Grenzen des übernommenen Prototyps

- Ohne Serper verwendet die Bewertung vorbelegte Annahmen. Auch mit Serper bleiben unter anderem Dringlichkeit, Zahlungsbereitschaft und Trend vorbelegt.
- Das als monatliches Suchvolumen verwendete Signal wird aus Trefferzahlen und Anzeigen geschätzt. Es ist kein gemessenes monatliches Suchvolumen.
- Quellenbezeichnungen und Aussagen wie „Live“, „datenbasierte Fakten“ oder „AI Business Validator“ sind im aktuellen Code nicht durchgängig durch die tatsächliche Datenherkunft gedeckt.
- Typen und Hilfsfunktionen für manuelle Recherche existieren; die frühere vollständige Rechercheoberfläche ist im aktuellen `src/App.tsx` nicht vorhanden.
- Serper-Schlüssel werden derzeit im lokalen Browserspeicher gespeichert. Externe Abfragen und deren Kosten sind keine Voraussetzung für die Migration.
- Berichtsexport ist vorhanden; ein vollständiger, wieder einlesbarer Datenexport und Datenimport fehlen.

Prioritäten, Einordnung der alten Fertigmeldungen und bestätigte Entscheidungen stehen in [Roadmap.md](Roadmap.md) und [docs/DECISIONS.md](docs/DECISIONS.md). Hinweise zur Übernahme stehen in [docs/MIGRATION.md](docs/MIGRATION.md).

## Entwicklung

Nach einer ausdrücklich freigegebenen Einrichtung: Abhängigkeiten mit `npm install` installieren; die vorhandenen Befehle sind `npm run dev`, `npm run test`, `npm run lint` und `npm run build`. Technische Tests, Builds und Laufzeitprüfungen benötigen die ausdrückliche Freigabe des Users für den konkreten Umfang.

Browserdaten gehören zur jeweiligen lokalen Adresse und zum Browserprofil. Eine Kopie des Quellcodes überträgt gespeicherte Ideen oder API-Schlüssel nicht automatisch.
