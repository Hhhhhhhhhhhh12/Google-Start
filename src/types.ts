export interface KeywordData {
  term: string
  monthlyVolume?: number
}

export interface CompetitorEntry {
  name: string
  rating: number
  reviewCount: number
}

export interface PainPointEntry {
  text: string
  category: 'service' | 'price' | 'availability' | 'quality' | 'other'
}

export type TrendDirection = 'rising' | 'stable' | 'declining' | 'seasonal'

export interface OrganicResult {
  title: string
  link: string
  snippet: string
}

export interface ScoringWeights {
  demand: number
  competition: number
  urgency: number
  profitability: number
}

export interface BusinessIdea {
  id: string
  title: string
  region: string
  targetAudience: string
  keywords: string[]
  weights?: ScoringWeights

  keywordData: KeywordData[]

  competitorCount: number
  professionalCompetitorCount: number
  competitors: CompetitorEntry[]

  organicResults?: OrganicResult[]
  peopleAlsoAsk?: string[]
  relatedSearches?: string[]

  complaintDensity: number
  urgency: number
  willingnessToPay: number
  commercialCompetition: number

  notes: string
  painPoints: string[]
  painPointEntries: PainPointEntry[]

  trendDirection: TrendDirection
  trendNotes: string

  checklist: {
    keywordPlannerChecked: boolean
    googleTrendsChecked: boolean
    googleMapsChecked: boolean
    reviewsChecked: boolean
    cpcChecked: boolean
  }

  marketAnalysis?: MarketAnalysis

  createdAt: number
  updatedAt: number
}

export interface IdeaScores {
  competitionGap: number
  painScore: number
  commercialScore: number
  urgencyScore: number
  keywordBreadthScore: number
  trendScore: number
  evidenceQuality: 'incomplete' | 'weak' | 'usable' | 'strong'
  evidencePercent: number
  finalScore: number
}

export interface ScoreInput {
  competitorCount: number
  professionalCompetitorCount: number
  complaintDensity: number
  urgency: number
  willingnessToPay: number
  commercialCompetition: number
  keywordCount: number
  trendDirection: TrendDirection
  painPointEntryCount: number
  averageCompetitorRating: number
  totalSearchVolume: number
}

export interface MarketAnalysis {
  verdict: string
  demandAnalysis: string
  competitionAnalysis: string
  strategyRecommendation: string  // war fälschlicherweise 'strategy' in App.tsx
  nextSteps: string[]
  metrics: {
    competition: string
    searchVolume: string
    trend: string
    cpc: string
    totalResults?: number
  }
  sources: string[]
  organicEvidence?: OrganicResult[]
  peopleAlsoAsk?: string[]
  relatedSearches?: string[]
  swot: {
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    threats: string[]
  }
  persona: {
    name: string
    painPoints: string[]
    willingnessToPay: string
  }
  revenueModels: string[]
  generatedAt: number
  scoreAtGeneration: number
  // Felder die App.tsx an MarketAnalysis anhängt:
  checklist?: BusinessIdea['checklist']
  evidencePercent?: number
  evidenceQuality?: 'incomplete' | 'weak' | 'usable' | 'strong'
}