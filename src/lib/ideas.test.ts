import { describe, expect, it } from 'vitest'
import { createIdea, editIdea, upsertIdea } from './ideas'
import { generateMarketAnalysis } from './marketAnalysis'

describe('editing saved ideas', () => {
  it('preserves identity, original creation, notes, sources and weights after renaming and re-evaluation', () => {
    const original = createIdea({ title: 'Fahrradservice', region: 'Freiburg', notes: 'Wichtige Recherche', keywords: ['Rad', 'Werkstatt'],
      keywordData: [{ term: 'Rad', monthlyVolume: 20 }], createdAt: 123,
      weights: { demand: 40, competition: 20, urgency: 20, profitability: 20 } })
    original.marketAnalysis = generateMarketAnalysis(original)
    const other = createIdea({ title: 'Andere Idee' })
    const changed = editIdea(original, { title: 'Radservice für Pendler' })
    expect(changed.marketAnalysis).toBeUndefined()
    const saved = upsertIdea([original, other], { ...changed, marketAnalysis: generateMarketAnalysis(changed) })
    expect(saved).toHaveLength(2)
    expect(saved[0]).toMatchObject({ id: original.id, createdAt: 123, title: 'Radservice für Pendler', notes: original.notes,
      keywords: original.keywords, keywordData: original.keywordData, weights: original.weights })
    expect(saved[1]).toBe(other)
    expect(original.title).toBe('Fahrradservice')
    expect(original.marketAnalysis).toBeDefined()
  })

  it('allows two distinct ideas to have the same title and region without overwriting', () => {
    const first = createIdea({ title: 'Service', region: 'Berlin' })
    const second = createIdea({ title: 'Service', region: 'Berlin' })
    expect(upsertIdea([first], second).map(idea => idea.id)).toEqual([second.id, first.id])
  })
})
