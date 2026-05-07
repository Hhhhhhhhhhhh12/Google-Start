# Roadmap - Local Demand Scanner

## 🎯 Project Vision
A local-first, API-free tool to filter and validate business ideas based on demand signals and competitor analysis.

## ✅ Phase 1: MVP (Abgeschlossen)
- [x] **Core Stack**: React + Vite + TypeScript + Vanilla CSS setup.
- [x] **Idea Management**: Multi-idea sidebar for switching between concepts.
- [x] **Active Editing**: Form for Title, Region, Audience, and Notes.
- [x] **Data Persistence**: `localStorage` integration for offline-first usage.
- [x] **Scoring Engine**: Preliminary Demand Score calculation (0-100).
- [x] **Keyword Integration**: Scoring contribution based on search term relevance.
- [x] **Query Builder**: Automated generation of deep-link research queries.
- [x] **UI Feedback**: Score explanation cards and visual indicators.
- [x] **Testing**: Vitest suite for scoring logic and query generation.
- [x] **Evidence Quality Badge**: Checklist-driven quality indicator (incomplete → strong).
- [x] **Grouped Research Links**: Categorized deep-links (Search, Maps, Trends, Pain Points).

## ✅ Phase 2: Research Workflow (Abgeschlossen)
Transition from preliminary scoring to manual validation with a guided workflow.

### 2.1 Keyword Planner Validation
- [x] **Volume Input Fields**: Per-keyword field for manually entered monthly search volume.
- [x] **Volume-Weighted Scoring**: Incorporate search volume data into score calculation.
- [x] **Volume Summary**: Dashboard card showing total estimated monthly searches.

### 2.2 Google Trends Validation
- [x] **Trend Stability Notes**: Text field per idea for seasonality observations.
- [x] **Trend Direction Tag**: Dropdown (rising / stable / declining / seasonal).
- [x] **Trend Score Factor**: Adjust score based on trend direction.

### 2.3 Google Maps Competitor Deep-Dive
- [x] **Competitor Detail Fields**: Structured fields for top competitors (name, rating, review count).
- [x] **Competitor Quality Assessment**: Auto-derived signal from average rating + review count.
- [x] **Market Gap Indicator**: Visual indicator showing opportunity vs. saturation.

### 2.4 Review & Pain Point Collection
- [x] **Pain Point Textarea**: Free-text field for pasting review snippets.
- [x] **Pain Point Tags**: Categorize pain points (Service, Preis, Erreichbarkeit, Qualität).
- [x] **Pain Point Count**: Contribute tagged pain points to scoring.

### 2.5 Evidence Quality Enhancement
- [ ] **Granular Progress**: Show completion percentage per checklist category.
- [ ] **Confidence Score**: Weighted confidence based on data completeness.
- [ ] **Visual Progress Bar**: Replace simple badge with detailed progress visualization.

### 2.6 Shortened Market Analysis (Verkürzte Marktanalyse)
- [x] **Logic Engine**: Local evaluation of demand, competition, and strategy.
- [x] **Interactive UI**: One-click analysis generation with loading states.
- [x] **Professional Report**: Structured textual summary with actionable next steps.

## ✅ Phase 3: Business Idea Generator (Abgeschlossen)
Suggest possible local business ideas based on user-provided research signals.

- [x] **Idea Derivation Logic**: Local algorithm to generate hypotheses based on trends and signals.
- [x] **Generator Input Form**: Simple textarea for trend/search term input.
- [x] **Hypothesis Marking**: All generated ideas clearly labeled.
- [x] **Auto-Population**: Immediate presentation of generated ideas.
- [x] **Constraints**: Offline-first, explainable logic using `generatorEngine.ts`.

## ✅ Phase 4: Future Considerations (Teilweise Abgeschlossen)
- [x] **Comparison Mode**: Side-by-side comparison of multiple validated ideas (implemented in Scout UI).
- [x] **Advanced Aesthetics**: Premium design system with cards, grids, and animations.
- [x] **AI-Driven Scout**: Simplified, tabbed interface for rapid validation and derivation.
- [ ] **Data Export**: Export validated idea reports as PDF or Markdown.
- [ ] **Custom Weighting**: Allow users to adjust the scoring algorithm parameters.

## 🏁 Project Summary
The Local Demand Scanner has successfully evolved into **Ideen Scout**—a premium, local-first AI business validator. It combines deep heuristic scoring with a streamlined user experience to provide professional-grade market insights in seconds.

