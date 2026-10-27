import { useId, useState } from 'react'
import type { ResearchEntry, ResearchKind, TrendDirection } from '../types'
import { localDate, normalizeRegion, RESEARCH_LABELS, safeSourceUrl, validateResearch } from '../lib/research'

type Props = {
  region: string
  entries: ResearchEntry[]
  onAdd: (entry: ResearchEntry) => void
  onRemove: (id: string) => void
  saveHint: string
}

export function ResearchPanel({ region, entries, onAdd, onRemove, saveHint }: Props) {
  const prefix = useId()
  const [kind, setKind] = useState<ResearchKind>('observation')
  const [topic, setTopic] = useState('')
  const [source, setSource] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [entryRegion, setEntryRegion] = useState<string | null>(null)
  const [observedOn, setObservedOn] = useState(localDate)
  const [value, setValue] = useState('')
  const [trend, setTrend] = useState<TrendDirection>('stable')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const needsNumber = kind === 'keyword-volume' || kind === 'competition'

  return <section className="research-panel" aria-label="Manuelle Recherche">
    <h3>Recherche ergänzen</h3>
    <p className="helper-text">Halte fest, was du für diese Region tatsächlich beobachtet hast. Quelle und Datum machen die Angabe später nachvollziehbar.</p>
    <details>
      <summary>Beobachtung hinzufügen</summary>
      <form className="research-form" onSubmit={event => {
        event.preventDefault()
        const entry: ResearchEntry = {
          id: crypto.randomUUID(), kind, topic: topic.trim(), source: source.trim(),
          region: (entryRegion ?? region).trim(), sourceUrl: sourceUrl.trim() || undefined,
          observedOn, recordedAt: Date.now(), value: needsNumber && value.trim() ? Number(value) : undefined,
          trend: kind === 'trend' ? trend : undefined, notes: notes.trim(),
        }
        const problem = validateResearch(entry)
        if (problem) { setError(problem); setMessage(''); return }
        onAdd(entry)
        setTopic(''); setValue(''); setNotes(''); setError(''); setMessage(saveHint)
      }}>
        <div className="form-group">
          <label htmlFor={`${prefix}-kind`}>Art der Beobachtung</label>
          <select id={`${prefix}-kind`} value={kind} onChange={event => { setKind(event.target.value as ResearchKind); setError('') }}>
            {Object.entries(RESEARCH_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor={`${prefix}-topic`}>{kind === 'keyword-volume' ? 'Suchbegriff' : 'Beobachtung / Thema'}</label>
          <input id={`${prefix}-topic`} required value={topic} onChange={event => setTopic(event.target.value)} placeholder="z. B. Fahrradreparatur: lange Wartezeiten" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor={`${prefix}-region`}>Region der Beobachtung</label>
            <input id={`${prefix}-region`} required value={entryRegion ?? region} onChange={event => setEntryRegion(event.target.value)} placeholder="z. B. Freiburg" />
          </div>
          <div className="form-group">
            <label htmlFor={`${prefix}-date`}>Beobachtet am</label>
            <input id={`${prefix}-date`} required type="date" max={localDate()} value={observedOn} onChange={event => setObservedOn(event.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor={`${prefix}-source`}>Quelle</label>
          <input id={`${prefix}-source`} required value={source} onChange={event => setSource(event.target.value)} placeholder="z. B. Keyword-Planner-Export oder Gespräch mit einem lokalen Anbieter" />
        </div>
        <div className="form-group">
          <label htmlFor={`${prefix}-url`}>Quellenlink (optional)</label>
          <input id={`${prefix}-url`} type="url" value={sourceUrl} onChange={event => setSourceUrl(event.target.value)} placeholder="https://…" />
        </div>
        {needsNumber && <div className="form-group">
          <label htmlFor={`${prefix}-value`}>{kind === 'keyword-volume' ? 'Suchanfragen pro Monat laut Quelle' : 'Gezählte lokale Anbieter'}</label>
          <input id={`${prefix}-value`} required type="number" min="0" step="1" value={value} onChange={event => setValue(event.target.value)} />
          <p className="helper-text">0 ist ein erfasster Wert. Für unbekannte Werte „Sonstige lokale Beobachtung“ wählen.</p>
        </div>}
        {kind === 'trend' && <div className="form-group">
          <label htmlFor={`${prefix}-trend`}>Trend laut Quelle</label>
          <select id={`${prefix}-trend`} value={trend} onChange={event => setTrend(event.target.value as TrendDirection)}>
            <option value="stable">Stabil</option><option value="rising">Steigend</option><option value="declining">Sinkend</option><option value="seasonal">Saisonal</option>
          </select>
        </div>}
        <div className="form-group">
          <label htmlFor={`${prefix}-notes`}>Einordnung / Unsicherheit (optional)</label>
          <textarea id={`${prefix}-notes`} rows={2} value={notes} onChange={event => setNotes(event.target.value)} placeholder="z. B. nur eine Stichprobe; Zeitraum oder Einschränkungen" />
        </div>
        {error && <p role="alert" className="notice error">{error}</p>}
        <button type="submit" className="btn-secondary">Beobachtung vormerken</button>
        {message && <p role="status" className="helper-text">{message}</p>}
      </form>
    </details>
    {entries.length > 0 && <ul className="research-list">
      {entries.map(entry => <li key={entry.id}>
        <div className="research-entry-header"><strong>{entry.topic}</strong><button type="button" className="btn-text" onClick={() => onRemove(entry.id)} aria-label={`Beobachtung entfernen: ${entry.topic}`}>Entfernen</button></div>
        <p>{RESEARCH_LABELS[entry.kind]}{entry.value !== undefined ? `: ${entry.value.toLocaleString('de-DE')}` : ''}{entry.trend ? `: ${{ rising: 'Steigend', stable: 'Stabil', declining: 'Sinkend', seasonal: 'Saisonal' }[entry.trend]}` : ''}</p>
        <p>{entry.region} · {entry.observedOn} · {safeSourceUrl(entry.sourceUrl ?? '') ? <a href={safeSourceUrl(entry.sourceUrl ?? '')} target="_blank" rel="noopener noreferrer">{entry.source}</a> : entry.source}</p>
        {entry.notes && <p>{entry.notes}</p>}
        {normalizeRegion(entry.region) !== normalizeRegion(region) && <p className="notice">Andere Region: Diese Beobachtung fließt in die aktuelle Einschätzung nicht ein.</p>}
      </li>)}
    </ul>}
  </section>
}
