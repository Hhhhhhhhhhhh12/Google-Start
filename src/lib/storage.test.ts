import { describe, expect, it, vi } from 'vitest'
import { createIdea } from './ideas'
import { generateMarketAnalysis } from './marketAnalysis'
import { localDate } from './research'
import { loadIdeasWithStatus, saveIdeas, STORAGE_KEY } from './storage'

function memoryStore(initial?: string) {
  const data = new Map<string, string>(initial === undefined ? [] : [[STORAGE_KEY, initial]])
  return { data, getItem: vi.fn((key: string) => data.get(key) ?? null), setItem: vi.fn((key: string, value: string) => { data.set(key, value) }) }
}

describe('local idea persistence', () => {
  it('persists deleting the final idea, including after a reload', () => {
    const store = memoryStore()
    const idea = createIdea({ title: 'Service' })
    expect(saveIdeas([idea], store)).toBeNull()
    expect(loadIdeasWithStatus(store).ideas[0].id).toBe(idea.id)
    expect(saveIdeas([], store)).toBeNull()
    expect(loadIdeasWithStatus(store)).toEqual({ ideas: [], error: null })
    expect(store.data.get(STORAGE_KEY)).toBe('[]')
  })

  it('reads without writing and leaves corrupt originals intact', () => {
    for (const raw of ['{broken', '{}', '[{"id":"missing-fields"}]']) {
      const store = memoryStore(raw)
      expect(loadIdeasWithStatus(store).error).toBeTruthy()
      expect(store.setItem).not.toHaveBeenCalled()
      expect(store.data.get(STORAGE_KEY)).toBe(raw)
    }
  })

  it('preserves full research, report and note data on round trip', () => {
    const store = memoryStore()
    const idea = createIdea({ notes: 'Notizen', keywords: ['test'], title: 'Test', region: 'Freiburg',
      researchEntries: [{ id: 'source-1', kind: 'keyword-volume', topic: 'test', value: 120, region: 'Freiburg',
        source: 'Testquelle', sourceUrl: 'https://example.org/', observedOn: localDate(), recordedAt: 123, notes: 'Stichprobe' }],
      externalResearch: { queriedAt: 123, region: 'Freiburg', topic: 'Test', mapsSucceeded: true, searchSucceeded: false, warnings: ['Suche fehlgeschlagen'], competitors: [] } })
    idea.marketAnalysis = generateMarketAnalysis(idea)
    saveIdeas([idea], store)
    expect(loadIdeasWithStatus(store)).toEqual({ ideas: [idea], error: null })
    const duplicated = memoryStore(JSON.stringify([idea, idea]))
    expect(loadIdeasWithStatus(duplicated).error).toBeTruthy()
  })

  it('does not accept broken nested research or external evidence as a valid collection', () => {
    const base = createIdea({ title: 'Test' })
    for (const changes of [
      { researchEntries: [{ id: 'bad', source: { unexpected: 'object' } }] },
      { organicResults: [{ title: 'Bad', link: {}, snippet: '' }] },
      { externalResearch: { queriedAt: 1, region: '', topic: 'Test', mapsSucceeded: true, searchSucceeded: false, warnings: [], competitors: {} } },
    ]) {
      const store = memoryStore(JSON.stringify([{ ...base, ...changes }]))
      expect(loadIdeasWithStatus(store).error).toBeTruthy()
      expect(store.setItem).not.toHaveBeenCalled()
    }
  })

  it('reports storage failures without claiming that data was saved or exposing error details', () => {
    const store = memoryStore('[]')
    store.setItem.mockImplementation(() => { throw new Error('private-content') })
    const error = saveIdeas([createIdea({ title: 'Neu' })], store)
    expect(error).toContain('fehlgeschlagen')
    expect(error).not.toContain('private-content')
    expect(store.data.get(STORAGE_KEY)).toBe('[]')
  })
})
