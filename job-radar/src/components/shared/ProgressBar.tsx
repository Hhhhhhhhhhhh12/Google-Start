import styles from './ProgressBar.module.css'

interface Props {
  value: number   // 0–100
  max?: number
  color?: string
}

export function ProgressBar({ value, max = 100, color = '#6366f1' }: Props) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className={styles.track}>
      <div className={styles.fill} style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}
