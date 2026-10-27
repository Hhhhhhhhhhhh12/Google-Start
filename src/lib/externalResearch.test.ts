import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createIdea } from './ideas'
import { collectExternalResearch } from './externalResearch'
import { scrapeGoogleMaps, scrapeSearchMetadata, SerperError } from './scraper'
import { generateMarketAnalysis } from './marketAnalysis'

vi.mock('./scraper', async importOriginal => {
  const actual = await importOriginal<typeof import('./scraper')>()
  return { ...actual, scrapeGoogleMaps: vi.fn(), scrapeSearchMetadata: vi.fn() }
})
const maps = vi.mocked(scrapeGoogleMaps)
const search = vi.mocked(scrapeSearchMetadata)

beforeEach(() => { vi.resetAllMocks() })

describe('partial external research', () => {
  it('uses the regional query for both sources and preserves manual data on success', async () => {
    maps.mockResolvedValue([{ name: 'Extern', rating: 0, reviewCount: 0 }])
    search.mockResolvedValue({ adCount: 3, resultCount: 400, organic: [{ title: 'Quelle', link: 'https://example.org/', snippet: '' }] })
    const original = createIdea({ title: 'Service', region: 'Freiburg', notes: 'manuelle Notiz',
      competitors: [{ name: 'Manuell', rating: 4, reviewCount: 10 }], keywordData: [{ term: 'Service', monthlyVolume: 90 }] })
    const signal = new AbortController().signal
    const result = await collectExternalResearch(original, 'fake-secret', signal)
    expect(maps).toHaveBeenCalledWith('Service Freiburg', 'fake-secret', signal)
    expect(search).toHaveBeenCalledWith('Service Freiburg', 'fake-secret', signal)
    expect(result.changed).toBe(true)
    expect(result.idea.notes).toBe(original.notes)
    expect(result.idea.competitors).toEqual(original.competitors)
    expect(result.idea.keywordData).toEqual(original.keywordData)
    expect(result.idea.externalResearch?.competitors?.[0].name).toBe('Extern')
    expect(result.idea.externalResearch?.organicResults).toHaveLength(1)
    expect(result.totalResults).toBe(400)
    expect(generateMarketAnalysis(result.idea).metrics.searchVolume).toBe('Nicht belegt')
    expect(original.externalResearch).toBeUndefined()
  })

  it('keeps successful partial data, exposes the failed source and does not retry', async () => {
    maps.mockResolvedValue([])
    search.mockRejectedValue(new SerperError('rate-limit'))
    const result = await collectExternalResearch(createIdea({ title: 'Rad', region: 'Berlin' }), 'fake', new AbortController().signal)
    expect(result.changed).toBe(true)
    expect(result.warnings[0]).toContain('Suche:')
    expect(result.warnings[0]).toContain('Abfragelimit')
    expect(result.idea.externalResearch?.mapsSucceeded).toBe(true)
    expect(result.idea.externalResearch?.searchSucceeded).toBe(false)
    expect(generateMarketAnalysis(result.idea).metrics.competition).toBe('0 Maps-Einträge (Ausschnitt)')
    expect(maps).toHaveBeenCalledTimes(1)
    expect(search).toHaveBeenCalledTimes(1)
  })

  it('preserves an earlier successful source and its date during a partial refresh', async () => {
    maps.mockRejectedValue(new SerperError('network'))
    search.mockResolvedValue({ adCount: 0, resultCount: 2, organic: [] })
    const original = createIdea({ title: 'Rad', region: 'Berlin', externalResearch: { queriedAt: 123, region: 'Berlin', topic: 'Rad', mapsSucceeded: true,
      mapsQueriedAt: 123, searchSucceeded: false, competitors: [{ name: 'Alt', rating: 4, reviewCount: 5 }], warnings: [] } })
    const result = await collectExternalResearch(original, 'fake', new AbortController().signal)
    expect(result.idea.externalResearch?.mapsQueriedAt).toBe(123)
    expect(result.idea.externalResearch?.competitors).toEqual(original.externalResearch?.competitors)
    expect(result.idea.externalResearch?.searchQueriedAt).toBeGreaterThan(123)
    expect(result.warnings).toHaveLength(1)
  })

  it('does not replace a saved draft when both sources fail or reveal raw errors', async () => {
    maps.mockRejectedValue(new Error('fake-secret query private-content'))
    search.mockRejectedValue(new SerperError('unauthorized'))
    const original = createIdea({ title: 'Service', notes: 'behalten' })
    const result = await collectExternalResearch(original, 'fake-secret', new AbortController().signal)
    expect(result.changed).toBe(false)
    expect(result.idea).toBe(original)
    expect(result.warnings).toHaveLength(2)
    expect(result.warnings.join(' ')).not.toContain('fake-secret')
    expect(result.warnings.join(' ')).not.toContain('private-content')
  })

  it('rejects an aborted response instead of presenting it as finished research', async () => {
    const controller = new AbortController()
    maps.mockImplementation(async () => { controller.abort(); return [] })
    search.mockResolvedValue({ adCount: 0, resultCount: 0, organic: [] })
    await expect(collectExternalResearch(createIdea({ title: 'Service' }), 'fake', controller.signal)).rejects.toMatchObject({ code: 'aborted' })
  })
})
