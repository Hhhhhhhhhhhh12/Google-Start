import { describe, it, expect } from 'vitest';
import { generateMarketAnalysis } from './marketAnalysis';
import { prepareReportForDisplay, describeDataBasis } from './reportProvenance';
import { generateReportMarkdown } from './exportUtils';
import type { BusinessIdea } from '../types';

const mockIdea: BusinessIdea = {
  id: 'test-1',
  title: 'Test Service',
  dataBasis: 'manual',
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

  it('does not present defaults as researched facts or Google sources', () => {
    const analysis = generateMarketAnalysis({
      ...mockIdea,
      dataBasis: 'assumptions',
      keywordData: [],
      competitors: [],
      checklist: {
        keywordPlannerChecked: false,
        googleTrendsChecked: false,
        googleMapsChecked: false,
        reviewsChecked: false,
        cpcChecked: false,
      },
    });
    expect(analysis.verdict).toContain('Potenzial noch offen');
    expect(analysis.metrics.searchVolume).toBe('Nicht belegt');
    expect(analysis.metrics.trend).toBe('Nicht geprüft');
    expect(analysis.metrics.competition).toBe('Nicht erhoben');
    expect(analysis.sources.join(' ')).not.toContain('Google');
    expect(analysis.evidencePercent).toBe(0);
  });

  it('keeps external results distinct from keyword volume and trend evidence', () => {
    const analysis = generateMarketAnalysis({
      ...mockIdea,
      dataBasis: 'external-mixed',
      organicResults: [{ title: 'Example', link: 'https://example.org', snippet: 'Example' }],
      keywordData: [],
      checklist: { ...mockIdea.checklist, keywordPlannerChecked: false, googleTrendsChecked: false, cpcChecked: false },
    });
    expect(analysis.sources).toContain('Suchergebnisse über Serper');
    expect(analysis.sources).toContain('Maps-Einträge über Serper');
    expect(analysis.metrics.searchVolume).toBe('Nicht belegt');
    expect(analysis.metrics.trend).toBe('Nicht geprüft');
    expect(analysis.metrics.cpc).toBe('Nicht erhoben');
    expect(analysis.metrics.competition).toContain('Ausschnitt');
    expect(analysis.checklist?.keywordPlannerChecked).toBe(false);
  });

  it('labels older reports conservatively in display and export without changing stored data', () => {
    const legacy = {
      ...generateMarketAnalysis(mockIdea),
      dataBasis: undefined,
      sources: ['Google Search (Live)', 'Google Maps (Live)'],
      verdict: 'Exzellentes Potenzial',
    };
    const displayed = prepareReportForDisplay(legacy);
    expect(describeDataBasis(displayed)).toContain('Herkunft ungeklärt');
    expect(displayed.metrics.searchVolume).toBe('Nicht belegt');
    expect(displayed.evidencePercent).toBeUndefined();
    expect(displayed.scoreAtGeneration).toBe(legacy.scoreAtGeneration);
    const exported = generateReportMarkdown('Test', 'Freiburg', legacy);
    expect(exported).toContain('Herkunft ungeklärt');
    expect(exported).not.toContain('Google Search (Live)');
    expect(exported).not.toContain('Exzellentes Potenzial');
    expect(legacy.sources).toContain('Google Search (Live)');
    expect(legacy.verdict).toBe('Exzellentes Potenzial');
  });

  it('preserves documented external evidence in display and export', () => {
    const analysis = generateMarketAnalysis({
      ...mockIdea,
      dataBasis: 'external-mixed',
      organicResults: [{ title: 'Example', link: 'https://example.org', snippet: 'Example' }],
      keywordData: [],
    });
    const displayed = prepareReportForDisplay(analysis);
    expect(displayed.organicEvidence).toHaveLength(1);
    const exported = generateReportMarkdown('Test', 'Freiburg', analysis);
    expect(exported).toContain('Suchergebnisse über Serper');
    expect(exported).toContain('Arbeitshypothesen');
    expect(exported).toContain('**Suchvolumen:** Nicht belegt');
  });
});
