import { describe, expect, it, vi } from 'vitest'
import { BACKUP_FORMAT, MAX_BACKUP_BYTES, mergeBackup, parseBackup, saveImportedIdeas, serializeBackup } from './backup'
import { createIdea } from './ideas'
import { generateMarketAnalysis } from './marketAnalysis'
import { STORAGE_KEY } from './storage'

function completeIdea() {
  const idea = createIdea({ id: 'saved-1', title: 'Regionaler Service', region: 'Schleswig-Holstein', notes: 'Eigene Notizen',
    createdAt: 1000, updatedAt: 2000, dataBasis: 'researched', keywords: ['Service'],
    keywordData: [{ term: 'Service', monthlyVolume: 0 }],
    competitors: [{ name: 'Anbieter', rating: 4.5, reviewCount: 12 }],
    organicResults: [{ title: 'Quelle', link: 'https://example.org/search', snippet: 'Beschreibung' }],
    peopleAlsoAsk: ['Frage?'], relatedSearches: ['Anderes'], painPoints: ['Beobachtung'],
    painPointEntries: [{ text: 'Öffnungszeiten', category: 'availability' }],
    researchEntries: [
      { id: 'research-1', kind: 'keyword-volume', topic: 'Service', region: 'Schleswig-Holstein', source: 'Testquelle', sourceUrl: 'https://example.org/', observedOn: '2026-10-20', recordedAt: 1000, value: 0, notes: 'Unsicherheit' },
      { id: 'research-2', kind: 'trend', topic: 'Service', region: 'Schleswig-Holstein', source: 'Trends', observedOn: '2026-10-20', recordedAt: 1000, trend: 'stable', notes: '' },
    ],
    externalResearch: { queriedAt: 1000, mapsQueriedAt: 900, searchQueriedAt: 1000, topic: 'Regionaler Service', region: 'Schleswig-Holstein',
      mapsSucceeded: true, searchSucceeded: true, warnings: ['Begrenzte Abdeckung'], competitors: [], organicResults: [], totalResults: 0, peopleAlsoAsk: [], relatedSearches: [] },
  })
  idea.marketAnalysis = { ...generateMarketAnalysis(idea), dataBasis: 'researched', researchWarnings: ['Offene Frage'],
    peopleAlsoAsk: ['Warum?'], relatedSearches: ['Nachfrage'], organicEvidence: idea.organicResults, metrics: { competition: '2', searchVolume: '0', trend: 'stabil', cpc: 'unbekannt', totalResults: 0 },
    checklist: { ...idea.checklist }, evidencePercent: 50, evidenceQuality: 'weak' }
  return idea
}
function store(initial: unknown) {
  let raw = JSON.stringify(initial)
  return { get raw() { return raw }, getItem: vi.fn(() => raw), setItem: vi.fn((_key: string, value: string) => { raw = value }) }
}

describe('versioned collection backup', () => {
  it('round-trips every model field, nested evidence, zero values and original timestamps without recalculating reports', () => {
    const original = completeIdea()
    const json = serializeBackup([original], new Date('2026-10-27T12:00:00Z'))
    expect(JSON.parse(json)).toMatchObject({ format: BACKUP_FORMAT, version: 1, exportedAt: '2026-10-27T12:00:00.000Z' })
    expect(parseBackup(json)).toEqual({ ideas: [original], legacy: false, exportedAt: '2026-10-27T12:00:00.000Z' })
  })

  it('exports an empty collection and reads valid legacy raw arrays', () => {
    expect(parseBackup(serializeBackup([])).ideas).toEqual([])
    const old = createIdea({ id: 'old' })
    delete old.dataBasis; delete old.researchEntries; delete old.weights
    expect(parseBackup(JSON.stringify([old]))).toEqual({ ideas: [old], legacy: true })
  })

  it('allowlists export fields at every level and never reads browser key/settings storage', () => {
    const original = completeIdea()
    const withSecrets = { ...original, apiKey: 'secret-top', settings: { serper: 'secret-settings' },
      externalResearch: { ...original.externalResearch!, apiKey: 'secret-external' },
      marketAnalysis: { ...original.marketAnalysis!, token: 'secret-report' },
      researchEntries: original.researchEntries!.map(entry => ({ ...entry, apiKey: 'secret-source' })) }
    const json = serializeBackup([withSecrets])
    expect(json).not.toContain('secret-')
    expect(parseBackup(json).ideas).toEqual([original])
  })

  it.each([
    '{broken', '{}', '[null]', '[{"id":"missing"}]',
    JSON.stringify({ format: BACKUP_FORMAT, version: 2, exportedAt: '2026-10-27T12:00:00Z', ideas: [] }),
    JSON.stringify({ format: BACKUP_FORMAT, version: 1, exportedAt: 'bad', ideas: [] }),
  ])('rejects malformed or incompatible input without reading/writing browser storage: %s', raw => {
    expect(() => parseBackup(raw)).toThrow()
  })

  it('rejects unknown fields rather than silently discarding unsupported data', () => {
    const original = completeIdea()
    for (const altered of [
      { ...original, unsupported: true },
      { ...original, externalResearch: { ...original.externalResearch, apiKey: 'sensitive-value' } },
      { ...original, marketAnalysis: { ...original.marketAnalysis, evidencePercent: '50' } },
    ]) {
      expect(() => parseBackup(JSON.stringify([altered]))).toThrow()
    }
  })

  it('rejects duplicate idea IDs, invalid nested values, dates, URLs, weights and optional timestamps', () => {
    const original = completeIdea()
    expect(() => parseBackup(JSON.stringify([original, original]))).toThrow('Doppelte')
    expect(() => parseBackup(JSON.stringify([{ ...original, researchEntries: [original.researchEntries![0], original.researchEntries![0]] }]))).toThrow('Doppelte Beobachtungs-IDs')
    for (const altered of [
      { ...original, weights: { ...original.weights, demand: -1 } },
      { ...original, externalResearch: { ...original.externalResearch, mapsQueriedAt: 'bad' } },
      { ...original, marketAnalysis: { ...original.marketAnalysis, dataBasis: 'verified' } },
      { ...original, marketAnalysis: { ...original.marketAnalysis, metrics: { ...original.marketAnalysis!.metrics, totalResults: -2 } } },
      { ...original, researchEntries: [{ ...original.researchEntries![0], observedOn: '2026-02-30' }] },
      { ...original, researchEntries: [{ ...original.researchEntries![0], value: undefined }] },
      { ...original, researchEntries: [{ ...original.researchEntries![0], sourceUrl: 'javascript:alert(1)' }] },
      { ...original, organicResults: [{ title: 'Bad', link: 'https://user:password@example.org', snippet: '' }] },
    ]) expect(() => parseBackup(JSON.stringify([altered]))).toThrow()
  })

  it('rejects oversized files and prototype-bearing foreign fields', () => {
    expect(() => parseBackup(' '.repeat(MAX_BACKUP_BYTES + 1))).toThrow('10 MiB')
    const json = JSON.stringify([completeIdea()]).replace('"id":', '"__proto__":{"polluted":true},"id":')
    expect(() => parseBackup(json)).toThrow('Unbekannte Felder')
    expect(Object.hasOwn({}, 'polluted')).toBe(false)
  })
})

