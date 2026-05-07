# Roadmap - Local Demand Scanner

## 🎯 Project Vision
A local-first, API-free tool to filter and validate business ideas based on demand signals and competitor analysis.

## ✅ Phase 1: MVP (Current Status)
- [x] **Core Stack**: React + Vite + TypeScript + Vanilla CSS setup.
- [x] **Idea Management**: Multi-idea sidebar for switching between concepts.
- [x] **Active Editing**: Form for Title, Region, Audience, and Notes.
- [x] **Data Persistence**: `localStorage` integration for offline-first usage.
- [x] **Scoring Engine**: Preliminary Demand Score calculation (0-100).
- [x] **Keyword Integration**: Scoring contribution based on search term relevance.
- [x] **Query Builder**: Automated generation of deep-link research queries.
- [x] **UI Feedback**: Score explanation cards and visual indicators.
- [x] **Testing**: Vitest suite for scoring logic and query generation.

## 🚀 Phase 2: Research Workflow (Next Up)
Transition from preliminary scoring to manual validation with a guided workflow.
- [ ] **Grouped Research Links**: Categorized dashboard for Search, Maps, and Trends deep-links.
- [ ] **Google Keyword Planner Checklist**: Manual validation of exact search volumes.
- [ ] **Google Trends Checklist**: Verification of trend stability and seasonality.
- [ ] **Google Maps Competitor Checklist**: Deep-dive into competitor quality and density.
- [ ] **Review / Pain Point Checklist**: Systematic gathering of customer complaints/evidence.
- [ ] **Evidence Quality Indicator**: A confidence score reflecting how much manual validation has been completed.

## 🛠 Validation Rule
> **Crucial**: The score is a preliminary decision filter. It becomes more reliable only when the user manually validates Google Keyword Planner, Google Trends, Google Maps and review evidence.

## 🔮 Future Considerations
- [ ] **Data Export**: Export validated idea reports as PDF or Markdown.
- [ ] **Advanced Aesthetics**: Dark mode, glassmorphism, and micro-animations.
- [ ] **Comparison Mode**: Side-by-side comparison of multiple validated ideas.
- [ ] **Custom Weighting**: Allow users to adjust the scoring algorithm parameters.
