import { useRef } from 'react'
import styles from './PdfUploader.module.css'

interface Props {
  onFile: (file: File) => void
  loading: boolean
}

export function PdfUploader({ onFile, loading }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file?.type === 'application/pdf') onFile(file)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      inputRef.current?.click()
    }
  }

  return (
    <div
      className={styles.zone}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => !loading && inputRef.current?.click()}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label="PDF-Lebenslauf hochladen"
      aria-busy={loading}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
        }}
      />
      {loading ? (
        <span className={styles.loading}>
          <span className={styles.spinner} /> Lebenslauf wird analysiert…
        </span>
      ) : (
        <>
          <span className={styles.icon}>📄</span>
          <span className={styles.label}>PDF hierher ziehen oder klicken</span>
          <span className={styles.sub}>Skills werden automatisch erkannt</span>
        </>
      )}
    </div>
  )
}
