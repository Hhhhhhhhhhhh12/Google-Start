import { generateMarketAnalysis } from './marketAnalysis'
import { generateHypothesisIdeas } from './generatorEngine'
import type { BusinessIdea } from '../types'

export interface EvaluationReport {
  demandScore: number;
  sources: string[];
  metrics: {
    competition: string;
    searchVolume: string;
    trend: string;
    cpc: string;
  };
  summary: string;
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
  strategy: string;
  nextSteps: string[];
}

export async function evaluateIdeaMock(ideaTitle: string, region: string): Promise<EvaluationReport> {
  // Create a temporary BusinessIdea object for the analysis engine
  const tempIdea: BusinessIdea = {
    id: crypto.randomUUID(),
    title: ideaTitle,
    region: region,
    targetAudience: 'Zielgruppe offen',
    keywords: [ideaTitle],
    keywordData: [],
    competitorCount: 5, // Default assumptions for scout mode
    professionalCompetitorCount: 1,
    competitors: [],
    complaintDensity: 5,
    urgency: 7,
    willingnessToPay: 6,
    commercialCompetition: 4,
    notes: '',
    painPoints: [],
    painPointEntries: [],
    trendDirection: 'stable',
    trendNotes: '',
    checklist: {
      keywordPlannerChecked: false,
      googleTrendsChecked: false,
      googleMapsChecked: false,
      reviewsChecked: false,
      cpcChecked: false,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return new Promise((resolve) => {
    setTimeout(() => {
      const analysis = generateMarketAnalysis(tempIdea);
      
      resolve({
        demandScore: analysis.scoreAtGeneration,
        sources: [
          'Google Keyword Planner (Heuristik)',
          'Google Maps API (Heuristik)',
          'Local Demand Engine',
        ],
        metrics: {
          competition: analysis.competitionAnalysis,
          searchVolume: analysis.demandAnalysis,
          trend: 'Stabil bis Wachsend',
          cpc: '0.85€ - 2.40€',
        },
        summary: analysis.verdict,
        swot: analysis.swot,
        persona: analysis.persona,
        revenueModels: ['Einmaliger Service-Fee', 'Wartungsvertrag (monatlich)', 'Ersatzteil-Marge'],
        strategy: analysis.strategyRecommendation,
        nextSteps: analysis.nextSteps,
      });
    }, 1500);
  });
}

export interface DerivedIdea {
  title: string;
  reason: string;
  potential: string;
}

export async function deriveIdeasMock(searchTerms: string): Promise<DerivedIdea[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const terms = searchTerms.split(/[,\n]/).map(t => t.trim()).filter(t => t.length > 0);
      
      const results = generateHypothesisIdeas({
        region: 'Lokal',
        interests: terms.slice(0, 3),
        serviceCategories: ['Service', 'Dienstleistung', 'Mobil']
      });

      resolve(results.map(r => ({
        title: r.title || 'Neue Idee',
        reason: `Basierend auf Suchtrends für ${terms[0] || 'lokale Bedarfe'}.`,
        potential: 'Hoch (Marktlücke vermutet)',
      })));
    }, 1500);
  });
}
