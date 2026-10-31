import type { BusinessIdea, ExternalResearch, MarketAnalysis, ResearchEntry } from '../types'
import { loadIdeasWithStatus, saveIdeas } from './storage'

export const BACKUP_FORMAT = 'ideen-scout-backup'
export const BACKUP_VERSION = 1
export const MAX_BACKUP_BYTES = 10 * 1024 * 1024
const MAX_IDEAS = 10_000

type Rule = (value: unknown, path: string, strict: boolean) => unknown
function fail(path: string, message: string): never { throw new Error(`${path}: ${message}`) }
const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)
const text: Rule = (v, p) => typeof v === 'string' ? v : fail(p, 'Text erwartet.')
const boolean: Rule = (v, p) => typeof v === 'boolean' ? v : fail(p, 'Ja/Nein-Wert erwartet.')
const number = (min = 0, max = Number.MAX_SAFE_INTEGER): Rule => (v, p) =>
  typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? v : fail(p, 'Zahl außerhalb des gültigen Bereichs.')
const timestamp = number(0, 8.64e15)
const enumeration = (...values: string[]): Rule => (v, p) => typeof v === 'string' && values.includes(v) ? v : fail(p, 'Unbekannter Wert.')
const optional = (rule: Rule): Rule => (v, p, strict) => v === undefined ? undefined : rule(v, p, strict)
const list = (rule: Rule): Rule => (v, p, strict) => Array.isArray(v) ? v.map((item, i) => rule(item, `${p}[${i + 1}]`, strict)) : fail(p, 'Liste erwartet.')
const object = (fields: Record<string, Rule>): Rule => (v, p, strict) => {
  if (!record(v)) return fail(p, 'Objekt erwartet.')
  if (strict && Object.keys(v).some(key => !Object.hasOwn(fields, key))) return fail(p, 'Unbekannte Felder; Datei nicht ohne Prüfung übernehmen.')
  const result: Record<string, unknown> = {}
  for (const [key, rule] of Object.entries(fields)) {
    const parsed = rule(v[key], `${p}.${key}`, strict)
    if (parsed !== undefined) result[key] = parsed
  }
  return result
}
const id: Rule = (v, p) => typeof v === 'string' && v.trim() ? v : fail(p, 'Nicht leere ID erwartet.')
const date: Rule = (v, p) => {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v) || !Number.isFinite(Date.parse(v)) || new Date(v).toISOString().slice(0, 10) !== v) return fail(p, 'Gültiges Datum (JJJJ-MM-TT) erwartet.')
  return v
}
const sourceUrl: Rule = (v, p) => {
  if (v === '') return v
  if (typeof v === 'string') {
    try { const url = new URL(v); if (['http:', 'https:'].includes(url.protocol) && !url.username && !url.password) return v } catch { /* report a safe field error */ }
  }
  return fail(p, 'HTTP-/HTTPS-Link ohne Zugangsdaten erwartet.')
}
const trend = enumeration('rising', 'stable', 'declining', 'seasonal')
const basis = enumeration('assumptions', 'external-mixed', 'manual', 'researched')
const strings = list(text)
const competitor = object({ name: text, rating: number(0, 5), reviewCount: number() })
const organic = object({ title: text, link: sourceUrl, snippet: text })
const checklist = object({ keywordPlannerChecked: boolean, googleTrendsChecked: boolean, googleMapsChecked: boolean, reviewsChecked: boolean, cpcChecked: boolean })
const researchObject = object({ id, kind: enumeration('keyword-volume', 'trend', 'competition', 'pain-point', 'observation'), topic: text, region: text,
  source: text, sourceUrl: optional(sourceUrl), observedOn: date, recordedAt: timestamp, value: optional(number()), trend: optional(trend), notes: text } satisfies Record<keyof ResearchEntry, Rule>)
const research: Rule = (v, p, strict) => {
  const parsed = researchObject(v, p, strict) as Record<string, unknown>
  if (['keyword-volume', 'competition'].includes(String(parsed.kind)) && !Number.isSafeInteger(parsed.value)) fail(p, 'Für diese Beobachtung fehlt ein ganzzahliger Wert ab 0.')
  if (parsed.kind === 'trend' && parsed.trend === undefined) fail(p, 'Trendrichtung fehlt.')
  return parsed
}
const researchEntries: Rule = (v, p, strict) => {
  const entries = list(research)(v, p, strict) as ResearchEntry[]
  if (new Set(entries.map(entry => entry.id)).size !== entries.length) fail(p, 'Doppelte Beobachtungs-IDs.')
  return entries
}
const report = object({ dataBasis: optional(enumeration('assumptions', 'external-mixed', 'manual', 'researched', 'unverified')),
  researchEntries: optional(researchEntries), researchWarnings: optional(strings), verdict: text, demandAnalysis: text, competitionAnalysis: text,
  strategyRecommendation: text, nextSteps: strings, metrics: object({ competition: text, searchVolume: text, trend: text, cpc: text, totalResults: optional(number()) }),
  sources: strings, organicEvidence: optional(list(organic)), peopleAlsoAsk: optional(strings), relatedSearches: optional(strings),
  swot: object({ strengths: strings, weaknesses: strings, opportunities: strings, threats: strings }),
  persona: object({ name: text, painPoints: strings, willingnessToPay: text }), revenueModels: strings, generatedAt: timestamp,
  scoreAtGeneration: number(0, 100), checklist: optional(checklist), evidencePercent: optional(number(0, 100)), evidenceQuality: optional(enumeration('incomplete', 'weak', 'usable', 'strong')) } satisfies Record<keyof MarketAnalysis, Rule>)
