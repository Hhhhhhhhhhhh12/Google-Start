import type { FeedConfig, RawRssItem } from '../types'

// --- Helpers ---

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim()
}

function hashStr(str: string): string {
  let h = 0
  for (let i = 0; i < str.length; i++) { h = (h << 5) - h + str.charCodeAt(i); h = h & h }
  return Math.abs(h).toString(36)
}

// --- Arbeitnow JSON API ---
// https://www.arbeitnow.com/api/job-board-api
// Returns: { data: [{slug, company_name, title, description, url, tags, ...}] }

interface ArbeitnowJob {
  slug: string
  company_name: string
  title: string
  description: string
  url: string
  tags: string[]
  created_at: number
  location?: string
}

const DATA_KEYWORDS = /data|machine learning|ml |ai |nlp|python|spark|tensorflow|pytorch|etl|analytics|scientist|engineer/i

export async function fetchArbeitnow(apiUrl: string, signal?: AbortSignal): Promise<RawRssItem[]> {
  const res = await fetch(apiUrl, { signal: signal ?? AbortSignal.timeout(12000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json() as { data?: unknown }
  if (!json || !Array.isArray(json.data)) throw new Error('Unerwartetes API-Format (Arbeitnow)')
  const jobs = (json.data as ArbeitnowJob[]).filter(
    (j) => j && typeof j === 'object' && typeof j.title === 'string' &&
           DATA_KEYWORDS.test(j.title + ' ' + (j.tags ?? []).join(' '))
  )
  return jobs.map(j => ({
    title: `${j.title} — ${j.company_name}`,
    link: j.url || `https://www.arbeitnow.com/jobs/${j.slug}`,
    description: stripHtml(j.description ?? ''),
    pubDate: j.created_at ? new Date(j.created_at * 1000).toUTCString() : '',
  }))
}

// --- Jobicy JSON API ---
// https://jobicy.com/api/v2/remote-jobs
// Returns: { jobs: [{id, url, jobTitle, companyName, jobDescription, pubDate, ...}] }

interface JobicyJob {
  id: number
  url: string
  jobTitle: string
  companyName: string
  jobDescription?: string
  jobExcerpt?: string
  pubDate: string
}

export async function fetchJobicy(apiUrl: string, signal?: AbortSignal): Promise<RawRssItem[]> {
  const res = await fetch(apiUrl, { signal: signal ?? AbortSignal.timeout(12000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json() as { jobs?: unknown }
  if (!json || !Array.isArray(json.jobs)) throw new Error('Unerwartetes API-Format (Jobicy)')
  return (json.jobs as JobicyJob[]).map(j => ({
    title: `${j.jobTitle} — ${j.companyName}`,
    link: j.url,
    description: stripHtml(j.jobDescription ?? j.jobExcerpt ?? ''),
    pubDate: j.pubDate ?? '',
  }))
}

// --- Dispatcher ---

export async function fetchFeed(feed: FeedConfig, signal?: AbortSignal): Promise<RawRssItem[]> {
  switch (feed.type) {
    case 'json-arbeitnow':
      return fetchArbeitnow(feed.url, signal)
    case 'json-jobicy':
      return fetchJobicy(feed.url, signal)
    default:
      throw new Error(`Nicht unterstützter Feed-Typ: ${feed.type}`)
  }
}

// Keep hashStr export for jobParser
export { hashStr }
