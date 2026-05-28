import type { Job } from '../../types'
import type { FeedStatus } from '../../hooks/useJobs'
import { JobCard } from './JobCard'
import styles from './JobFrame.module.css'

interface Props {
  jobs: Job[]
  feedStatuses: FeedStatus[]
  fetching: boolean
  lastFetchedAt: number | null
  onRefresh: () => void
}

export function JobFrame({ jobs, feedStatuses, fetching, lastFetchedAt, onRefresh }: Props) {
  const errorFeeds = feedStatuses.filter((f) => f.status === 'error')

  return (
    <section className={styles.frame}>
      <div className={styles.toolbar}>
        <h2 className={styles.title}>
          Stellenangebote
          {jobs.length > 0 && <span className={styles.count}>{jobs.length}</span>}
        </h2>
        <div className={styles.actions}>
          {lastFetchedAt && (
            <span className={styles.timestamp}>
              Stand: {new Date(lastFetchedAt).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button className={styles.refreshBtn} onClick={onRefresh} disabled={fetching}>
            {fetching ? (
              <><span className={styles.spinner} /> Lädt…</>
            ) : (
              '↻ Aktualisieren'
            )}
          </button>
        </div>
      </div>

      {errorFeeds.length > 0 && (
        <div className={styles.warnings}>
          {errorFeeds.map((f) => (
            <p key={f.name} className={styles.warning}>
              ⚠ {f.name}: {f.error}
            </p>
          ))}
        </div>
      )}

      {fetching && jobs.length === 0 && (
        <div className={styles.loadingState}>
          <span className={styles.spinnerLarge} />
          <p>Stellen werden geladen…</p>
        </div>
      )}

      {!fetching && jobs.length === 0 && (
        <div className={styles.empty}>
          <p>Noch keine Stellen geladen.</p>
          <button className={styles.refreshBtn} onClick={onRefresh}>Jetzt laden</button>
        </div>
      )}

      <div className={styles.list}>
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </section>
  )
}
