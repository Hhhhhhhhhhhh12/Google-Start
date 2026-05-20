import type { SkillGapItem } from '../../types'
import { ProgressBar } from '../shared/ProgressBar'
import { safeHref } from '../../lib/urlSafety'
import styles from './GapItem.module.css'

interface Props {
  item: SkillGapItem
  maxFreq: number
  onAddSkill?: (skill: string) => void
}

export function GapItem({ item, maxFreq, onAddSkill }: Props) {
  const { skill, frequency, training } = item

  return (
    <article className={styles.item}>
      <div className={styles.header}>
        <span className={styles.skill}>{skill}</span>
        <div className={styles.headerRight}>
          <span className={styles.freq}>{frequency} Stelle{frequency !== 1 ? 'n' : ''}</span>
          {onAddSkill && (
            <button
              className={styles.addBtn}
              onClick={() => onAddSkill(skill)}
              aria-label={`${skill} zum Profil hinzufügen`}
              title="Zum Profil hinzufügen"
            >
              + Profil
            </button>
          )}
        </div>
      </div>

      <ProgressBar value={frequency} max={maxFreq} color="#6366f1" />

      <div className={styles.resources}>
        <a href={safeHref(training.courseraUrl)} target="_blank" rel="noopener noreferrer" className={styles.link}>
          🎓 Coursera
        </a>
        <a href={safeHref(training.udemyUrl)} target="_blank" rel="noopener noreferrer" className={styles.link}>
          🎬 Udemy
        </a>
        {training.certification && (
          <a href={safeHref(training.certUrl)} target="_blank" rel="noopener noreferrer" className={`${styles.link} ${styles.cert}`}>
            🏅 {training.certification}
          </a>
        )}
        {training.estimatedHours > 0 && (
          <span className={styles.time}>⏱ ~{training.estimatedHours}h</span>
        )}
      </div>
    </article>
  )
}
