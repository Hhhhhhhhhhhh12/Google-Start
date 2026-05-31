import type { CompetitorEntry, KeywordData } from '../types';

export interface ScrapeResult {
// ...
    competitors: CompetitorEntry[];
    keywords: KeywordData[];
}

export async function scrapeGoogleMaps(
    query: string,
    apiKey: string
): Promise<CompetitorEntry[]> {
    if (!apiKey) throw new Error('API Key fehlt');

    const response = await fetch('https://google.serper.dev/maps', {
        method: 'POST',
        headers: {
            'X-API-KEY': apiKey,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ q: query }),
    });

    if (!response.ok) {
        throw new Error(`Maps Scraping fehlgeschlagen: ${response.statusText}`);
    }

    const data = await response.json();
    return (data.maps || []).map((m: any) => ({
        name: m.title,
        rating: m.rating || 0,
        reviewCount: m.reviews || 0,
    }));
}

export interface OrganicResult {
    title: string;
    link: string;
    snippet: string;
}

export async function scrapeSearchMetadata(
    query: string,
    apiKey: string
): Promise<{ 
    adCount: number; 
    resultCount: number; 
    organic: OrganicResult[];
    peopleAlsoAsk?: string[];
    relatedSearches?: string[];
}> {
    if (!apiKey) throw new Error('API Key fehlt');

    const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
            'X-API-KEY': apiKey,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ q: query }),
    });

    if (!response.ok) {
        throw new Error(`Search Scraping fehlgeschlagen: ${response.statusText}`);
    }

    const data = await response.json();
    return {
        adCount: (data.ads || []).length,
        resultCount: data.searchParameters?.totalResults || 0,
        organic: (data.organic || []).map((o: any) => ({
            title: o.title,
            link: o.link,
            snippet: o.snippet
        })),
        peopleAlsoAsk: (data.peopleAlsoAsk || []).map((q: any) => q.question),
        relatedSearches: (data.relatedSearches || []).map((r: any) => r.query)
    };
}

export async function scrapeSearchVolume(
    keywords: string[],
    apiKey: string
): Promise<KeywordData[]> {
    if (!apiKey) throw new Error('API Key fehlt');
    
    const results: KeywordData[] = [];

    for (const kw of keywords) {
        const response = await fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: {
                'X-API-KEY': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ q: kw }),
        });

        if (response.ok) {
            await response.json();
            results.push({
                term: kw,
                monthlyVolume: 0 // Serper doesn't provide volume directly in search, but we can store the fact we searched it
            });
        }
    }

    return results;
}
