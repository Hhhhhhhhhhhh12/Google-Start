import { useState } from 'react'
import styles from './SkillTags.module.css'

interface Props {
  skills: string[]
  onAdd: (skill: string) => void
  onRemove: (skill: string) => void
}

export function SkillTags({ skills, onAdd, onRemove }: Props) {
  const [input, setInput] = useState('')

  const handleAdd = () => {
    const trimmed = input.trim().toLowerCase()
    if (trimmed && !skills.includes(trimmed)) {
      onAdd(trimmed)
      setInput('')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.tags}>
        {skills.length === 0 && (
          <span className={styles.empty}>Noch keine Skills — PDF hochladen oder manuell eingeben</span>
        )}
        {skills.map((skill) => (
          <span key={skill} className={styles.tag}>
            {skill}
            <button className={styles.remove} onClick={() => onRemove(skill)} aria-label={`${skill} entfernen`}>
              ×
            </button>
          </span>
        ))}
      </div>
      <div className={styles.inputRow}>
        <input
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Skill eingeben + Enter"
        />
        <button className={styles.addBtn} onClick={handleAdd}>+</button>
      </div>
    </div>
  )
}
