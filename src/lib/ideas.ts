import type { BusinessIdea, ScoringWeights } from '../types'

export const DEFAULT_WEIGHTS: ScoringWeights = { demand: 25, competition: 30, urgency: 20, profitability: 25 }

export function createIdea(overrides: Partial<BusinessIdea> = {}): BusinessIdea {
  const now = Date.now()
  return {
    id: crypto.randomUUID(), title: '', region: '', targetAudience: '', keywords: [], keywordData: [],
    competitorCount: 5, professionalCompetitorCount: 2, competitors: [], complaintDensity: 6,
    urgency: 7, willingnessToPay: 6, commercialCompetition: 5, notes: '', painPoints: [],
    painPointEntries: [], trendDirection: 'stable', trendNotes: '',
    checklist: { keywordPlannerChecked: false, googleTrendsChecked: false, googleMapsChecked: false, reviewsChecked: false, cpcChecked: false },
    weights: { ...DEFAULT_WEIGHTS }, dataBasis: 'assumptions', researchEntries: [], createdAt: now, updatedAt: now,
    ...overrides,
  }
}

// The stable ID, rather than title/region, determines which saved idea is edited.
export function upsertIdea(ideas: BusinessIdea[], draft: BusinessIdea): BusinessIdea[] {
  const previous = ideas.find(idea => idea.id === draft.id)
  const saved = { ...draft, title: draft.title.trim(), region: draft.region.trim(),
    createdAt: previous?.createdAt ?? draft.createdAt, updatedAt: Date.now() }
  return previous ? ideas.map(idea => idea.id === saved.id ? saved : idea) : [saved, ...ideas]
}

export function editIdea(draft: BusinessIdea, changes: Partial<BusinessIdea>): BusinessIdea {
  return { ...draft, ...changes, id: draft.id, createdAt: draft.createdAt, updatedAt: Date.now(), marketAnalysis: undefined }
}
