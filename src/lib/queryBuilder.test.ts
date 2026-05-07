import { describe, expect, it } from 'vitest';
import {
    buildGoogleMapsUrl,
    buildGoogleSearchUrl,
    buildGoogleTrendsUrl,
    buildPainPointQueries,
    buildResearchQueries,
    buildTrendsQuery,
} from './queryBuilder';
import type { BusinessIdea } from '../types';

const exampleIdea: BusinessIdea = {
    id: 'idea-1',
    title: 'Google-Bewertungsmanagement',
    region: 'Müllheim / Freiburg',
    targetAudience: 'Arztpraxen, Restaurants, lokale Dienstleister',
    keywords: [
        'google bewertung löschen lassen',
        'negative google bewertung entfernen',
        'reputationsmanagement freiburg',
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

describe('queryBuilder', () => {
    it('builds Google search URLs', () => {
        expect(buildGoogleSearchUrl('reputationsmanagement freiburg')).toBe(
            'https://www.google.com/search?q=reputationsmanagement%20freiburg',
        );
    });

    it('builds Google Maps URLs', () => {
        expect(buildGoogleMapsUrl('gartenhilfe müllheim')).toBe(
            'https://www.google.com/maps/search/gartenhilfe%20m%C3%BCllheim',
        );
    });

    it('builds Google Trends URLs with up to five keywords', () => {
        expect(
            buildGoogleTrendsUrl([
                'google bewertung löschen lassen',
                'negative google bewertung entfernen',
            ]),
        ).toContain('https://trends.google.com/trends/explore?geo=DE&q=');
    });

    it('builds a trends query when keywords exist', () => {
        const result = buildTrendsQuery(exampleIdea);

        expect(result).not.toBeNull();
        expect(result?.category).toBe('trends');
        expect(result?.query).toContain('google bewertung löschen lassen');
    });

    it('returns no trends query without keywords', () => {
        const result = buildTrendsQuery({
            ...exampleIdea,
            keywords: [],
        });

        expect(result).toBeNull();
    });

    it('builds pain point queries', () => {
        const result = buildPainPointQueries(exampleIdea);

        expect(result.length).toBeGreaterThan(0);
        expect(result[0].category).toBe('pain-point');
        expect(result[0].query).toContain('"keine Rückmeldung"');
    });

    it('builds a full research query list', () => {
        const result = buildResearchQueries(exampleIdea);

        expect(result.length).toBeGreaterThan(10);
        expect(result.some((query) => query.category === 'trends')).toBe(true);
        expect(result.some((query) => query.category === 'maps')).toBe(true);
        expect(result.some((query) => query.category === 'pain-point')).toBe(true);
    });
});