describe('reviewed, non-destructive import', () => {
  it('requires a deliberate choice for every matching ID, then preserves kept/current-only ideas', () => {
    const old = createIdea({ id: 'conflict', title: 'Vorhanden', updatedAt: 1000 })
    const keep = createIdea({ id: 'only-current' })
    const replacement = { ...old, title: 'Datei', updatedAt: 500 }
    const added = createIdea({ id: 'new' })
    expect(() => mergeBackup([old, keep], [replacement, added], new Map())).toThrow('behalten oder ersetzen')
    expect(mergeBackup([old, keep], [replacement, added], new Map([['conflict', 'keep']]))).toEqual([added, old, keep])
    expect(mergeBackup([old, keep], [replacement, added], new Map([['conflict', 'replace']]))).toEqual([added, replacement, keep])
    expect(old.title).toBe('Vorhanden')
  })

  it('refuses merging beyond backup limits so the resulting collection can still be secured', () => {
    const base = createIdea()
    const current = Array.from({ length: 10_000 }, (_, i) => ({ ...base, id: `old-${i}` }))
    expect(() => mergeBackup(current, [{ ...base, id: 'one-too-many' }], new Map())).toThrow('höchstens')
  })

  it('handles IDs resembling object properties without prototype-based lookups', () => {
    const old = createIdea({ id: '__proto__', title: 'Alt' })
    const incoming = { ...old, title: 'Neu' }
    expect(mergeBackup([old], [incoming], new Map([['__proto__', 'replace']]))[0].title).toBe('Neu')
  })

  it('preserves empty imports and does not mutate either source collection', () => {
    const original = completeIdea()
    const collection = Object.freeze([original])
    expect(mergeBackup([...collection], [], new Map())).toEqual(collection)
  })

  it('persists before the caller changes UI state and preserves timestamps', () => {
    const original = completeIdea()
    const memory = store([])
    expect(saveImportedIdeas([], [original], memory)).toBeNull()
    expect(memory.setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify([original]))
    expect(JSON.parse(memory.raw)).toEqual([original])
  })

  it('blocks stale previews / another tab changes without writing', () => {
    const memory = store([completeIdea()])
    expect(saveImportedIdeas([], [], memory)).toContain('geändert')
    expect(memory.setItem).not.toHaveBeenCalled()
  })

  it('does not overwrite unreadable original storage or expose failing write details', () => {
    const original = completeIdea()
    const bad = store({ broken: true })
    expect(saveImportedIdeas([], [original], bad)).toContain('Originalspeicher')
    expect(bad.setItem).not.toHaveBeenCalled()
    const memory = store([original])
    const before = memory.raw
    memory.setItem.mockImplementation(() => { throw new Error('private-key-data') })
    expect(saveImportedIdeas([original], [], memory)).toContain('fehlgeschlagen')
    expect(memory.raw).toBe(before)
    expect(saveImportedIdeas([original], [], memory)).not.toContain('private-key-data')
  })
})
