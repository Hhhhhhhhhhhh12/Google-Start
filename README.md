# Local Demand Scanner

Local Demand Scanner ist eine lokale React/Vite-App zur Bewertung regionaler Business-Ideen.

Die App kombiniert manuell erhobene Signale:

- Keyword-Ideen
- lokale Konkurrenzsignale
- Pain Points aus Rezensionen
- Dringlichkeit
- Zahlungsbereitschaft
- kommerzieller Konkurrenzdruck

## Aktueller Stand

Implementiert sind:

- React + Vite + TypeScript Setup
- Datenmodell für Business-Ideen
- Scoring-Modell mit Tests (14/14 passing)
- Research Query Builder mit Tests
- Multi-Ideen-Sidebar mit Score-Anzeige
- Speicherung in localStorage (offline-first)
- Editor für Titel, Region, Zielgruppe, Keywords, Notizen
- Quellen-Checkliste (Keyword Planner, Trends, Maps, Reviews, CPC)
- Evidence-Quality Badge (incomplete → strong)
- Gruppierte Recherche-Links (Google Search, Maps, Trends, Pain Points)

Noch nicht implementiert:

- Erweiterte Research-Workflow-Felder (Suchvolumen, Trend-Notizen, Competitor-Details)
- Vergleichstabelle
- Import/Export
- Business Idea Generator

## Wichtig

Die App nutzt keine Google APIs und betreibt kein Scraping. Recherchelinks werden nur lokal generiert und manuell geöffnet.

## Entwicklung

```bash
npm install
npm run dev
npm run test
npm run build
```

## Roadmap

Siehe [Roadmap.md](./Roadmap.md) für die vollständige Projektplanung.