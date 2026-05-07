import { describe, expect, it } from 'vitest';
import {
    calculateCommercialScore,
    calculateCompetitionGap,
    calculateIdeaScore,
    calculateKeywordBreadthScore,
    calculatePainScore,
    calculateScore,
    calculateUrgencyScore,
    clamp,
} from './scoring';
import type { BusinessIdea } from '../types';

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

    it('calculates a final weighted score from raw score input', () => {
        const result = calculateScore({
            competitorCount: 4,
            professionalCompetitorCount: 1,
            complaintDensity: 7,
            urgency: 8,
            willingnessToPay: 8,
            commercialCompetition: 6,
            keywordCount: 6,
        });

        expect(result.finalScore).toBeDefined();
    });

    it('calculates a score from a full business idea and responds to keyword changes', () => {
        const idea: BusinessIdea = {
            id: 'idea-1',
            title: 'Test Idea',
            region: 'Test Region',
            targetAudience: 'Test Audience',
            keywords: [],
            competitorCount: 4,
            professionalCompetitorCount: 1,
            complaintDensity: 7,
            urgency: 8,
            willingnessToPay: 8,
            commercialCompetition: 6,
            notes: '',
            painPoints: [],
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

        const score0 = calculateIdeaScore(idea);
        expect(score0.keywordBreadthScore).toBe(0);
        expect(score0.finalScore).toBe(68); // 81*0.25 + 70*0.25 + 70*0.2 + 80*0.2 + 0*0.1 = 20.25 + 17.5 + 14 + 16 = 67.75 -> 68

        const ideaWithKeywords = { ...idea, keywords: ['k1', 'k2'] };
        const score2 = calculateIdeaScore(ideaWithKeywords);
        expect(score2.keywordBreadthScore).toBe(16);
        expect(score2.finalScore).toBe(69); // 67.75 + 1.6 = 69.35 -> 69
    });
});