# Roadmap — Ideen Scout

Lokaler Business-Ideen-Validator: datenbasierte Marktanalyse ohne Cloud, ohne Abo.

---

## ✅ Phase 1: MVP & Scoring-Engine

- [x] React 19 + Vite + TypeScript + Vitest Setup
- [x] Idee eingeben (Titel, Region, Zielgruppe)
- [x] Demand-Score 0–100 mit gewichteten Komponenten
- [x] Scoring-Faktoren: Konkurrenz, Suchvolumen, Trend, Dringlichkeit, Zahlungsbereitschaft, Pain Points
- [x] Keyword-Tracking mit monatlichem Suchvolumen
- [x] Trend-Richtung (steigend / stabil / fallend / saisonal)
- [x] Competitor-Felder (Name, Rating, Bewertungen)
- [x] Pain-Point-Tagging (Service, Preis, Erreichbarkeit, Qualität)
- [x] Evidence-Quality-Fortschritt (unvollständig → stark)
- [x] `localStorage` Persistenz — offline-first
- [x] 21 Vitest-Tests für Scoring-Logik

---

## ✅ Phase 2: Marktanalyse & Report

- [x] Vollständiger Analysebericht mit SWOT-Matrix
- [x] Target Persona (Demografie, Motivationen, Schmerzpunkte)
- [x] Erlösmodelle (3 Empfehlungen mit Begründung)
- [x] Go-to-Market-Strategie (erster Monat, erste 3 Monate)
- [x] Organische Suchergebnisse & „People Also Ask" via Serper API
- [x] Google Maps Konkurrenzdaten via Serper API
- [x] Simulations-Modus (vollständig offline ohne API-Key)
- [x] Export als Markdown-Datei

---

## ✅ Phase 3: Ideen-Generator & Vergleich

- [x] Ideen ableiten aus Suchbegriffen + Interessen (Mock-KI)
- [x] Auto-Populate: abgeleitete Idee direkt in Validierung übernehmen
- [x] CompareView: Ideen nebeneinander vergleichen
- [x] Winner-Highlighting: Score-Bars, Rang-Badges, beste Werte hervorgehoben
- [x] Detailvergleichs-Tabelle mit allen Metriken

---

## ✅ Phase 4: Design-System & Architektur

- [x] CSS Custom Properties (`:root` mit 50+ semantischen Tokens)
- [x] Alle Hex-Farben in Variablen überführt (info, danger, success, warning, orange, teal, slate, sky …)
- [x] App.tsx von ~840 auf ~230 Zeilen reduziert (Monolith → Shell)
- [x] Komponenten-Split: `HomeView`, `EvaluateView`, `DiscoverView`, `CompareView`
- [x] `.flex-row` Utility-Klasse, `button:disabled`-Styling
- [x] Mobile-Breakpoints bei 768px und 480px
- [x] `sessionStorage` statt `localStorage` für API-Key (Security)
- [x] In-Page Error-Banner statt `alert()`
- [x] `aria-label` auf Delete-Buttons, `focus-visible` Outline

---

## ✅ Phase 5: Scoring-Transparenz & What-If-Simulator

- [x] **Score-Aufschlüsselung**: 6 Komponenten als farbige Balken (grün/gelb/rot)
- [x] **What-If-Simulator**: 8 Schieberegler + Trend-Dropdown für hypothetische Szenarien
- [x] Real-time Neuberechnung ohne gespeicherte Daten zu verändern
- [x] Delta-Badges an jedem Balken (↑+12 / ↓−8)
- [x] Original- vs. Simulations-Score-Vergleich mit Diff-Anzeige
- [x] Ghost-Bars: originale Werte bleiben als Referenz sichtbar

---

## ✅ Phase 6: Portfolio-Filter

- [x] **Freitextsuche** über Titel, Region, Zielgruppe
- [x] **Regions-Filter** (Dropdown, dynamisch aus gespeicherten Ideen)
- [x] **Mindest-Score-Filter** (≥ 25 / 50 / 70 / 85)
- [x] **Sortierung** nach Datum, Score, Titel, Region (auf-/absteigend)
- [x] Zähler "X / Y" zeigt gefilterte vs. Gesamt-Ideen
- [x] Score-Badges und Mini-Balken direkt in der Ideen-Karte

---

## 🔭 Mögliche nächste Schritte

### Features

- [ ] **JSON/CSV Export + Import** — Datenportabilität zwischen Geräten, Backup/Restore
- [ ] **Financial Feasibility** — CAC/LTV-Schätzung, Break-Even, Business-Model-Canvas
- [ ] **PDF-Export** — Teilbarer Report für Investoren/Mentoren
- [ ] **Dark Mode** — CSS Custom Properties machen das straightforward
- [ ] **Component Tests** — bisher nur `lib/` getestet, keine React-Komponenten-Tests

### Infrastruktur

- [ ] **Backend-Proxy** für API-Key (für öffentliches Deployment)
- [ ] **PWA** — Service Worker + Manifest für Installation
- [ ] **i18n** — Englische Übersetzung (Strings aktuell nur Deutsch)

---

## Tech Stack

| Schicht | Technologie |
|---|---|
| Framework | React 19 |
| Sprache | TypeScript 6 |
| Build | Vite 8 |
| Tests | Vitest 4 (21 Tests) |
| Styling | Vanilla CSS mit Custom Properties |
| Daten | localStorage (offline-first) |
| API | Serper.dev (optional, Google Maps + Suche) |
