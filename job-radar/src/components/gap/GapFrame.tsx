import type { SkillGapItem } from '../../types'
import { GapItem } from './GapItem'
import styles from './GapFrame.module.css'

interface Props {
  items: SkillGapItem[]
  hasProfile: boolean
  hasJobs: boolean
}

export function GapFrame({ items, hasProfile, hasJobs }: Props) {
  const maxFreq = items[0]?.frequency ?? 1

  return (
    <section className={styles.frame}>
      <div className={styles.toolbar}>
        <h2 className={styles.title}>
          Skill-Lücken
          {items.length > 0 && <span className={styles.count}>{items.length}</span>}
        </h2>
        <p className={styles.sub}>Gefragte Skills, die in deinem Profil fehlen — nach Häufigkeit</p>
      </div>

      {!hasProfile && (
        <div className={styles.hint}>
          👆 Lade deinen Lebenslauf hoch oder füge Skills hinzu, um eine persönliche Auswertung zu sehen.
        </div>
      )}

      {hasProfile && !hasJobs && (
        <div className={styles.hint}>
          Klicke auf <strong>Aktualisieren</strong>, um Stellenanzeigen zu laden.
        </div>
      )}

      {items.length === 0 && hasProfile && hasJobs && (
        <div className={styles.empty}>
          🎉 Du hast alle gefragten Skills bereits in deinem Profil!
        </div>
      )}

      <div className={styles.list}>
        {items.map((item) => (
          <GapItem key={item.skill} item={item} maxFreq={maxFreq} />
        ))}
      </div>
    </section>
  )
}
