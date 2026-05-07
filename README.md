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
- Scoring-Modell mit Tests
- Research Query Builder mit Tests
- Beispielansicht mit Score und ersten Recherchelinks

Noch nicht implementiert:

- Speicherung in localStorage
- Editor für mehrere Ideen
- Vergleichstabelle
- Import/Export
- echte API-Anbindungen

## Wichtig

Die App nutzt derzeit keine Google APIs und betreibt kein Scraping. Recherchelinks werden nur lokal generiert und manuell geöffnet.

## Entwicklung

```bash
npm install
npm run dev
npm run test
npm run build


## Roadmap

### Feature: Business Idea Generator

The app should later suggest possible local business ideas based on user-provided research signals.

Input examples:
- region
- interest areas
- keyword lists
- manually collected Google Trends / Keyword Planner terms
- copied review snippets or pain points
- local service categories

Expected output:
- suggested business idea title
- target audience
- possible keywords
- generated research queries
- assumed pain point
- validation checklist
- warning that the suggestion is a hypothesis, not validated market proof

Constraints:
- no Google scraping
- no paid APIs in the MVP
- all suggestions should be explainable
- generated ideas must be clearly marked as hypotheses