import type { BusinessIdea, ResearchEntry, ResearchKind } from '../types'

export const RESEARCH_LABELS: Record<ResearchKind, string> = {
  'keyword-volume': 'Monatliches Suchvolumen', trend: 'Trend', competition: 'Anzahl lokaler Anbieter',
  'pain-point': 'Beobachtetes Kundenproblem', observation: 'Sonstige lokale Beobachtung',
}

export function localDate(): string {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function normalizeRegion(region: string): string {
  return region.trim().replace(/\s+/g, ' ').toLocaleLowerCase('de-DE')
}

export function safeSourceUrl(value: string): string | undefined {
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : undefined
  } catch { return undefined }
}

export function validateResearch(entry: ResearchEntry): string | null {
  if (!Object.hasOwn(RESEARCH_LABELS, entry.kind)) return 'Bitte eine Beobachtungsart wählen.'
  if (!entry.topic.trim() || !entry.region.trim() || !entry.source.trim()) return 'Beobachtung, Region und Quelle sind erforderlich.'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.observedOn) || Number.isNaN(Date.parse(entry.observedOn)) || new Date(entry.observedOn).toISOString().slice(0, 10) !== entry.observedOn || entry.observedOn > localDate()) return 'Bitte ein gültiges Beobachtungsdatum bis heute wählen.'
  if (entry.sourceUrl && !safeSourceUrl(entry.sourceUrl)) return 'Der Quellenlink muss eine HTTP- oder HTTPS-Adresse ohne Zugangsdaten sein.'
  if (['keyword-volume', 'competition'].includes(entry.kind) && (entry.value === undefined || !Number.isSafeInteger(entry.value) || entry.value < 0)) return 'Bitte einen ganzen Wert ab 0 angeben; unbekannte Werte als sonstige Beobachtung erfassen.'
  if (entry.kind === 'trend' && !['rising', 'stable', 'declining', 'seasonal'].includes(entry.trend ?? '')) return 'Bitte den beobachteten Trend wählen.'
  return null
}

export function scopedResearch(entries: ResearchEntry[], region: string): ResearchEntry[] {
  const scope = normalizeRegion(region)
  return scope ? entries.filter(entry => normalizeRegion(entry.region) === scope && !validateResearch(entry)) : []
}

export function latestResearch(entries: ResearchEntry[], kind: ResearchKind): ResearchEntry | undefined {
  return entries.filter(entry => entry.kind === kind).sort((a, b) => b.observedOn.localeCompare(a.observedOn) || b.recordedAt - a.recordedAt)[0]
}

export function currentExternalResearch(idea: BusinessIdea): boolean {
  return !!idea.externalResearch && normalizeRegion(idea.externalResearch.region) === normalizeRegion(idea.region) &&
    normalizeRegion(idea.externalResearch.topic) === normalizeRegion(idea.title)
}

// Derive scoring inputs without rewriting original fields or manual source records.
export function projectResearch(idea: BusinessIdea): BusinessIdea {
  const entries = scopedResearch(idea.researchEntries ?? [], idea.region)
  const volumeByTerm = new Map<string, ResearchEntry>()
  entries.filter(entry => entry.kind === 'keyword-volume').sort((a, b) => a.observedOn.localeCompare(b.observedOn) || a.recordedAt - b.recordedAt)
    .forEach(entry => volumeByTerm.set(normalizeRegion(entry.topic), entry))
  const volumes = [...volumeByTerm.values()]
  const trend = latestResearch(entries, 'trend')
  const competition = latestResearch(entries, 'competition')
  const problems = entries.filter(entry => entry.kind === 'pain-point')
  const currentExternal = currentExternalResearch(idea)
  const staleExternal = !!idea.externalResearch && !currentExternal
  const hasExternal = currentExternal && (idea.externalResearch!.mapsSucceeded || idea.externalResearch!.searchSucceeded)
  const external = currentExternal ? idea.externalResearch : undefined
  const checklist = { ...idea.checklist }
  if (idea.researchEntries !== undefined) {
    checklist.keywordPlannerChecked = volumes.length > 0
    checklist.googleTrendsChecked = !!trend
    checklist.googleMapsChecked = !!competition || (currentExternal && idea.externalResearch!.mapsSucceeded)
    checklist.reviewsChecked = problems.length > 0
  }
  return {
    ...idea,
    dataBasis: entries.length ? 'researched' : hasExternal ? 'external-mixed' : idea.researchEntries !== undefined || staleExternal ? 'assumptions' : idea.dataBasis,
    researchEntries: entries,
    keywords: [...new Set([...(idea.keywords.length ? idea.keywords : idea.title.trim() ? [idea.title.trim()] : []), ...volumes.map(entry => entry.topic)])],
    keywordData: volumes.length ? volumes.map(entry => ({ term: entry.topic, monthlyVolume: entry.value })) : idea.keywordData,
    competitorCount: competition?.value ?? (external?.mapsSucceeded ? (external.competitors ?? idea.competitors).length : staleExternal ? 5 : idea.competitorCount),
    competitors: external ? external.mapsSucceeded ? (external.competitors ?? []) : [] : staleExternal ? [] : idea.competitors,
    organicResults: external ? external.searchSucceeded ? (external.organicResults ?? []) : [] : staleExternal ? [] : idea.organicResults,
    peopleAlsoAsk: external ? external.searchSucceeded ? (external.peopleAlsoAsk ?? []) : [] : staleExternal ? [] : idea.peopleAlsoAsk,
    relatedSearches: external ? external.searchSucceeded ? (external.relatedSearches ?? []) : [] : staleExternal ? [] : idea.relatedSearches,
    trendDirection: trend?.trend ?? idea.trendDirection,
    painPointEntries: [...idea.painPointEntries, ...problems.map(entry => ({ text: entry.topic, category: 'other' as const }))],
    checklist,
  }
}
