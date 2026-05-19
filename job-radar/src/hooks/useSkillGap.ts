import { useMemo } from 'react'
import type { Job, SkillGapItem } from '../types'
import { computeGap } from '../lib/gapAnalyser'

export function useSkillGap(jobs: Job[], userSkills: string[]): SkillGapItem[] {
  return useMemo(() => computeGap(jobs, userSkills), [jobs, userSkills])
}
