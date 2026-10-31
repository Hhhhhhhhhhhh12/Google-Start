import type { BusinessIdea } from '../types'
import { currentExternalResearch } from './research'
import { scrapeGoogleMaps, scrapeSearchMetadata, SerperError } from './scraper'

export async function collectExternalResearch(candidate: BusinessIdea, key: string, signal: AbortSignal): Promise<{
  idea: BusinessIdea; warnings: string[]; changed: boolean; totalResults?: number
}> {
  const query = `${candidate.title} ${candidate.region}`.trim()
  const [maps, search] = await Promise.allSettled([
    scrapeGoogleMaps(query, key, signal), scrapeSearchMetadata(query, key, signal),
  ])
  if (signal.aborted) throw new SerperError('aborted')
  const warnings: string[] = []
  const message = (error: unknown) => error instanceof SerperError ? error.message : 'Die Anfrage konnte nicht abgeschlossen werden.'
  if (maps.status === 'rejected') warnings.push(`Maps: ${message(maps.reason)}`)
  if (search.status === 'rejected') warnings.push(`Suche: ${message(search.reason)}`)
  if (maps.status === 'rejected' && search.status === 'rejected') return { idea: candidate, warnings, changed: false }
  const now = Date.now()
  const previous = currentExternalResearch(candidate) ? candidate.externalResearch : undefined
  return {
    changed: true, warnings,
    totalResults: search.status === 'fulfilled' ? search.value.resultCount : previous?.totalResults,
    idea: {
      ...candidate,
      externalResearch: { queriedAt: now, region: candidate.region, topic: candidate.title,
        mapsSucceeded: maps.status === 'fulfilled' || !!previous?.mapsSucceeded,
        searchSucceeded: search.status === 'fulfilled' || !!previous?.searchSucceeded, warnings,
        mapsQueriedAt: maps.status === 'fulfilled' ? now : previous?.mapsQueriedAt,
        searchQueriedAt: search.status === 'fulfilled' ? now : previous?.searchQueriedAt,
        competitors: maps.status === 'fulfilled' ? maps.value : previous?.competitors,
        organicResults: search.status === 'fulfilled' ? search.value.organic : previous?.organicResults,
        peopleAlsoAsk: search.status === 'fulfilled' ? search.value.peopleAlsoAsk : previous?.peopleAlsoAsk,
        relatedSearches: search.status === 'fulfilled' ? search.value.relatedSearches : previous?.relatedSearches,
        totalResults: search.status === 'fulfilled' ? search.value.resultCount : previous?.totalResults },
    },
  }
}
