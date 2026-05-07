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

        expect(result).toEqual({
            competitionGap: 81,
            painScore: 70,
            commercialScore: 70,
            urgencyScore: 80,
            keywordBreadthScore: 48,
            finalScore: 72,
        });
    });

    it('calculates a score from a full business idea', () => {
        const idea: BusinessIdea = {
            id: 'idea-1',
            title: 'Google-Bewertungsmanagement',
            region: 'Müllheim / Freiburg',
            targetAudience: 'Arztpraxen, Restaurants, lokale Dienstleister',
            keywords: [
                'google bewertung löschen lassen',
                'negative google bewertung entfernen',
                'reputationsmanagement freiburg',
                'google maps bewertung melden',
                'apple maps bewertung löschen',
                '1 sterne bewertung entfernen',
            ],
            competitorCount: 4,
            professionalCompetitorCount: 1,
            complaintDensity: 7,
            urgency: 8,
            willingnessToPay: 8,
            commercialCompetition: 6,
            notes: 'Viele Anbieter reagieren schlecht auf Bewertungen.',
            painPoints: ['keine Rückmeldung', 'schlechte Kommunikation'],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        expect(calculateIdeaScore(idea).finalScore).toBe(72);
    });
});