const idea = object({ id, title: text, region: text, targetAudience: text, keywords: strings,
  weights: optional(object({ demand: number(0, 100), competition: number(0, 100), urgency: number(0, 100), profitability: number(0, 100) })),
  dataBasis: optional(basis), researchEntries: optional(researchEntries),
  externalResearch: optional(object({ queriedAt: timestamp, mapsQueriedAt: optional(timestamp), searchQueriedAt: optional(timestamp), region: text, topic: text,
    mapsSucceeded: boolean, searchSucceeded: boolean, warnings: strings, competitors: optional(list(competitor)), organicResults: optional(list(organic)),
    peopleAlsoAsk: optional(strings), relatedSearches: optional(strings), totalResults: optional(number()) } satisfies Record<keyof ExternalResearch, Rule>)),
  keywordData: list(object({ term: text, monthlyVolume: optional(number()) })), competitorCount: number(), professionalCompetitorCount: number(),
  competitors: list(competitor), organicResults: optional(list(organic)), peopleAlsoAsk: optional(strings), relatedSearches: optional(strings),
  complaintDensity: number(0, 10), urgency: number(0, 10), willingnessToPay: number(0, 10), commercialCompetition: number(0, 10), notes: text,
  painPoints: strings, painPointEntries: list(object({ text, category: enumeration('service', 'price', 'availability', 'quality', 'other') })),
  trendDirection: trend, trendNotes: text, checklist, marketAnalysis: optional(report), createdAt: timestamp, updatedAt: timestamp } satisfies Record<keyof BusinessIdea, Rule>)

function readIdeas(value: unknown, strict: boolean): BusinessIdea[] {
  if (!Array.isArray(value) || value.length > MAX_IDEAS) fail('Ideen', `Liste mit höchstens ${MAX_IDEAS} Ideen erwartet.`)
  const ideas = value.map((v, i) => idea(v, `Idee ${i + 1}`, strict)) as BusinessIdea[]
  if (new Set(ideas.map(item => item.id)).size !== ideas.length) fail('Ideen', 'Doppelte Ideen-IDs in der Datei.')
  return ideas
}

export interface IdeaBackup { format: typeof BACKUP_FORMAT; version: typeof BACKUP_VERSION; exportedAt: string; ideas: BusinessIdea[] }
export interface ParsedBackup { ideas: BusinessIdea[]; legacy: boolean; exportedAt?: string }

// Allowlist every exported field. Browser settings, keys and foreign properties never enter the backup.
export function serializeBackup(ideas: BusinessIdea[], now = new Date()): string {
  const backup: IdeaBackup = { format: BACKUP_FORMAT, version: BACKUP_VERSION, exportedAt: now.toISOString(), ideas: readIdeas(ideas, false) }
  const json = JSON.stringify(backup, null, 2)
  if (new Blob([json]).size > MAX_BACKUP_BYTES) fail('Sicherung', 'Die Sammlung überschreitet die unterstützte Dateigröße von 10 MiB.')
  return json
}

export function parseBackup(json: string): ParsedBackup {
  if (new Blob([json]).size > MAX_BACKUP_BYTES) fail('Datei', 'Maximal 10 MiB erlaubt.')
  let parsed: unknown
  try { parsed = JSON.parse(json) } catch { return fail('Datei', 'Kein gültiges JSON. Die Sammlung bleibt unverändert.') }
  if (Array.isArray(parsed)) return { ideas: readIdeas(parsed, true), legacy: true }
  if (!record(parsed) || parsed.format !== BACKUP_FORMAT) fail('Datei', 'Keine Ideen-Scout-Sicherung.')
  if (parsed.version !== BACKUP_VERSION) fail('Datei', 'Unbekannte Sicherungsversion. Bitte mit einer passenden App-Version öffnen.')
  if (Object.keys(parsed).some(key => !['format', 'version', 'exportedAt', 'ideas'].includes(key))) fail('Datei', 'Unbekannte Felder im Sicherungsformat.')
  if (typeof parsed.exportedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(parsed.exportedAt) || !Number.isFinite(Date.parse(parsed.exportedAt))) fail('Datei', 'Exportdatum fehlt oder ist ungültig.')
  return { ideas: readIdeas(parsed.ideas, true), legacy: false, exportedAt: parsed.exportedAt }
}

export type ConflictChoice = 'keep' | 'replace'
export function mergeBackup(current: BusinessIdea[], incoming: BusinessIdea[], choices: ReadonlyMap<string, ConflictChoice>): BusinessIdea[] {
  const checked = readIdeas(incoming, true)
  const existing = new Set(current.map(item => item.id))
  for (const item of checked) if (existing.has(item.id) && !['keep', 'replace'].includes(choices.get(item.id) ?? '')) fail('Import', 'Für jede gleiche Ideen-ID bitte behalten oder ersetzen wählen.')
  const replacements = new Map(checked.filter(item => existing.has(item.id) && choices.get(item.id) === 'replace').map(item => [item.id, item]))
  const merged = [...checked.filter(item => !existing.has(item.id)), ...current.map(item => replacements.get(item.id) ?? item)]
  // Do not create a collection which cannot itself be backed up again.
  serializeBackup(merged)
  return merged
}

// Persist before changing React state, and reject stale previews / another tab's changes.
export function saveImportedIdeas(current: BusinessIdea[], next: BusinessIdea[], store?: Pick<Storage, 'getItem' | 'setItem'>): string | null {
  const stored = loadIdeasWithStatus(store)
  if (stored.error) return stored.error
  if (JSON.stringify(stored.ideas) !== JSON.stringify(current)) return 'Die gespeicherte Sammlung hat sich geändert. Bitte Seite neu laden und den Import erneut prüfen.'
  return saveIdeas(next, store)
}
