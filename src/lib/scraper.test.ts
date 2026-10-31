import { afterEach, describe, expect, it, vi } from 'vitest';
import { scrapeGoogleMaps, scrapeSearchMetadata, scrapeSearchVolume, SerperError } from './scraper';

const KEY = 'private-api-key';
const QUERY = 'private query';

function respond(data: unknown, status = 200) {
    const fetchMock = vi.fn().mockResolvedValue({
        ok: status >= 200 && status < 300,
        status,
        statusText: `${KEY} ${QUERY}`,
        json: vi.fn().mockResolvedValue(data),
    });
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
}

afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
});

describe('Serper success and normalization', () => {
    it('maps typed competitors and normalizes numeric fields', async () => {
        const fetchMock = respond({ maps: [
            { title: ' Café ', rating: '4.7', reviews: '24' },
            { title: 'Other', rating: 9, reviews: -4 },
            { title: 'Unknown', rating: 'bad', reviews: Infinity },
        ] });
        expect(await scrapeGoogleMaps(QUERY, KEY)).toEqual([
            { name: 'Café', rating: 4.7, reviewCount: 24 },
            { name: 'Other', rating: 5, reviewCount: 0 },
            { name: 'Unknown', rating: 0, reviewCount: 0 },
        ]);
        expect(fetchMock).toHaveBeenCalledWith('https://google.serper.dev/maps', expect.objectContaining({
            method: 'POST', body: JSON.stringify({ q: QUERY }),
            headers: { 'X-API-KEY': KEY, 'Content-Type': 'application/json' },
            signal: expect.any(AbortSignal),
        }));
    });

    it('reads only supplied result totals and keeps usable evidence', async () => {
        respond({
            organic: [{ title: 'Evidence', link: 'https://example.org/proof', snippet: 'Text' }],
            ads: [{ title: 'Ad' }],
            searchParameters: { totalResults: '27.8' },
            peopleAlsoAsk: [{ question: 'Why?' }], relatedSearches: [{ query: 'Nearby' }],
        });
        expect(await scrapeSearchMetadata(QUERY, KEY)).toEqual({
            adCount: 1, resultCount: 27,
            organic: [{ title: 'Evidence', link: 'https://example.org/proof', snippet: 'Text' }],
            peopleAlsoAsk: ['Why?'], relatedSearches: ['Nearby'],
        });
    });

    it('does not invent a total from the number of organic results', async () => {
        respond({ organic: [{ title: 'One', link: 'http://example.org' }] });
        expect(await scrapeSearchMetadata(QUERY, KEY)).toMatchObject({
            resultCount: 0, organic: [{ title: 'One', link: 'http://example.org/', snippet: '' }],
        });
    });

    it.each([-1, 'unknown', Infinity, null])('normalizes invalid totals: %s', async total => {
        respond({ organic: [], searchInformation: { totalResults: total } });
        expect((await scrapeSearchMetadata(QUERY, KEY)).resultCount).toBe(0);
    });

    it('filters unsafe, relative, malformed and credential-bearing evidence URLs', async () => {
        respond({ organic: ['javascript:alert(1)', 'data:text/html,hi', '/relative', 'not a url',
            'https://user:password@example.org', 'https://example.org'].map(link => ({ title: 'Evidence', link })) });
        expect((await scrapeSearchMetadata(QUERY, KEY)).organic).toEqual([
            { title: 'Evidence', link: 'https://example.org/', snippet: '' },
        ]);
    });

    it('leaves monthly volume unknown and preserves empty success results', async () => {
        respond({ organic: [] });
        expect(await scrapeSearchVolume(['one', 'two'], KEY)).toEqual([{ term: 'one' }, { term: 'two' }]);
        respond({ maps: [] });
        expect(await scrapeGoogleMaps(QUERY, KEY)).toEqual([]);
    });
});

