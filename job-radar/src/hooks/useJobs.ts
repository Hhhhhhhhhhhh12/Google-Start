import { useState, useCallback, useRef } from 'react'
import type { Job, FeedConfig } from '../types'
import { loadStorage, saveStorage, isCacheStale } from '../lib/storage'
import { fetchFeed } from '../lib/rssClient'
import { parseJobFromRss } from '../lib/jobParser'
import { rescoreAll } from '../lib/scorer'
import { FEEDS } from '../constants/feedUrls'

export interface FeedStatus {
  name: string
  status: 'idle' | 'loading' | 'ok' | 'error'
  error?: string
}

const MAX_JOBS = 20

function deduplicateJobs(jobs: Job[]): Job[] {
  const seen = new Set<string>()
  return jobs.filter((j) => {
    if (seen.has(j.id)) return false
    seen.add(j.id)
    return true
  })
}

export function useJobs(userSkills: string[]) {
  const stored = loadStorage()
  const [jobs, setJobs] = useState<Job[]>(() =>
    rescoreAll(stored.jobs, userSkills)
  )
  const [feedStatuses, setFeedStatuses] = useState<FeedStatus[]>(
    FEEDS.map((f) => ({ name: f.name, status: 'idle' }))
  )
  const [fetching, setFetching] = useState(false)
  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(stored.jobsFetchedAt)

  // Track the current fetch so we can cancel it on unmount or re-trigger
  const abortRef = useRef<AbortController | null>(null)

  const updateFeedStatus = useCallback((index: number, update: Partial<FeedStatus>) => {
    setFeedStatuses((prev) => prev.map((s, i) => (i === index ? { ...s, ...update } : s)))
  }, [])

  const fetchAllFeeds = useCallback(
    async (feeds: FeedConfig[], skills: string[]) => {
      // Cancel any in-flight request from a previous call
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setFetching(true)
      setFeedStatuses(feeds.map((f) => ({ name: f.name, status: 'loading' })))

      // Collect results into a local array to avoid shared-state mutation across concurrent calls
      const results: Job[][] = new Array(feeds.length).fill([])

      await Promise.allSettled(
        feeds.map(async (feed, i) => {
          try {
            const items = await fetchFeed(feed, controller.signal)
            results[i] = items.map((item) => parseJobFromRss(item, feed.source, skills))
            updateFeedStatus(i, { status: 'ok' })
          } catch (err) {
            if ((err as Error).name === 'AbortError') return
            updateFeedStatus(i, {
              status: 'error',
              error: err instanceof Error ? err.message : 'Netzwerkfehler',
            })
          }
        })
      )

      // If this fetch was aborted (component unmounted or new fetch started), discard results
      if (controller.signal.aborted) return

      const allJobs = results.flat()
      const unique = deduplicateJobs(allJobs)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, MAX_JOBS)

      const now = Date.now()
      setJobs(unique)
      setLastFetchedAt(now)
      saveStorage({ jobs: unique, jobsFetchedAt: now })
      setFetching(false)
    },
    [updateFeedStatus]
  )

  const refresh = useCallback(() => {
    fetchAllFeeds(FEEDS, userSkills)
  }, [fetchAllFeeds, userSkills])

  const loadOrFetch = useCallback(() => {
    if (isCacheStale(lastFetchedAt)) {
      refresh()
    }
  }, [lastFetchedAt, refresh])

  return { jobs, feedStatuses, fetching, lastFetchedAt, refresh, loadOrFetch }
}
