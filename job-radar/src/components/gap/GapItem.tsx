import type { SkillGapItem } from '../../types'
import { ProgressBar } from '../shared/ProgressBar'
import styles from './GapItem.module.css'

interface Props {
  item: SkillGapItem
  maxFreq: number
}

export function GapItem({ item, maxFreq }: Props) {
  const { skill, frequency, training } = item

  return (
    <article className={styles.item}>
      <div className={styles.header}>
        <span className={styles.skill}>{skill}</span>
        <span className={styles.freq}>{frequency} Stelle{frequency !== 1 ? 'n' : ''}</span>
      </div>

      <ProgressBar value={frequency} max={maxFreq} color="#6366f1" />

      <div className={styles.resources}>
        <a href={training.courseraUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
          🎓 Coursera
        </a>
        <a href={training.udemyUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
          🎬 Udemy
        </a>
        {training.certification && (
          <a href={training.certUrl} target="_blank" rel="noopener noreferrer" className={`${styles.link} ${styles.cert}`}>
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
