# Ideen Scout

**Lokaler Business-Ideen-Validator** — datenbasierte Marktanalyse ohne Cloud, ohne Abo.

![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)
![Tests](https://img.shields.io/badge/Tests-21%20passing-10b981)
![License](https://img.shields.io/badge/Lizenz-MIT-f59e0b)

---

## Was ist Ideen Scout?

Ideen Scout hilft dir, lokale Geschäftsideen schnell und systematisch zu validieren. Du gibst eine Idee ein — die App berechnet einen Demand-Score, erstellt eine vollständige Marktanalyse mit SWOT, schlägt Verbesserungen vor und vergleicht mehrere Ideen nebeneinander.

Alles läuft lokal im Browser. Keine Accounts, keine Server, keine monatlichen Kosten. Optional: echte Live-Daten via [Serper API](https://serper.dev) (Google Maps + Suche).

---

## Features

- **Scoring-Engine** — Demand-Score (0–100) aus Konkurrenz, Suchvolumen, Trend, Dringlichkeit, Zahlungsbereitschaft
- **Score-Aufschlüsselung** — interaktive Visualisierung welche Faktoren wie viel zum Score beitragen
- **Marktanalyse** — vollständiger Report mit SWOT, Target Persona, Erlösmodellen und Go-to-Market-Strategie
- **Verbesserungsvorschläge** — automatische Pivot-, Nischen- und Strategie-Empfehlungen basierend auf Schwachstellen
- **Ideen-Vergleich** — Winner-Highlighting, Score-Bars und Detailtabelle für mehrere validierte Ideen
- **Ideen ableiten** — Generator für neue Hypothesen aus Suchtrends und Interessen
- **Evidence-Qualität** — Fortschrittsanzeige wie vollständig und verlässlich die Datenbasis ist
- **Export** — Analysebericht als Markdown-Datei
- **Offline-First** — alle Ideen in `localStorage`, kein Backend nötig
- **Simulations-Modus** — funktioniert vollständig ohne API-Key mit realistischen Demo-Daten

---

## Setup

```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev

# Tests ausführen (21 Tests)
npm test

# Production-Build
npm run build
```

---

## API-Key (optional)

Ohne Key läuft die App im **Simulations-Modus** mit heuristisch generierten Daten — ideal zum Ausprobieren.

Für **echte Live-Daten** aus Google Maps und Google Suche:

1. Kostenlosen API-Key bei [serper.dev](https://serper.dev) erstellen (2.500 kostenlose Anfragen/Monat)
2. Key oben rechts in der App eintragen
3. Key wird in `sessionStorage` gespeichert (weg nach Tab-Schließen)

---

## Tech Stack

| Schicht | Technologie |
|---|---|
| Framework | React 19 |
| Sprache | TypeScript 6 |
| Build | Vite 8 |
| Tests | Vitest 4 |
| Styling | Vanilla CSS mit Custom Properties |
| Daten | localStorage (offline-first) |

---

## Projektstruktur

```
src/
  components/       # UI-Komponenten (HomeView, EvaluateView, DiscoverView, CompareView)
  lib/              # Business-Logik (scoring, marketAnalysis, improvementEngine, ...)
  types.ts          # TypeScript-Interfaces
  App.tsx           # Shell mit State & Event-Handlers
  App.css           # Design-System mit CSS Custom Properties
```

---

## Lizenz

MIT — siehe [LICENSE](./LICENSE)
