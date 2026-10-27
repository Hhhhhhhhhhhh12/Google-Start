import { describe, expect, it } from 'vitest'
import { generateRegionalIdeas } from './generatorEngine'
import type { ResearchEntry } from '../types'
import { localDate } from './research'

const signal = (overrides: Partial<ResearchEntry> = {}): ResearchEntry => ({ id: crypto.randomUUID(), kind: 'pain-point', topic: 'Fahrradreparatur: lange Wartezeit', region: 'Freiburg', source: 'Gespräch mit Fahrradladen', observedOn: localDate(), recordedAt: 1, notes: '', ...overrides })
const input = { region: 'Freiburg', terms: [], interests: ['Pendler'], observations: [signal(), signal({ region: 'Berlin', topic: 'Gartenpflege' })] }

describe('regional idea discovery', () => {
  it('derives service-specific hypotheses only from observations for the selected region', () => {
    const ideas = generateRegionalIdeas(input)
    expect(ideas).toHaveLength(1)
    expect(ideas[0].title).toBe('Mobiler Fahrradservice in Freiburg')
    expect(ideas[0].reason).toContain('Gespräch mit Fahrradladen')
    expect(ideas[0].reason).toContain(localDate())
    expect(ideas[0].region).toBe('Freiburg')
    expect(ideas[0].targetAudience).toBe('Pendler')
    expect(ideas[0].keywords).toContain('Fahrradreparatur')
    expect(ideas[0].researchEntries).toHaveLength(1)
    expect(generateRegionalIdeas({ ...input, region: 'Berlin' })[0].title).toBe('Flexibler Gartenservice in Berlin')
  })

  it('does not invent regional signals when observations are missing or filtered out', () => {
    expect(generateRegionalIdeas({ ...input, region: 'Hamburg' })).toEqual([])
    expect(generateRegionalIdeas({ ...input, observations: [] })).toEqual([])
    expect(generateRegionalIdeas({ ...input, terms: ['Solar'] })).toEqual([])
    expect(generateRegionalIdeas({ ...input, region: '' })).toEqual([])
  })

  it('groups related observations and carries every source into the proposed idea', () => {
    const ideas = generateRegionalIdeas({ ...input, observations: [signal(), signal({ topic: 'E-Bike Werkstatt', id: 'two', recordedAt: 2 })] })
    expect(ideas).toHaveLength(1)
    expect(ideas[0].researchEntries).toHaveLength(2)
    expect(ideas[0].potential).toContain('Offen')
  })
})
