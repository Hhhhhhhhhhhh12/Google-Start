import type { Job } from '../../types'
import { ScoreBadge } from '../shared/ScoreBadge'
import { SOURCE_LABELS, SOURCE_COLORS } from '../../constants/feedUrls'
import { safeHref } from '../../lib/urlSafety'
import styles from './JobCard.module.css'

interface Props {
  job: Job
}

export function JobCard({ job }: Props) {
  const noData = job.requiredSkills.length === 0
  const sourceColor = SOURCE_COLORS[job.source] ?? '#888'
  const sourceLabel = SOURCE_LABELS[job.source] ?? job.source

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className={styles.meta}>
          <span className={styles.source} style={{ color: sourceColor }}>
            {sourceLabel}
          </span>
          {job.publishedAt && (
            <span className={styles.date}>
              {new Date(job.publishedAt).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' })}
            </span>
          )}
        </div>
        <ScoreBadge score={job.matchScore} noData={noData} />
      </div>

      <h3 className={styles.title}>
        <a href={safeHref(job.url)} target="_blank" rel="noopener noreferrer">{job.title}</a>
      </h3>

      {job.company && <p className={styles.company}>{job.company}</p>}

      {job.matchedSkills.length > 0 && (
        <div className={styles.skills}>
          {job.matchedSkills.map((s) => (
            <span key={s} className={styles.skillMatch}>{s}</span>
          ))}
          {job.requiredSkills
            .filter((s) => !job.matchedSkills.includes(s))
            .map((s) => (
              <span key={s} className={styles.skillMiss}>{s}</span>
            ))}
        </div>
      )}

      {noData && (
        <p className={styles.noData}>Keine Skill-Angaben in der Stellenanzeige gefunden.</p>
      )}
    </article>
  )
}
