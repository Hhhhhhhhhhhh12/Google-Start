import type { BusinessIdea } from '../types'

type IdeaStore = Pick<Storage, 'getItem' | 'setItem'>
export const STORAGE_KEY = 'local-demand-scanner-ideas'
const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)
const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every(item => typeof item === 'string')
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)

const competitor = (item: unknown): boolean => record(item) && typeof item.name === 'string' && finite(item.rating) && finite(item.reviewCount)
const organic = (item: unknown): boolean => record(item) && ['title', 'link', 'snippet'].every(key => typeof item[key] === 'string')
const optionalList = (value: unknown, check: (item: unknown) => boolean): boolean => value === undefined || (Array.isArray(value) && value.every(check))
const research = (item: unknown): boolean => record(item) && ['id', 'topic', 'region', 'source', 'observedOn', 'notes'].every(key => typeof item[key] === 'string') &&
  ['keyword-volume', 'trend', 'competition', 'pain-point', 'observation'].includes(String(item.kind)) && finite(item.recordedAt) &&
  (item.sourceUrl === undefined || typeof item.sourceUrl === 'string') && (item.value === undefined || finite(item.value)) &&
  (item.trend === undefined || ['rising', 'stable', 'declining', 'seasonal'].includes(String(item.trend)))

function isReport(value: unknown): boolean {
  if (!record(value) || !record(value.metrics) || !record(value.swot) || !record(value.persona)) return false
  return optionalList(value.organicEvidence, organic) && optionalList(value.researchEntries, research) && (value.researchWarnings === undefined || strings(value.researchWarnings)) &&
    ['verdict', 'demandAnalysis', 'competitionAnalysis', 'strategyRecommendation'].every(key => typeof value[key] === 'string') &&
    ['competition', 'searchVolume', 'trend', 'cpc'].every(key => typeof (value.metrics as Record<string, unknown>)[key] === 'string') &&
    ['strengths', 'weaknesses', 'opportunities', 'threats'].every(key => strings((value.swot as Record<string, unknown>)[key])) &&
    typeof value.persona.name === 'string' && typeof value.persona.willingnessToPay === 'string' && strings(value.persona.painPoints) &&
    strings(value.nextSteps) && strings(value.sources) && strings(value.revenueModels) && finite(value.generatedAt) && finite(value.scoreAtGeneration)
}

function isStoredIdea(value: unknown): value is BusinessIdea {
  if (!record(value) || !record(value.checklist)) return false
  return ['id', 'title', 'region', 'targetAudience', 'notes', 'trendNotes'].every(key => typeof value[key] === 'string') &&
    !!value.id && ['competitorCount', 'professionalCompetitorCount', 'complaintDensity', 'urgency', 'willingnessToPay', 'commercialCompetition', 'createdAt', 'updatedAt'].every(key => finite(value[key])) &&
    strings(value.keywords) && strings(value.painPoints) &&
    ['rising', 'stable', 'declining', 'seasonal'].includes(String(value.trendDirection)) &&
    ['keywordPlannerChecked', 'googleTrendsChecked', 'googleMapsChecked', 'reviewsChecked', 'cpcChecked'].every(key => typeof (value.checklist as Record<string, unknown>)[key] === 'boolean') &&
    Array.isArray(value.keywordData) && value.keywordData.every(item => record(item) && typeof item.term === 'string' && (item.monthlyVolume === undefined || finite(item.monthlyVolume))) &&
    Array.isArray(value.competitors) && value.competitors.every(competitor) && optionalList(value.organicResults, organic) && (value.peopleAlsoAsk === undefined || strings(value.peopleAlsoAsk)) && (value.relatedSearches === undefined || strings(value.relatedSearches)) &&
    Array.isArray(value.painPointEntries) && value.painPointEntries.every(item => record(item) && typeof item.text === 'string' && ['service', 'price', 'availability', 'quality', 'other'].includes(String(item.category))) &&
    (value.weights === undefined || (record(value.weights) && ['demand', 'competition', 'urgency', 'profitability'].every(key => finite((value.weights as Record<string, unknown>)[key])))) &&
    optionalList(value.researchEntries, research) &&
    (value.externalResearch === undefined || (record(value.externalResearch) && typeof value.externalResearch.topic === 'string' && typeof value.externalResearch.region === 'string' && finite(value.externalResearch.queriedAt) && typeof value.externalResearch.mapsSucceeded === 'boolean' && typeof value.externalResearch.searchSucceeded === 'boolean' && strings(value.externalResearch.warnings) && optionalList(value.externalResearch.competitors, competitor) && optionalList(value.externalResearch.organicResults, organic) && (value.externalResearch.peopleAlsoAsk === undefined || strings(value.externalResearch.peopleAlsoAsk)) && (value.externalResearch.relatedSearches === undefined || strings(value.externalResearch.relatedSearches)))) &&
    (value.marketAnalysis === undefined || isReport(value.marketAnalysis))
}

export function loadIdeasWithStatus(store?: IdeaStore): { ideas: BusinessIdea[]; error: string | null } {
  try {
    const data = (store ?? localStorage).getItem(STORAGE_KEY)
    if (!data) return { ideas: [], error: null }
    const parsed: unknown = JSON.parse(data)
    if (!Array.isArray(parsed) || !parsed.every(isStoredIdea) || new Set(parsed.map(idea => idea.id)).size !== parsed.length) {
      return { ideas: [], error: 'Gespeicherte Ideen konnten nicht sicher gelesen werden. Der Originalspeicher bleibt erhalten; Speichern und Löschen sind bis zur Klärung gesperrt.' }
    }
    return { ideas: parsed, error: null }
  } catch {
    return { ideas: [], error: 'Der lokale Ideenspeicher konnte nicht gelesen werden. Speichern und Löschen sind bis zur Klärung gesperrt; vorhandene Daten bleiben erhalten.' }
  }
}

export function saveIdeas(ideas: BusinessIdea[], store?: IdeaStore): string | null {
  try {
    ;(store ?? localStorage).setItem(STORAGE_KEY, JSON.stringify(ideas))
    return null
  } catch {
    return 'Speichern im Browser fehlgeschlagen. Der bisherige Stand bleibt erhalten. Bitte Speicherplatz und Browserberechtigungen prüfen.'
  }
}

export function loadIdeas(): BusinessIdea[] {
  return loadIdeasWithStatus().ideas
}
