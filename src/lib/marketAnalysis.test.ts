import { describe, it, expect } from 'vitest';
import { generateMarketAnalysis } from './marketAnalysis';
import type { BusinessIdea } from '../types';

const mockIdea: BusinessIdea = {
  id: 'test-1',
  title: 'Test Service',
  region: 'Freiburg',
  targetAudience: 'Senioren',
  keywords: ['test'],
  keywordData: [{ term: 'test', monthlyVolume: 500 }],
  competitorCount: 10,
  professionalCompetitorCount: 2,
  competitors: [
    { name: 'Comp 1', rating: 3.0, reviewCount: 10 }
  ],
  complaintDensity: 10,
  urgency: 9,
  willingnessToPay: 10,
  commercialCompetition: 8,
  notes: '',
  painPoints: [],
  painPointEntries: [
    { text: 'Unzuverlässig', category: 'service' }
  ],
  trendDirection: 'rising',
  trendNotes: '',
  checklist: {
    keywordPlannerChecked: true,
    googleTrendsChecked: true,
    googleMapsChecked: true,
    reviewsChecked: true,
    cpcChecked: true
  },
  createdAt: Date.now(),
  updatedAt: Date.now()
};

describe('generateMarketAnalysis', () => {
  it('should generate a high potential verdict for a good idea', () => {
    const analysis = generateMarketAnalysis(mockIdea);
    expect(analysis.scoreAtGeneration).toBeGreaterThan(70);
    expect(analysis.verdict).toContain('Potenzial');
  });

  it('should include next steps if data is missing', () => {
    const incompleteIdea = { 
        ...mockIdea, 
        checklist: { ...mockIdea.checklist, keywordPlannerChecked: false },
        keywordData: []
    };
    const analysis = generateMarketAnalysis(incompleteIdea);
    expect(analysis.nextSteps).toContain('Keyword-Volumen im Google Keyword Planner validieren.');
  });

  it('should reflect trend in demand analysis', () => {
    const seasonalIdea = { ...mockIdea, trendDirection: 'seasonal' as const };
    const analysis = generateMarketAnalysis(seasonalIdea);
    expect(analysis.demandAnalysis).toContain('saisonabhängig');
  });
});
