export interface KeywordData {
  term: string;
  monthlyVolume?: number; // manually entered from Google Keyword Planner
}

export interface CompetitorEntry {
  name: string;
  rating: number;      // 1.0 - 5.0
  reviewCount: number;
}

export interface PainPointEntry {
  text: string;
  category: 'service' | 'price' | 'availability' | 'quality' | 'other';
}

export type TrendDirection = 'rising' | 'stable' | 'declining' | 'seasonal';

export interface OrganicResult {
  title: string;
  link: string;
  snippet: string;
}

export interface ScoringWeights {

  demand: number;
  competition: number;
  urgency: number;
  profitability: number;
}

export interface BusinessIdea {
  id: string;
  title: string;
  region: string;
  targetAudience: string;
  keywords: string[];
  weights?: ScoringWeights;

  // Phase 2: Keyword Planner Data

  keywordData: KeywordData[];

  // Research Data
  competitorCount: number;
  professionalCompetitorCount: number;

  // Phase 2: Competitor Deep-Dive
  competitors: CompetitorEntry[];
  
  // Hard Evidence from Google
  organicResults?: OrganicResult[];

  // Qualitative Scores (1-10)
  complaintDensity: number; // Beschwerdedichte
  urgency: number; // Dringlichkeit
  willingnessToPay: number; // Zahlungsbereitschaft
  commercialCompetition: number; // Kommerzieller Druck

  // Notes & Snippets
  notes: string;
  painPoints: string[];

  // Phase 2: Structured Pain Points
  painPointEntries: PainPointEntry[];

  // Phase 2: Trends
  trendDirection: TrendDirection;
  trendNotes: string;

  // Checklist
  checklist: {
    keywordPlannerChecked: boolean;
    googleTrendsChecked: boolean;
    googleMapsChecked: boolean;
    reviewsChecked: boolean;
    cpcChecked: boolean;
  };

  marketAnalysis?: MarketAnalysis;

  createdAt: number;
  updatedAt: number;
}


export interface IdeaScores {
  competitionGap: number;
  painScore: number;
  commercialScore: number;
  urgencyScore: number;
  keywordBreadthScore: number;
  trendScore: number;
  evidenceQuality: 'incomplete' | 'weak' | 'usable' | 'strong';
  evidencePercent: number;
  finalScore: number;
}

export interface ScoreInput {
  competitorCount: number;
  professionalCompetitorCount: number;
  complaintDensity: number;
  urgency: number;
  willingnessToPay: number;
  commercialCompetition: number;
  keywordCount: number;
  trendDirection: TrendDirection;
  painPointEntryCount: number;
  averageCompetitorRating: number;
  totalSearchVolume: number;
}

export interface MarketAnalysis {
  verdict: string;
  demandAnalysis: string;
  competitionAnalysis: string;
  strategyRecommendation: string;
  nextSteps: string[];
  metrics: {
    competition: string;
    searchVolume: string;
    trend: string;
    cpc: string;
    totalResults?: number;
  };
  sources: string[];
  organicEvidence?: OrganicResult[];
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  persona: {
    name: string;
    painPoints: string[];
    willingnessToPay: string;
  };
  revenueModels: string[];
  generatedAt: number;
  scoreAtGeneration: number;
}