/**
 * storage.ts — localStorage persistence for Job Radar.
 *
 * PRIVACY NOTE: All data is stored locally in the browser only.
 * No data is sent to any server. The raw CV text is stored temporarily
 * to allow re-display of extracted skills, but is never transmitted.
 * Users should avoid uploading CVs containing sensitive personal data
 * (address, phone, ID numbers) as localStorage is accessible to any
 * first-party JavaScript on the same origin.
 */
import type { AppStorage } from '../types'

const KEY = 'job-radar-v1'

const DEFAULT: AppStorage = {
  profile: null,
  jobs: [],
  jobsFetchedAt: null,
}

export function loadStorage(): AppStorage {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT }
    return { ...DEFAULT, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT }
  }
}

export function saveStorage(data: Partial<AppStorage>): void {
  const current = loadStorage()
  // Strip rawCvText from profile when persisting to minimise stored PII
  const sanitised = { ...data }
  if (sanitised.profile) {
    const { rawCvText: _, ...profileWithoutCv } = sanitised.profile
    sanitised.profile = { ...profileWithoutCv, id: 'singleton' }
  }
  localStorage.setItem(KEY, JSON.stringify({ ...current, ...sanitised }))
}

export function clearStorage(): void {
  localStorage.removeItem(KEY)
}

/** Returns true if jobs cache is older than ttlMs (default 2h). */
export function isCacheStale(jobsFetchedAt: number | null, ttlMs = 2 * 60 * 60 * 1000): boolean {
  if (jobsFetchedAt === null) return true
  return Date.now() - jobsFetchedAt > ttlMs
}