describe('safe Serper failures', () => {
    it('makes no request without a nonblank key, including empty keyword lists', async () => {
        const fetchMock = respond({});
        for (const run of [() => scrapeGoogleMaps(QUERY, ' '), () => scrapeSearchMetadata(QUERY, ''),
            () => scrapeSearchVolume([], '')]) {
            await expect(run()).rejects.toMatchObject({ code: 'missing-key' });
        }
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it.each([[401, 'unauthorized'], [403, 'unauthorized'], [429, 'rate-limit'], [500, 'http'], [400, 'http']])(
        'reports HTTP %s without leaking details or retrying', async (status, code) => {
            const fetchMock = respond({ message: `${KEY} ${QUERY}` }, status as number);
            const error = await scrapeSearchMetadata(QUERY, KEY).catch(e => e);
            expect(error).toBeInstanceOf(SerperError);
            expect(error.code).toBe(code);
            expect(error.message).not.toContain(KEY);
            expect(error.message).not.toContain(QUERY);
            expect(fetchMock).toHaveBeenCalledTimes(1);
        },
    );

    it('sanitizes network errors', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error(`${KEY} ${QUERY}`)));
        const error = await scrapeGoogleMaps(QUERY, KEY).catch(e => e);
        expect(error).toMatchObject({ code: 'network' });
        expect(error.message).not.toContain(KEY);
        expect(error.message).not.toContain(QUERY);
    });

    it('classifies malformed JSON without exposing parser details', async () => {
        const fetchMock = respond({});
        fetchMock.mockResolvedValue({ ok: true, json: vi.fn().mockRejectedValue(new Error(KEY)) });
        await expect(scrapeSearchMetadata(QUERY, KEY)).rejects.toMatchObject({ code: 'invalid-response' });
    });

    it.each([null, [], 'text', {}, { organic: {} }, { organic: [null] },
        { organic: [{ title: 'Missing link' }] }, { organic: [{ title: 'X', link: 'https://example.org', snippet: 2 }] },
        { organic: [], ads: 'wrong' }, { organic: [], peopleAlsoAsk: [{ question: 7 }] },
        { organic: [], relatedSearches: [7] }, { organic: [], searchParameters: [] },
        { organic: [], error: KEY }])('rejects invalid search schemas: %j', async data => {
        respond(data);
        await expect(scrapeSearchMetadata(QUERY, KEY)).rejects.toMatchObject({ code: 'invalid-response' });
    });

    it.each([{}, { maps: null }, { maps: [3] }, { maps: [{ title: 7 }] }])('rejects invalid Maps schemas: %j', async data => {
        respond(data);
        await expect(scrapeGoogleMaps(QUERY, KEY)).rejects.toMatchObject({ code: 'invalid-response' });
    });

    it('fails keyword collection visibly on HTTP errors', async () => {
        const fetchMock = respond({}, 429);
        await expect(scrapeSearchVolume(['one', 'two'], KEY)).rejects.toMatchObject({ code: 'rate-limit' });
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('aborts after 15 seconds and does not retry', async () => {
        vi.useFakeTimers();
        const fetchMock = vi.fn((_url: string, init: RequestInit) => new Promise((_resolve, reject) => {
            init.signal?.addEventListener('abort', () => reject(new Error(KEY)), { once: true });
        }));
        vi.stubGlobal('fetch', fetchMock);
        const result = expect(scrapeSearchMetadata(QUERY, KEY)).rejects.toMatchObject({ code: 'timeout' });
        await vi.advanceTimersByTimeAsync(15_000);
        await result;
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(vi.getTimerCount()).toBe(0);
    });

    it('supports caller cancellation, including an already aborted signal', async () => {
        const controller = new AbortController();
        const fetchMock = vi.fn((_url: string, init: RequestInit) => new Promise((_resolve, reject) => {
            init.signal?.addEventListener('abort', () => reject(new Error(KEY)), { once: true });
        }));
        vi.stubGlobal('fetch', fetchMock);
        const result = expect(scrapeGoogleMaps(QUERY, KEY, controller.signal)).rejects.toMatchObject({ code: 'aborted' });
        controller.abort();
        await result;
        await expect(scrapeSearchMetadata(QUERY, KEY, controller.signal)).rejects.toMatchObject({ code: 'aborted' });
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
});
