import { scoreLabel, scoreColor } from '../../lib/scorer'
import styles from './ScoreBadge.module.css'

interface Props {
  score: number
  noData?: boolean
}

export function ScoreBadge({ score, noData }: Props) {
  if (noData) {
    return <span className={styles.badge} style={{ background: '#e5e7eb', color: '#6b7280' }}>Keine Daten</span>
  }
  const color = scoreColor(score)
  return (
    <span className={styles.badge} style={{ background: color, color: '#fff' }}>
      {score}% · {scoreLabel(score)}
    </span>
  )
}
