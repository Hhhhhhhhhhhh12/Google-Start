import { describe, expect, it } from 'vitest'
import type { ResearchEntry } from '../types'
import { createIdea } from './ideas'
import { latestResearch, localDate, projectResearch, scopedResearch, validateResearch } from './research'
import { generateMarketAnalysis } from './marketAnalysis'
import { generateReportMarkdown } from './exportUtils'

export function observation(overrides: Partial<ResearchEntry> = {}): ResearchEntry {
  return { id: crypto.randomUUID(), kind: 'observation', topic: 'Fahrradreparatur', region: 'Freiburg',
    source: 'Lokales Gespräch', observedOn: localDate(), recordedAt: Date.now(), notes: 'Stichprobe', ...overrides }
}

describe('source-backed manual research', () => {
  it('requires source, region and real date; rejects unsafe links and unknown numeric values', () => {
    expect(validateResearch(observation())).toBeNull()
    for (const changes of [{ source: '' }, { region: '' }, { observedOn: '2026-02-30' }, { observedOn: '2999-01-01' }, { sourceUrl: 'javascript:alert(1)' }, { sourceUrl: 'https://user:pass@example.com' }, { kind: 'keyword-volume' as const }, { kind: 'competition' as const, value: -1 }]) {
      expect(validateResearch(observation(changes))).toBeTruthy()
    }
    expect(validateResearch(observation({ kind: 'keyword-volume', value: 0 }))).toBeNull()
  })

  it('uses only the requested region and the latest observation for each term', () => {
    const old = observation({ kind: 'keyword-volume', topic: 'Rad', value: 300, recordedAt: 1 })
    const newest = observation({ kind: 'keyword-volume', topic: ' rad ', value: 120, recordedAt: 2 })
    const foreign = observation({ kind: 'keyword-volume', value: 9000, region: 'Berlin' })
    const idea = createIdea({ title: 'Service', region: ' freiburg ', notes: 'Behalten', researchEntries: [old, newest, foreign] })
    const projected = projectResearch(idea)
    expect(projected.keywordData).toEqual([{ term: ' rad ', monthlyVolume: 120 }])
    expect(projected.researchEntries).toHaveLength(2)
    expect(idea.keywordData).toEqual([])
    expect(idea.researchEntries).toHaveLength(3)
    expect(scopedResearch(idea.researchEntries!, '')).toEqual([])
    expect(latestResearch([old, newest], 'keyword-volume')?.value).toBe(120)
  })

  it('keeps zero volume and stable trend as real observations, with source snapshots in reports and exports', () => {
    const entries = [observation({ kind: 'keyword-volume', value: 0 }), observation({ kind: 'trend', trend: 'stable' }), observation({ kind: 'competition', value: 0 })]
    const draft = createIdea({ title: 'Rad', region: 'Freiburg', researchEntries: entries })
    const report = generateMarketAnalysis(draft)
    expect(report.metrics.searchVolume).toBe('0 / Monat (manuell angegeben)')
    expect(report.metrics.trend).toBe('Stabil (manuell angegeben)')
    expect(report.metrics.competition).toBe('0 Anbieter (manuell erfasst)')
    expect(report.evidencePercent).toBeGreaterThan(0)
    expect(report.researchEntries).toEqual(entries)
    const exported = generateReportMarkdown('Rad', 'Freiburg', report)
    expect(exported).toContain('Lokales Gespräch')
    expect(exported).toContain(localDate())
    expect(exported).toContain('Stichprobe')
    const removed = generateMarketAnalysis({ ...draft, researchEntries: [] })
    expect(removed.metrics.searchVolume).toBe('Nicht belegt')
    expect(removed.metrics.trend).toBe('Nicht geprüft')
    const changedRegion = generateMarketAnalysis({ ...draft, region: 'Berlin' })
    expect(changedRegion.researchEntries).toEqual([])
    expect(changedRegion.metrics.searchVolume).toBe('Nicht belegt')
  })

  it('excludes external results from a different idea/region without deleting original evidence', () => {
    const idea = createIdea({ title: 'Service', region: 'Berlin', externalResearch: { queriedAt: 1, region: 'Freiburg', topic: 'Service', mapsSucceeded: true, searchSucceeded: true, warnings: [],
      competitors: [{ name: 'Alt', rating: 4, reviewCount: 1 }], organicResults: [{ title: 'Alt', link: 'https://example.org', snippet: '' }] } })
    const report = generateMarketAnalysis(idea)
    expect(report.organicEvidence).toEqual([])
    expect(report.metrics.competition).toBe('Nicht erhoben')
    expect(report.researchWarnings?.[0]).toContain('ausgeschlossen')
    expect(idea.externalResearch?.competitors).toHaveLength(1)
  })
})
