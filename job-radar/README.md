# 🌊 Faro

> **Scan jobs. Know your gaps. Level up.**
> A privacy-first, offline-capable job matching tool for Data & ML professionals — built entirely in the browser with no backend required.

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

---

## What it does

Faro pulls live job listings from public APIs, compares them against your skill profile, and tells you exactly where your gaps are — and how to close them.

| Feature | Detail |
|---|---|
| **Live job feed** | Aggregates from Arbeitnow (DACH) and Jobicy (Remote), filtered to Data / ML roles |
| **CV parsing** | Upload a PDF → skills extracted client-side via `pdfjs-dist`, nothing leaves your browser |
| **Match score** | Per-job keyword overlap: `|your skills ∩ required skills| / |required skills| × 100%` |
| **Skill-gap view** | Ranks missing skills by demand frequency across all loaded jobs |
| **Training links** | Each gap skill shows a Coursera course, Udemy course, relevant certification + time estimate |
| **Offline-first** | Jobs cache in `localStorage` with a 2-hour TTL; works on reload without network |

---

## Architecture

```
src/
├── types.ts                    # All shared TypeScript interfaces
├── constants/
│   ├── skillDictionary.ts      # 35 Data/ML skills with regex aliases
│   ├── trainingMap.ts          # Skill → {coursera, udemy, cert, estimatedHours}
│   └── feedUrls.ts             # API endpoint configuration
├── lib/
│   ├── pdfParser.ts            # pdfjs-dist browser PDF text extraction
│   ├── skillExtractor.ts       # Keyword matching with word-boundary regex
│   ├── rssClient.ts            # Typed API clients + runtime response validation
│   ├── jobParser.ts            # Normalises raw API items → Job model
│   ├── scorer.ts               # Match score + label/colour helpers
│   ├── gapAnalyser.ts          # Skill gap aggregation algorithm
│   └── storage.ts              # localStorage CRUD with PII minimisation
├── hooks/
│   ├── useProfile.ts           # CV upload, skill add/remove
│   ├── useJobs.ts              # Fetch orchestration with AbortController
│   └── useSkillGap.ts          # Memoised gap computation
└── components/
    ├── layout/Shell.tsx        # Two-column grid, mobile tab-bar
    ├── profile/                # PDF uploader (keyboard-accessible), skill chip editor
    ├── jobs/                   # Job list, job card with score badge
    └── gap/                    # Gap list, training resource cards
```

**Key design decisions:**

- **No backend** — all fetching, parsing, and scoring runs in the browser. Zero infra cost, fully portable.
- **AbortController in `useJobs`** — in-flight requests are cancelled on re-trigger or unmount, preventing stale state updates.
- **Word-boundary regex** — short aliases like `r`, `aws`, `gcp` are matched with `\b...\b` to avoid false positives.
- **Runtime API validation** — API responses are shape-checked before type-casting, protecting against malformed payloads.
- **PII minimisation** — raw CV text is never written to `localStorage`; only extracted skill tokens are persisted.

---

## Getting started

```bash
npm install

# Copy the pdfjs worker into public/ (required for PDF parsing)
cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/

npm run dev      # http://localhost:5174
npm run build    # Production build
npm run lint     # ESLint
```

---

## How the matching works

### Match score
```
score = |userSkills ∩ jobSkills| / |jobSkills| × 100
```
Jobs are sorted descending by score. Matched skills appear as **green chips**, missing ones as **red chips**.

### Skill gap
```
for each job:
  for each requiredSkill not in userProfile:
    freq[skill]++

→ sorted by freq descending
```
The frequency bar shows relative demand vs. the most-requested missing skill.

---

## Data sources

| Source | Type | Region |
|---|---|---|
| [Arbeitnow](https://www.arbeitnow.com/api) | Free JSON API | DACH + Remote |
| [Jobicy](https://jobicy.com/api) | Free JSON API | Global Remote |

Both are CORS-enabled — no proxy needed. Results are cached for 2 hours.

---

## Privacy

- **No data leaves your device.** CV text is processed in-memory and never persisted.
- **No analytics, no tracking, no cookies.**
- `localStorage` contains only your skill list and job metadata — not raw CV content.

---

## Tech stack

- **React 19** · **TypeScript 5** · **Vite 6**
- **pdfjs-dist** — browser-native PDF text extraction (no server round-trip)
- **CSS Modules** — scoped styles, no runtime CSS-in-JS overhead
- No external state management — React hooks + `localStorage` are sufficient for this scope

---

## Roadmap

- [ ] Claude API integration for deep per-job analysis and cover letter hints
- [ ] Additional DACH sources (jobs.ch, heise jobs) when stable APIs become available
- [ ] Export skill-gap report as PDF
- [ ] Salary range overlay

---

## License

MIT
