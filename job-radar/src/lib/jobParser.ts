import type { Job, JobSource, RawRssItem } from '../types'
import { extractSkills } from './skillExtractor'

function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

function extractCompany(item: RawRssItem, source: JobSource): string {
  // Many feeds include company in title as "Job Title — Company"
  const separators = [' — ', ' - ', ' | ', ' @ ']
  for (const sep of separators) {
    if (item.title.includes(sep)) {
      const parts = item.title.split(sep)
      if (parts.length > 1) return parts[parts.length - 1].trim()
    }
  }
  return source === 'jobsch' ? 'jobs.ch' : source
}

function extractTitle(item: RawRssItem): string {
  const separators = [' — ', ' - ', ' | ', ' @ ']
  for (const sep of separators) {
    if (item.title.includes(sep)) {
      return item.title.split(sep)[0].trim()
    }
  }
  return item.title.trim()
}

/** Truncate description to 500 chars after skill extraction to save localStorage space */
function truncateDescription(desc: string): string {
  return desc.length > 500 ? desc.slice(0, 500) + '…' : desc
}

export function parseJobFromRss(item: RawRssItem, source: JobSource, userSkills: string[]): Job {
  const searchText = `${item.title} ${item.description}`
  const requiredSkills = extractSkills(searchText)
  const matchedSkills = requiredSkills.filter((s) => userSkills.includes(s))
  const matchScore =
    requiredSkills.length > 0
      ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
      : 0

  return {
    id: hashString(item.link || item.title),
    title: extractTitle(item),
    company: extractCompany(item, source),
    location: '',
    url: item.link,
    publishedAt: item.pubDate,
    source,
    rawDescription: truncateDescription(item.description),
    requiredSkills,
    matchScore,
    matchedSkills,
  }
}
