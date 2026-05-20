import { useState } from 'react'
import { ProfilePanel } from '../profile/ProfilePanel'
import { JobFrame } from '../jobs/JobFrame'
import { GapFrame } from '../gap/GapFrame'
import type { Job, SkillGapItem } from '../../types'
import type { FeedStatus } from '../../hooks/useJobs'
import styles from './Shell.module.css'

type Tab = 'jobs' | 'gap'

interface Props {
  skills: string[]
  pdfLoading: boolean
  pdfError: string | null
  onPdfFile: (file: File) => void
  onAddSkill: (skill: string) => void
  onRemoveSkill: (skill: string) => void
  jobs: Job[]
  feedStatuses: FeedStatus[]
  fetching: boolean
  lastFetchedAt: number | null
  onRefresh: () => void
  gapItems: SkillGapItem[]
}

export function Shell(props: Props) {
  const [tab, setTab] = useState<Tab>('jobs')
  const { skills, jobs, gapItems } = props

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🌊</span>
          <span className={styles.logoText}>Faro</span>
        </div>
        <p className={styles.tagline}>Scan jobs. Know your gaps. Level up.</p>
      </header>

      <div className={styles.body}>
        {/* Sidebar */}
        <ProfilePanel
          skills={skills}
          pdfLoading={props.pdfLoading}
          pdfError={props.pdfError}
          onPdfFile={props.onPdfFile}
          onAddSkill={props.onAddSkill}
          onRemoveSkill={props.onRemoveSkill}
        />

        {/* Main content */}
        <main className={styles.main}>
          {/* Mobile tab bar */}
          <nav className={styles.tabBar}>
            <button
              className={`${styles.tab} ${tab === 'jobs' ? styles.tabActive : ''}`}
              onClick={() => setTab('jobs')}
            >
              Stellen {jobs.length > 0 && <span className={styles.tabBadge}>{jobs.length}</span>}
            </button>
            <button
              className={`${styles.tab} ${tab === 'gap' ? styles.tabActive : ''}`}
              onClick={() => setTab('gap')}
            >
              Skill-Lücken {gapItems.length > 0 && <span className={styles.tabBadge}>{gapItems.length}</span>}
            </button>
          </nav>

          {/* Desktop: both frames side by side */}
          <div className={styles.frames}>
            <div className={`${styles.frameWrap} ${tab === 'jobs' ? styles.frameVisible : styles.frameHidden}`}>
              <JobFrame
                jobs={props.jobs}
                feedStatuses={props.feedStatuses}
                fetching={props.fetching}
                lastFetchedAt={props.lastFetchedAt}
                onRefresh={props.onRefresh}
              />
            </div>
            <div className={`${styles.frameWrap} ${tab === 'gap' ? styles.frameVisible : styles.frameHidden}`}>
              <GapFrame
                items={props.gapItems}
                hasProfile={skills.length > 0}
                hasJobs={jobs.length > 0}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
