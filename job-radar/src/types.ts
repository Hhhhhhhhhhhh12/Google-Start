export interface UserProfile {
  id: 'singleton'
  skills: string[]
  rawCvText?: string
  updatedAt: number
}

export type JobSource = 'jobsch' | 'stepstone' | 'heise' | 'linkedin' | 'arbeitnow' | 'jobicy' | 'unknown'

export interface Job {
  id: string
  title: string
  company: string
  location: string
  url: string
  publishedAt: string
  source: JobSource
  rawDescription: string
  requiredSkills: string[]
  matchScore: number
  matchedSkills: string[]
}

export interface TrainingResource {
  courseraUrl: string
  udemyUrl: string
  certification: string
  certUrl: string
  estimatedHours: number
}

export interface SkillGapItem {
  skill: string
  frequency: number
  missingFromProfile: boolean
  training: TrainingResource
}

export interface AppStorage {
  profile: UserProfile | null
  jobs: Job[]
  jobsFetchedAt: number | null
}

export interface SkillEntry {
  canonical: string
  aliases: string[]
  shortAlias: boolean // aliases with < 4 chars need word-boundary regex
}

export interface FeedConfig {
  name: string
  source: JobSource
  url: string
  type: 'rss' | 'json-arbeitnow' | 'json-jobicy'
}

export interface RawRssItem {
  title: string
  link: string
  description: string
  pubDate: string
}
