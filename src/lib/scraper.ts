import type { CompetitorEntry, KeywordData } from '../types';

export interface ScrapeResult {
    competitors: CompetitorEntry[];
    keywords: KeywordData[];
}

export type SerperErrorCode =
    | 'missing-key' | 'unauthorized' | 'rate-limit' | 'http'
    | 'network' | 'timeout' | 'aborted' | 'invalid-response';

const messages: Record<SerperErrorCode, string> = {
    'missing-key': 'Bitte hinterlege zuerst einen Serper-API-Schlüssel.',
    unauthorized: 'Der Serper-API-Schlüssel wurde abgelehnt oder hat keine Berechtigung. Bitte prüfe den Schlüssel.',
    'rate-limit': 'Das Serper-Abfragelimit ist erreicht. Bitte prüfe dein Kontingent und versuche es später erneut.',
    http: 'Serper konnte die Anfrage nicht verarbeiten. Bitte versuche es später erneut.',
    network: 'Serper ist nicht erreichbar. Bitte prüfe deine Internetverbindung und versuche es erneut.',
    timeout: 'Die Serper-Anfrage hat zu lange gedauert. Bitte versuche es erneut.',
    aborted: 'Die Serper-Anfrage wurde abgebrochen.',
    'invalid-response': 'Serper hat eine ungültige Antwort geliefert. Bitte versuche es später erneut.',
};

// Never expose upstream messages, request bodies, or API keys in user-facing errors.
export class SerperError extends Error {
    readonly code: SerperErrorCode;

    constructor(code: SerperErrorCode) {
        super(messages[code]);
        this.name = 'SerperError';
        this.code = code;
    }
}

type JsonObject = Record<string, unknown>;
const REQUEST_TIMEOUT_MS = 15_000;

function object(value: unknown): JsonObject {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new SerperError('invalid-response');
    }
    return value as JsonObject;
}

function entries(data: JsonObject, field: string): JsonObject[] {
    if (data[field] === undefined) return [];
    if (!Array.isArray(data[field])) throw new SerperError('invalid-response');
    return data[field].map(object);
}

function requiredText(value: unknown): string {
    if (typeof value !== 'string' || !value.trim()) throw new SerperError('invalid-response');
    return value.trim();
}

function count(value: unknown): number {
    const number = typeof value === 'number' ? value
        : typeof value === 'string' && value.trim() ? Number(value) : NaN;
    return Number.isFinite(number) && number >= 0 ? Math.floor(number) : 0;
}

function rating(value: unknown): number {
    const number = typeof value === 'number' ? value
        : typeof value === 'string' && value.trim() ? Number(value) : NaN;
    return Number.isFinite(number) ? Math.max(0, Math.min(5, number)) : 0;
}

function evidenceUrl(value: string): string | undefined {
    try {
        const url = new URL(value);
        if ((url.protocol === 'http:' || url.protocol === 'https:') && !url.username && !url.password) {
            return url.href;
        }
    } catch {
        // Invalid and non-web links are not usable evidence.
    }
    return undefined;
}

function requireKey(apiKey: string): void {
    if (!apiKey.trim()) throw new SerperError('missing-key');
}

async function request(endpoint: 'maps' | 'search', query: string, apiKey: string, signal?: AbortSignal): Promise<JsonObject> {
    requireKey(apiKey);
    const controller = new AbortController();
    let timedOut = false;
    const abort = () => controller.abort();
    if (signal?.aborted) throw new SerperError('aborted');
    signal?.addEventListener('abort', abort, { once: true });
    const timer = setTimeout(() => {
        timedOut = true;
        controller.abort();
    }, REQUEST_TIMEOUT_MS);
    try {
        const response = await fetch(`https://google.serper.dev/${endpoint}`, {
            method: 'POST',
            headers: { 'X-API-KEY': apiKey.trim(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: query }),
            signal: controller.signal,
        });
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) throw new SerperError('unauthorized');
            if (response.status === 429) throw new SerperError('rate-limit');
            throw new SerperError('http');
        }
        let data: unknown;
        try {
            data = await response.json();
        } catch {
            if (controller.signal.aborted) throw new SerperError(timedOut ? 'timeout' : 'aborted');
            throw new SerperError('invalid-response');
        }
        if (controller.signal.aborted) throw new SerperError(timedOut ? 'timeout' : 'aborted');
        const result = object(data);
        // An error envelope with HTTP 200 must not be mistaken for an empty result.
        if ('error' in result || 'message' in result || 'statusCode' in result) throw new SerperError('invalid-response');
        return result;
    } catch (error) {
        if (error instanceof SerperError) throw error;
        if (controller.signal.aborted) throw new SerperError(timedOut ? 'timeout' : 'aborted');
        throw new SerperError('network');
    } finally {
        clearTimeout(timer);
        signal?.removeEventListener('abort', abort);
    }
}

export async function scrapeGoogleMaps(query: string, apiKey: string, signal?: AbortSignal): Promise<CompetitorEntry[]> {
    const data = await request('maps', query, apiKey, signal);
    if (data.maps === undefined) throw new SerperError('invalid-response');
    return entries(data, 'maps').map(m => ({
        name: requiredText(m.title),
        rating: rating(m.rating),
        reviewCount: count(m.reviews),
    }));
}

export interface OrganicResult {
    title: string;
    link: string;
    snippet: string;
}

export async function scrapeSearchMetadata(query: string, apiKey: string, signal?: AbortSignal): Promise<{
    adCount: number;
    resultCount: number;
    organic: OrganicResult[];
    peopleAlsoAsk?: string[];
    relatedSearches?: string[];
}> {
    const data = await request('search', query, apiKey, signal);
    if (data.organic === undefined && data.searchParameters === undefined && data.searchInformation === undefined) {
        throw new SerperError('invalid-response');
    }
    const parameters = data.searchParameters === undefined ? {} : object(data.searchParameters);
    const information = data.searchInformation === undefined ? {} : object(data.searchInformation);
    const organic = entries(data, 'organic').flatMap(o => {
        const title = requiredText(o.title);
        const link = evidenceUrl(requiredText(o.link));
        if (o.snippet !== undefined && typeof o.snippet !== 'string') throw new SerperError('invalid-response');
        return link ? [{ title, link, snippet: typeof o.snippet === 'string' ? o.snippet : '' }] : [];
    });
    return {
        adCount: entries(data, 'ads').length,
        resultCount: count(information.totalResults ?? parameters.totalResults),
        organic,
        peopleAlsoAsk: entries(data, 'peopleAlsoAsk').map(q => requiredText(q.question)),
        relatedSearches: entries(data, 'relatedSearches').map(r => requiredText(r.query)),
    };
}

export async function scrapeSearchVolume(keywords: string[], apiKey: string): Promise<KeywordData[]> {
    requireKey(apiKey);
    const results: KeywordData[] = [];
    for (const term of keywords) {
        await scrapeSearchMetadata(term, apiKey);
        // Serper search does not supply monthly keyword volume; leave it unknown.
        results.push({ term });
    }
    return results;
}
