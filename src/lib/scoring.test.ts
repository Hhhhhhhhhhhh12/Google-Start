import { describe, expect, it } from 'vitest';
import {
    calculateCommercialScore,
    calculateCompetitionGap,
    calculateEvidenceQuality,
    calculateEvidencePercent,
    calculateIdeaScore,
    calculateKeywordBreadthScore,
    calculatePainScore,
    calculateScore,
    calculateTrendScore,
    calculateUrgencyScore,
    clamp,
} from './scoring';
import type { BusinessIdea } from '../types';

function createTestIdea(overrides: Partial<BusinessIdea> = {}): BusinessIdea {
    return {
        id: 'idea-1',
        title: 'Test Idea',
        region: 'Test Region',
        targetAudience: 'Test Audience',
        keywords: [],
        keywordData: [],
        competitorCount: 4,
        professionalCompetitorCount: 1,
        complaintDensity: 7,
        urgency: 8,
        willingnessToPay: 8,
        commercialCompetition: 6,
        competitors: [],
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
        ...overrides,
    };
}

describe('scoring', () => {
    it('clamps values between 0 and 100', () => {
        expect(clamp(-10)).toBe(0);
        expect(clamp(50)).toBe(50);
        expect(clamp(150)).toBe(100);
    });

    it('rewards a market with no visible competitors', () => {
        expect(calculateCompetitionGap(0, 0)).toBe(100);
    });

    it('penalizes professional competitor share', () => {
        expect(calculateCompetitionGap(4, 1)).toBe(81);
        expect(calculateCompetitionGap(4, 4)).toBe(25);
    });

    it('converts manual 1-10 scores into 0-100 scores', () => {
        expect(calculatePainScore(7)).toBe(70);
        expect(calculateUrgencyScore(8)).toBe(80);
        expect(calculateCommercialScore(8, 6)).toBe(70);
    });

    it('scores keyword breadth with a cap at 100', () => {
        expect(calculateKeywordBreadthScore(5)).toBe(40);
        expect(calculateKeywordBreadthScore(20)).toBe(100);
    });

    it('calculates trend scores for each direction', () => {
        expect(calculateTrendScore('rising')).toBe(100);
        expect(calculateTrendScore('stable')).toBe(70);
        expect(calculateTrendScore('seasonal')).toBe(50);
        expect(calculateTrendScore('declining')).toBe(20);
    });

    it('calculates a final weighted score from raw score input', () => {
        const result = calculateScore({
            competitorCount: 4,
            professionalCompetitorCount: 1,
            complaintDensity: 7,
            urgency: 8,
            willingnessToPay: 8,
            commercialCompetition: 6,
            keywordCount: 6,
            trendDirection: 'stable',
            painPointEntryCount: 0,
            averageCompetitorRating: 0,
            totalSearchVolume: 0,
        });

        expect(result.finalScore).toBeDefined();
        expect(result.trendScore).toBe(70);
    });

    it('calculates a score from a full business idea and responds to keyword changes', () => {
        const idea = createTestIdea();

        const score0 = calculateIdeaScore(idea);
        expect(score0.keywordBreadthScore).toBe(0);

        const ideaWithKeywords = createTestIdea({ keywords: ['k1', 'k2'] });
        const score2 = calculateIdeaScore(ideaWithKeywords);
        expect(score2.keywordBreadthScore).toBe(16);
        expect(score2.finalScore).toBeGreaterThan(score0.finalScore);
    });

    it('trend direction affects the final score', () => {
        const risingIdea = createTestIdea({ trendDirection: 'rising' });
        const decliningIdea = createTestIdea({ trendDirection: 'declining' });

        const risingScore = calculateIdeaScore(risingIdea);
        const decliningScore = calculateIdeaScore(decliningIdea);

        expect(risingScore.finalScore).toBeGreaterThan(decliningScore.finalScore);
        expect(risingScore.trendScore).toBe(100);
        expect(decliningScore.trendScore).toBe(20);
    });

    it('calculates evidence percent from checklist and Phase 2 data', () => {
        const emptyIdea = createTestIdea();
        expect(calculateEvidencePercent(emptyIdea)).toBe(0);

        // 2 checklist items checked = 2/9 ≈ 22%
        const partialIdea = createTestIdea({
            checklist: {
                keywordPlannerChecked: true,
                googleTrendsChecked: true,
                googleMapsChecked: false,
                reviewsChecked: false,
                cpcChecked: false,
            },
        });
        expect(calculateEvidencePercent(partialIdea)).toBe(22);

        // All checklist + all Phase 2 data = 9/9 = 100%
        const fullIdea = createTestIdea({
            checklist: {
                keywordPlannerChecked: true,
                googleTrendsChecked: true,
                googleMapsChecked: true,
                reviewsChecked: true,
                cpcChecked: true,
            },
            keywordData: [{ term: 'test', monthlyVolume: 500 }],
            competitors: [{ name: 'Comp A', rating: 4.2, reviewCount: 50 }],
            painPointEntries: [{ text: 'bad service', category: 'service' }],
            trendDirection: 'rising',
        });
        expect(calculateEvidencePercent(fullIdea)).toBe(100);
    });

    it('calculates evidence quality levels correctly', () => {
        const baseIdea = createTestIdea();

        // incomplete (0% evidence)
        expect(calculateEvidenceQuality(baseIdea)).toBe('incomplete');

        // weak (2 checklist + keyword data = 3/9 ≈ 33%)
        const weakIdea = createTestIdea({
            checklist: {
                ...baseIdea.checklist,
                keywordPlannerChecked: true,
                googleTrendsChecked: true,
            },
            keywordData: [{ term: 'test', monthlyVolume: 100 }],
        });
        expect(calculateEvidenceQuality(weakIdea)).toBe('weak');

        // usable (5 checklist + 2 extra = 7/9 ≈ 78%)
        const usableIdea = createTestIdea({
            checklist: {
                keywordPlannerChecked: true,
                googleTrendsChecked: true,
                googleMapsChecked: true,
                reviewsChecked: true,
                cpcChecked: true,
            },
            keywordData: [{ term: 'test', monthlyVolume: 100 }],
            competitors: [{ name: 'Comp', rating: 3.5, reviewCount: 20 }],
        });
        expect(calculateEvidenceQuality(usableIdea)).toBe('usable');

        // strong (all 9/9 = 100%)
        const strongIdea = createTestIdea({
            checklist: {
                keywordPlannerChecked: true,
                googleTrendsChecked: true,
                googleMapsChecked: true,
                reviewsChecked: true,
                cpcChecked: true,
            },
            keywordData: [{ term: 'test', monthlyVolume: 100 }],
            competitors: [{ name: 'Comp', rating: 3.5, reviewCount: 20 }],
            painPointEntries: [{ text: 'slow', category: 'service' }],
            trendDirection: 'rising',
        });
        expect(calculateEvidenceQuality(strongIdea)).toBe('strong');
    });
});