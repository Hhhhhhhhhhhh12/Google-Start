# Ideen Scout

**Was braucht deine Stadt?**

Geschäftsideen für deine Region festhalten, mit Quellen prüfen und miteinander vergleichen — in einem übersichtlichen Recherchejournal.

![Ideen Scout: Recherchejournal mit Symbolnavigation, drei Prüfschritten und regionaler Illustration](docs/images/recherchejournal.png)

## Drei Wege zu einer fundierteren Idee

| | Damit hilft dir Ideen Scout |
| --- | --- |
| **Idee prüfen** | Angebot skizzieren, Beobachtungen sammeln und offene Fragen erkennen. |
| **Ideen finden** | Aus ausgewählten regionalen Beobachtungen neue Angebote ableiten. |
| **Ideen vergleichen** | Datenbasis, Einschätzungen und fehlende Belege nebeneinander betrachten. |

Ideen und Quellen bleiben im lokalen Browserspeicher. Einschätzungen entstehen aus Regeln und Annahmen; sie sind keine Marktvalidierung. Die optionale Serper-Recherche startet nur auf deinen Klick und kann Credits verbrauchen.

## Lokal starten

React · TypeScript · Vite

```bash
npm ci
npm run dev
```

Die im Terminal angezeigte lokale Adresse im Browser öffnen.

[Bedienung & Datenbasis](docs/BEDIENUNG.md) · [Roadmap](Roadmap.md) · [Layout & Prüfnachweise](docs/GUIDED_LAYOUT.md)

## Bestätigte Produktausrichtung

Ideen Scout ist eine nachvollziehbare Recherchehilfe mit belegbaren Daten und optionaler Serper-Unterstützung. Die vorhandenen Regeln und Vorlagen ersetzen keine generative KI oder tatsächliche Marktvalidierung. Quellen, Annahmen, Schätzungen und fehlende Belege müssen erkennbar bleiben.

Die Recherchefunktionen und das Recherchejournal sind bereits in `main` enthalten. Die vollständige JSON-Sicherung ist in diesem PR-Arbeitsstand ergänzt; Nutzerabnahme und Integration nach `main` stehen aus. Browserdaten gehören zur jeweiligen lokalen Adresse und zum Browserprofil; ein Quellcodewechsel überträgt sie nicht.

[Bestätigte Entscheidungen](docs/DECISIONS.md) · [Historische Migration](docs/MIGRATION.md) · [Integrationsplan und Abnahme](docs/INTEGRATION_2026-10-31.md)

## Vollständige JSON-Sicherung

Unter **Sammlung → Sammlung sichern oder importieren** lässt sich die gespeicherte Ideensammlung mit Quellen, Berichten, Gewichten, IDs und Zeitangaben herunterladen. API-Schlüssel und Einstellungen werden nicht aus ihren Speicherablagen gelesen oder exportiert; selbst in Notizen eingetragene Geheimnisse sind jedoch normaler Dateiinhalt.

Der Import zeigt zunächst eine Vorschau. Jede vorhandene ID verlangt ausdrücklich **Behalten** oder **Ersetzen**. Erst **Import jetzt speichern** schreibt die Daten; andere vorhandene Ideen bleiben erhalten. Ungespeicherte Ideenentwürfe, laufende Abfragen, ungültige Dateien, Speicherfehler und veraltete Vorschauen blockieren den Import. Maximal 10 MiB und 10.000 Ideen; vollständige ältere JSON-Arrays werden ebenfalls geprüft.

[Datenumfang und Grenzen](docs/JSON_BACKUP.md) · [Abnahmeplan](docs/JSON_ACCEPTANCE.md)
