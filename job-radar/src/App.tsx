import { useEffect, useRef } from 'react'
import { useProfile } from './hooks/useProfile'
import { useJobs } from './hooks/useJobs'
import { useSkillGap } from './hooks/useSkillGap'
import { Shell } from './components/layout/Shell'

function App() {
  const { profile, loading: pdfLoading, error: pdfError, loadFromPdf, addSkill, removeSkill } = useProfile()
  const userSkills = profile?.skills ?? []

  const { jobs, feedStatuses, fetching, lastFetchedAt, refresh, loadOrFetch } = useJobs(userSkills)
  const gapItems = useSkillGap(jobs, userSkills)

  // Run once on mount: load cached jobs or fetch fresh ones if cache is stale.
  // `loadOrFetch` is stable across renders (wrapped in useCallback with stable deps).
  const loadOrFetchRef = useRef(loadOrFetch)
  loadOrFetchRef.current = loadOrFetch
  useEffect(() => {
    loadOrFetchRef.current()
  }, []) // intentionally empty — mount-only trigger via stable ref

  return (
    <Shell
      skills={userSkills}
      pdfLoading={pdfLoading}
      pdfError={pdfError}
      onPdfFile={loadFromPdf}
      onAddSkill={addSkill}
      onRemoveSkill={removeSkill}
      jobs={jobs}
      feedStatuses={feedStatuses}
      fetching={fetching}
      lastFetchedAt={lastFetchedAt}
      onRefresh={refresh}
      gapItems={gapItems}
    />
  )
}

export default App
