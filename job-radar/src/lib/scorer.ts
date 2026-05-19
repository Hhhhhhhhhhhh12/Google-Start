import type { Job } from '../types'

export function rescoreJob(job: Job, userSkills: string[]): Job {
  if (job.requiredSkills.length === 0) {
    return { ...job, matchScore: 0, matchedSkills: [] }
  }
  const matchedSkills = job.requiredSkills.filter((s) => userSkills.includes(s))
  const matchScore = Math.round((matchedSkills.length / job.requiredSkills.length) * 100)
  return { ...job, matchScore, matchedSkills }
}

export function rescoreAll(jobs: Job[], userSkills: string[]): Job[] {
  return jobs.map((j) => rescoreJob(j, userSkills))
}

export function scoreLabel(score: number): string {
  if (score >= 75) return 'Sehr gut'
  if (score >= 50) return 'Gut'
  if (score >= 25) return 'Teilweise'
  return 'Gering'
}

export function scoreColor(score: number): string {
  if (score >= 75) return '#22c55e'
  if (score >= 50) return '#f59e0b'
  if (score >= 25) return '#f97316'
  return '#ef4444'
}
