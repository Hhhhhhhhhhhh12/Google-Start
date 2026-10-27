import { useRef, useState } from 'react'
import type { BusinessIdea } from '../types'
import { MAX_BACKUP_BYTES, mergeBackup, parseBackup, serializeBackup } from '../lib/backup'
import type { ConflictChoice, ParsedBackup } from '../lib/backup'

type Props = {
  ideas: BusinessIdea[]
  importBlocked: boolean
  exportBlocked: boolean
  onImport: (next: BusinessIdea[]) => string | null
}
type Preview = ParsedBackup & { originalIdeas: BusinessIdea[]; fileName: string }
const errorText = (error: unknown) => error instanceof Error ? error.message : 'Datei konnte nicht verarbeitet werden. Die Sammlung bleibt unverändert.'
const shownDate = (value: number) => new Date(value).toLocaleString('de-DE')

export function BackupPanel({ ideas, importBlocked, exportBlocked, onImport }: Props) {
  const [preview, setPreview] = useState<Preview | null>(null)
  const [choices, setChoices] = useState<Map<string, ConflictChoice>>(new Map())
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [reading, setReading] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const request = useRef(0)
  const current = new Map(ideas.map(idea => [idea.id, idea]))
  const conflicts = preview?.ideas.filter(idea => current.has(idea.id)) ?? []
  const newCount = preview?.ideas.filter(idea => !current.has(idea.id)).length ?? 0
  const replacements = conflicts.filter(idea => choices.get(idea.id) === 'replace').length
  const unresolved = conflicts.some(idea => !choices.has(idea.id))
  const stale = preview !== null && preview.originalIdeas !== ideas

  function cancelPreview() {
    request.current += 1
    setReading(false); setPreview(null); setChoices(new Map()); setError(''); setNotice('')
    if (fileInput.current) fileInput.current.value = ''
  }

  function exportCollection() {
    setError(''); setNotice('')
    if (exportBlocked) return
    try {
      const json = serializeBackup(ideas)
      const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
      const link = document.createElement('a')
      link.href = url
      link.download = `ideen-scout-sicherung-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(link)
      try { link.click() } finally { link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000) }
      setNotice(`Download für ${ideas.length} gespeicherte Ideen gestartet. Bitte die JSON-Datei aufbewahren.`)
    } catch (cause) { setError(errorText(cause)) }
  }

  async function readFile(file: File | undefined) {
    cancelPreview()
    if (!file) return
    const ticket = request.current
    setReading(true)
    try {
      if (file.size > MAX_BACKUP_BYTES) throw new Error('Datei zu groß. Maximal 10 MiB erlaubt.')
      const json = await file.text()
      if (ticket !== request.current) return
      const parsed = parseBackup(json)
      setPreview({ ...parsed, originalIdeas: ideas, fileName: file.name })
    } catch (cause) { if (ticket === request.current) setError(errorText(cause)) }
    finally { if (ticket === request.current) setReading(false) }
  }

  function applyImport() {
    if (!preview || importBlocked || stale || reading) return
    setError(''); setNotice('')
    try {
      const next = mergeBackup(ideas, preview.ideas, choices)
      const failure = onImport(next)
      if (failure) { setError(failure); return }
      cancelPreview()
      setNotice(`Import gespeichert: ${newCount} ${newCount === 1 ? 'neue Idee' : 'neue Ideen'}, ${replacements} ausdrücklich ersetzt. Andere Ideen bleiben erhalten.`)
    } catch (cause) { setError(errorText(cause)) }
  }

  return <details className="backup-panel">
    <summary>Sammlung sichern oder importieren</summary>
    <p className="helper-text">Die JSON-Datei enthält alle gespeicherten Ideen, Quellen, Notizen, Berichte und Zeitangaben. API-Schlüssel und Einstellungen werden nicht übertragen. Ungespeicherte Eingaben sind nicht enthalten.</p>
    <div className="button-row"><button type="button" className="btn-secondary" disabled={exportBlocked} onClick={exportCollection}>JSON-Sicherung herunterladen</button></div>
    {exportBlocked && <p className="helper-text">Export gesperrt: Der vorhandene Ideenspeicher kann nicht sicher gelesen werden. Er bleibt unverändert erhalten.</p>}
    <div className="form-group">
      <label htmlFor="idea-backup-file">JSON-Sicherung zum Import auswählen</label>
      <input ref={fileInput} id="idea-backup-file" type="file" accept=".json,application/json" disabled={importBlocked} onChange={event => { void readFile(event.target.files?.[0]) }} />
    </div>
    {importBlocked && <p className="helper-text">Import gesperrt: Bitte ungespeicherte Änderungen zuerst speichern oder bewusst verwerfen, laufende Abfragen beenden und vorhandene Speicherfehler klären.</p>}
    {reading && <p role="status">Datei wird geprüft. Es wird noch nichts gespeichert.</p>}
    {error && <p role="alert" className="notice error">{error}</p>}
    {notice && <p role="status" className="notice">{notice}</p>}
    {preview && <section className="import-preview" aria-label="Importvorschau">
      <h3>Importvorschau</h3>
      <p className="helper-text">Datei: {preview.fileName}</p>
      <p>{preview.ideas.length} Ideen in der Datei · {newCount} neu · {conflicts.length} mit bereits vorhandener ID.</p>
      <p className="helper-text">{preview.legacy ? 'Ältere Sicherung ohne Formatversion; alle enthaltenen Daten wurden geprüft.' : `Sicherung vom ${new Date(preview.exportedAt!).toLocaleString('de-DE')}.`} Quellen werden auf ihre Datenstruktur geprüft; ihre inhaltliche Richtigkeit wird dadurch nicht bestätigt.</p>
      {stale && <p role="alert" className="notice error">Die Sammlung wurde seit der Vorschau geändert. Bitte die Datei erneut auswählen.</p>}
      {preview.ideas.length > 0 && <ul className="import-ideas">{preview.ideas.map(idea => {
        const existing = current.get(idea.id)
        return <li key={idea.id}>
          <strong>{idea.title || 'Unbenannte Idee'}</strong> · {idea.region || 'Region nicht angegeben'}
          <p className="helper-text">Datei: geändert am {shownDate(idea.updatedAt)} · {idea.researchEntries?.length ?? 0} Beobachtungen · {idea.marketAnalysis ? 'mit Bericht' : 'ohne Bericht'}</p>
          {existing ? <>
            <p className="helper-text">Vorhanden: {existing.title || 'Unbenannte Idee'} · {existing.region || 'Region nicht angegeben'} · geändert am {shownDate(existing.updatedAt)}</p>
            <label>Welche Fassung möchtest du verwenden?
              <select aria-label={`Importentscheidung für ${idea.title || idea.id}`} value={choices.get(idea.id) ?? ''} onChange={event => {
                const value = event.target.value
                setChoices(previous => { const next = new Map(previous); if (value) next.set(idea.id, value as ConflictChoice); else next.delete(idea.id); return next })
              }}>
                <option value="">Bitte ausdrücklich wählen</option>
                <option value="keep">Vorhandene Idee behalten</option>
                <option value="replace">Vorhandene Idee durch Datei ersetzen</option>
              </select>
            </label>
          </> : <p className="helper-text">Wird als neue Idee hinzugefügt.</p>}
        </li>
      })}</ul>}
      <p className="helper-text">Vorhandene Ideen, die nicht in der Datei stehen, werden nicht gelöscht. Vor dem Ersetzen kannst du oben eine aktuelle Sicherung herunterladen.</p>
      {unresolved && <p className="helper-text">Bitte für jede bereits vorhandene ID eine Entscheidung treffen.</p>}
      {!newCount && !replacements && !unresolved && <p className="helper-text">Keine Änderungen ausgewählt.</p>}
      <div className="button-row">
        <button type="button" className="btn-primary" disabled={importBlocked || stale || reading || unresolved || (!newCount && !replacements)} onClick={applyImport}>Import jetzt speichern</button>
        <button type="button" className="btn-outline" onClick={cancelPreview}>Import abbrechen</button>
      </div>
    </section>}
  </details>
}
