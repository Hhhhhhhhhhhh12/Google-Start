# Idea Scout

**Local Business Idea Validator** — data-driven market analysis, no cloud, no subscription.

[🇩🇪 Deutsch / German](./README.md)

![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)
![Tests](https://img.shields.io/badge/Tests-21%20passing-10b981)
![License](https://img.shields.io/badge/License-MIT-f59e0b)

---

## What is Idea Scout?

Idea Scout helps you quickly and systematically validate local business ideas. You enter an idea — the app calculates a Demand Score, generates a full market analysis with SWOT, suggests improvements, and compares multiple ideas side by side.

Everything runs locally in the browser. No accounts, no servers, no monthly fees. Optionally: real live data via [Serper API](https://serper.dev) (Google Maps + Search).

---

## Features

- **Scoring Engine** — Demand Score (0–100) based on competition, search volume, trend, urgency, and willingness to pay
- **Score Breakdown** — interactive visualization of which factors contribute how much to the score
- **Market Analysis** — full report with SWOT, Target Persona, revenue models, and Go-to-Market strategy
- **Improvement Suggestions** — automatic pivot, niche, and strategy recommendations based on weaknesses
- **Idea Comparison** — winner highlighting, score bars, and detail table for multiple validated ideas
- **Idea Derivation** — generator for new hypotheses from search trends and interests
- **Evidence Quality** — progress indicator showing how complete and reliable the data basis is
- **Export** — analysis report as a Markdown file
- **Offline-First** — all ideas stored in `localStorage`, no backend needed
- **Simulation Mode** — works fully without an API key using realistic demo data

---

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests (21 tests)
npm test

# Production build
npm run build
```

---

## API Key (optional)

Without a key, the app runs in **Simulation Mode** with heuristically generated data — ideal for trying it out.

For **real live data** from Google Maps and Google Search:

1. Create a free API key at [serper.dev](https://serper.dev) (2,500 free requests/month)
2. Enter the key in the top right of the app
3. The key is stored in `sessionStorage` (cleared when the tab is closed)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript 6 |
| Build | Vite 8 |
| Tests | Vitest 4 |
| Styling | Vanilla CSS with Custom Properties |
| Data | localStorage (offline-first) |

---

## Project Structure

```
src/
  components/       # UI components (HomeView, EvaluateView, DiscoverView, CompareView)
  lib/              # Business logic (scoring, marketAnalysis, improvementEngine, ...)
  types.ts          # TypeScript interfaces
  App.tsx           # Shell with state & event handlers
  App.css           # Design system with CSS custom properties
```

---

## License

MIT — see [LICENSE](./LICENSE)
