import type { FeedConfig } from '../types'

export const FEEDS: FeedConfig[] = [
  // Arbeitnow — free JSON API, CORS-friendly, Germany/remote
  {
    name: 'Arbeitnow — Data Science',
    source: 'arbeitnow',
    url: 'https://www.arbeitnow.com/api/job-board-api?search=data+scientist',
    type: 'json-arbeitnow',
  },
  {
    name: 'Arbeitnow — Machine Learning',
    source: 'arbeitnow',
    url: 'https://www.arbeitnow.com/api/job-board-api?search=machine+learning',
    type: 'json-arbeitnow',
  },
  {
    name: 'Arbeitnow — Data Engineer',
    source: 'arbeitnow',
    url: 'https://www.arbeitnow.com/api/job-board-api?search=data+engineer',
    type: 'json-arbeitnow',
  },
  // Jobicy — free remote jobs API, global
  {
    name: 'Jobicy — Data Science (Remote)',
    source: 'jobicy',
    url: 'https://jobicy.com/api/v2/remote-jobs?industry=data-science&count=20',
    type: 'json-jobicy',
  },
  {
    name: 'Jobicy — Engineering & Tech (Remote)',
    source: 'jobicy',
    url: 'https://jobicy.com/api/v2/remote-jobs?industry=engineering&count=20',
    type: 'json-jobicy',
  },
]

export const SOURCE_LABELS: Record<string, string> = {
  jobsch: 'jobs.ch',
  heise: 'heise jobs',
  stepstone: 'Stepstone',
  linkedin: 'LinkedIn',
  arbeitnow: 'Arbeitnow',
  jobicy: 'Jobicy Remote',
  unknown: 'Unbekannt',
}

export const SOURCE_COLORS: Record<string, string> = {
  jobsch: '#0066cc',
  heise: '#c0003c',
  stepstone: '#f47920',
  linkedin: '#0077b5',
  arbeitnow: '#6366f1',
  jobicy: '#059669',
  unknown: '#888',
}
