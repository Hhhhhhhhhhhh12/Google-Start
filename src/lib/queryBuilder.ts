import type { BusinessIdea } from '../types';

export interface ResearchQuery {
    label: string;
    query: string;
    url: string;
    category: 'google' | 'maps' | 'trends' | 'pain-point';
}

const PAIN_POINT_TERMS = [
    'keine Rückmeldung',
    'nicht erreichbar',
    'unfreundlich',
    'zu teuer',
    'lange Wartezeit',
    'schlechte Kommunikation',
    'Termin vergessen',
    'nie wieder',
];

const INTENT_MODIFIERS = [
    'Kosten',
    'in meiner Nähe',
    'Beratung',
    'Hilfe',
    'Notdienst',
    'kurzfristig',
];

function encodeQuery(query: string): string {
    return encodeURIComponent(query.trim());
}

function normalizeKeyword(keyword: string): string {
    return keyword.trim().replace(/\s+/g, ' ');
}

export function buildGoogleSearchUrl(query: string): string {
    return `https://www.google.com/search?q=${encodeQuery(query)}`;
}

export function buildGoogleMapsUrl(query: string): string {
    return `https://www.google.com/maps/search/${encodeQuery(query)}`;
}

export function buildGoogleTrendsUrl(keywords: string[], region = 'DE'): string {
    const cleanedKeywords = keywords.map(normalizeKeyword).filter(Boolean).slice(0, 5);
    const query = cleanedKeywords.map(encodeQuery).join(',');
    return `https://trends.google.com/trends/explore?geo=${region}&q=${query}`;
}

export function buildKeywordQueries(idea: BusinessIdea): ResearchQuery[] {
    const keywords = idea.keywords.map(normalizeKeyword).filter(Boolean);
    const region = idea.region.trim();

    return keywords.flatMap((keyword) => {
        const baseQuery = `${keyword} ${region}`.trim();

        const googleQueries: ResearchQuery[] = [
            {
                label: `Google: ${baseQuery}`,
                query: baseQuery,
                url: buildGoogleSearchUrl(baseQuery),
                category: 'google',
            },
            {
                label: `Maps: ${baseQuery}`,
                query: baseQuery,
                url: buildGoogleMapsUrl(baseQuery),
                category: 'maps',
            },
        ];

        const intentQueries: ResearchQuery[] = INTENT_MODIFIERS.map((modifier) => {
            const query = `${keyword} ${modifier} ${region}`.trim();

            return {
                label: `Google: ${query}`,
                query,
                url: buildGoogleSearchUrl(query),
                category: 'google',
            };
        });

        return [...googleQueries, ...intentQueries];
    });
}

export function buildPainPointQueries(idea: BusinessIdea): ResearchQuery[] {
    const topic = idea.title.trim();
    const region = idea.region.trim();

    return PAIN_POINT_TERMS.map((term) => {
        const query = `"${term}" ${topic} ${region}`.trim();

        return {
            label: `Pain Point: ${term}`,
            query,
            url: buildGoogleSearchUrl(query),
            category: 'pain-point',
        };
    });
}

export function buildTrendsQuery(idea: BusinessIdea): ResearchQuery | null {
    const keywords = idea.keywords.map(normalizeKeyword).filter(Boolean).slice(0, 5);

    if (keywords.length === 0) {
        return null;
    }

    return {
        label: 'Google Trends Vergleich',
        query: keywords.join(', '),
        url: buildGoogleTrendsUrl(keywords),
        category: 'trends',
    };
}

export function buildResearchQueries(idea: BusinessIdea): ResearchQuery[] {
    const trendsQuery = buildTrendsQuery(idea);

    return [
        ...(trendsQuery ? [trendsQuery] : []),
        ...buildKeywordQueries(idea),
        ...buildPainPointQueries(idea),
    ];
}