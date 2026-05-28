import styles from './ProfilePanel.module.css'
import { PdfUploader } from './PdfUploader'
import { SkillTags } from './SkillTags'

interface Props {
  skills: string[]
  pdfLoading: boolean
  pdfError: string | null
  onPdfFile: (file: File) => void
  onAddSkill: (skill: string) => void
  onRemoveSkill: (skill: string) => void
}

export function ProfilePanel({ skills, pdfLoading, pdfError, onPdfFile, onAddSkill, onRemoveSkill }: Props) {
  return (
    <aside className={styles.panel}>
      <h2 className={styles.title}>Mein Profil</h2>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Lebenslauf</h3>
        <PdfUploader onFile={onPdfFile} loading={pdfLoading} />
        {pdfError && <p className={styles.error}>⚠ {pdfError}</p>}
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>
          Meine Skills
          <span className={styles.count}>{skills.length}</span>
        </h3>
        <SkillTags skills={skills} onAdd={onAddSkill} onRemove={onRemoveSkill} />
      </section>
    </aside>
  )
}
