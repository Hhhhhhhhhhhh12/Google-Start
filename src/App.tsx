import { useEffect, useRef, useState } from 'react'
import './App.css'
import { generateMarketAnalysis } from './lib/marketAnalysis'
import { generateRegionalIdeas, type RegionalIdea } from './lib/generatorEngine'
import { collectExternalResearch } from './lib/externalResearch'
import { generateReportMarkdown } from './lib/exportUtils'
import { describeDataBasis, prepareReportForDisplay } from './lib/reportProvenance'
import type { BusinessIdea, MarketAnalysis, ResearchEntry } from './types'
import { loadIdeasWithStatus, saveIdeas } from './lib/storage'
import { createIdea, DEFAULT_WEIGHTS, editIdea, upsertIdea } from './lib/ideas'
import { currentExternalResearch, projectResearch, scopedResearch } from './lib/research'
import { buildResearchQueries } from './lib/queryBuilder'
import { deleteApiKey, loadApiKey, saveApiKey } from './lib/apiKey'
import { ResearchPanel } from './components/ResearchPanel'
import { AnalysisReport } from './components/AnalysisReport'
import { AppNavigation, type AppMode } from './components/AppNavigation'
import { BackupPanel } from './components/BackupPanel'
import { saveImportedIdeas } from './lib/backup'

type EvaluationStep = 0 | 1 | 2

function App() {
  const [initialStore] = useState(loadIdeasWithStatus)
  const [ideas, setIdeas] = useState(initialStore.ideas)
  const [mode, setMode] = useState<AppMode>('evaluate')
  const [evaluationStep, setEvaluationStep] = useState<EvaluationStep>(0)
  const [draft, setDraft] = useState(() => createIdea())
  const [draftDirty, setDraftDirty] = useState(false)
  const [keywordsText, setKeywordsText] = useState('')
  const [report, setReport] = useState<MarketAnalysis | null>(null)
  const [notice, setNotice] = useState('')
  const [saveError, setSaveError] = useState('')
  const [deletedIdeas, setDeletedIdeas] = useState<BusinessIdea[]>([])
  const [researchErrors, setResearchErrors] = useState<string[]>([])
  const [isEvaluating, setIsEvaluating] = useState(false)
  const request = useRef<AbortController | null>(null)
  const generation = useRef(0)
  const heading = useRef<HTMLHeadingElement>(null)
  const [initialKey] = useState(loadApiKey)
  const [serperApiKey, setSerperApiKey] = useState(initialKey.key)
  const [apiKeyDraft, setApiKeyDraft] = useState(initialKey.key)
  const [rememberKey, setRememberKey] = useState(initialKey.remembered)
  const [keyNotice, setKeyNotice] = useState(initialKey.error ?? '')
  const [deriveSearchTerms, setDeriveSearchTerms] = useState('')
  const [deriveRegion, setDeriveRegion] = useState('')
  const [deriveInterests, setDeriveInterests] = useState('')
  const [discoveryEntries, setDiscoveryEntries] = useState<ResearchEntry[]>([])
  const [excludedSignalIds, setExcludedSignalIds] = useState<string[]>([])
  const [derivedIdeas, setDerivedIdeas] = useState<RegionalIdea[] | null>(null)
  const [deriveError, setDeriveError] = useState('')
  const ideaTitle = draft.title
  const ideaRegion = draft.region
  const targetAudience = draft.targetAudience
  const weights = draft.weights ?? DEFAULT_WEIGHTS
  const isSaved = ideas.some(idea => idea.id === draft.id)
  const comparableIdeas = ideas.filter(idea => idea.marketAnalysis).map(idea => ({ ...idea, marketAnalysis: prepareReportForDisplay(idea.marketAnalysis!) }))
  const researchQueries = buildResearchQueries(projectResearch(draft))
  const displayedResearchErrors = researchErrors.length ? researchErrors : report?.researchWarnings ?? []
  const regionSignals = [...new Map(scopedResearch([...ideas.flatMap(idea => idea.researchEntries ?? []), ...discoveryEntries], deriveRegion).map(entry => [entry.id, entry])).values()]

  useEffect(() => () => { generation.current += 1; request.current?.abort() }, [])

  useEffect(() => { heading.current?.focus() }, [mode, evaluationStep])

  function navigate(next: AppMode) {
    setMode(next)
  }

  function goToStep(next: EvaluationStep) {
    if (next > 0 && !draft.title.trim()) {
      setSaveError('Bitte einen Titel für die Idee eingeben.')
      setEvaluationStep(0)
      requestAnimationFrame(() => document.getElementById('title')?.focus())
      return
    }
    setEvaluationStep(next)
    setSaveError('')
  }

  function cancelResearch() {
    generation.current += 1
    request.current?.abort()
    request.current = null
    setIsEvaluating(false)
  }

  function changeDraft(changes: Partial<BusinessIdea>) {
    cancelResearch()
    setDraft(previous => editIdea(previous, changes))
    setDraftDirty(true)
    setReport(null)
    setResearchErrors([])
    setNotice('')
    setSaveError('')
  }

  function openIdea(idea: BusinessIdea) {
    if (draftDirty && !window.confirm('Ungespeicherte Änderungen an der aktuellen Idee verwerfen?')) return
    cancelResearch()
    setDraft({ ...idea, weights: { ...(idea.weights ?? DEFAULT_WEIGHTS) } })
    setKeywordsText(idea.keywords.join(', '))
    setReport(idea.marketAnalysis ? prepareReportForDisplay(idea.marketAnalysis) : null)
    setResearchErrors(idea.externalResearch?.warnings ?? [])
    setEvaluationStep(idea.marketAnalysis ? 2 : 0)
    setDraftDirty(false); setNotice(''); setSaveError(''); navigate('evaluate')
  }

  function startNewIdea(overrides: Partial<BusinessIdea> = {}) {
    if (draftDirty && !window.confirm('Ungespeicherte Änderungen an der aktuellen Idee verwerfen?')) return false
    cancelResearch()
    setEvaluationStep(0)
    setDraft(createIdea(overrides)); setReport(null); setDraftDirty(!!overrides.title)
    setKeywordsText(overrides.keywords?.join(', ') ?? '')
    setResearchErrors([]); setNotice(overrides.title ? 'Vorschlag übernommen. Mit Entwurf speichern sichern.' : ''); setSaveError('')
    navigate('evaluate')
    return true
  }

  function persistIdeas(next: BusinessIdea[]): boolean {
    const error = initialStore.error ?? saveIdeas(next)
    if (error) { setSaveError(error); return false }
    setIdeas(next); setSaveError(''); return true
  }

  function importCollection(next: BusinessIdea[]): string | null {
    if (draftDirty || isEvaluating) return 'Bitte den aktuellen Entwurf zuerst speichern oder bewusst verwerfen und laufende Abfragen beenden.'
    const failure = initialStore.error ?? saveImportedIdeas(ideas, next)
    if (failure) return failure
    setIdeas(next)
    setDeletedIdeas(previous => previous.filter(deleted => !next.some(idea => idea.id === deleted.id)))
    const importedDraft = next.find(idea => idea.id === draft.id)
    if (importedDraft) {
      setDraft(importedDraft)
      setKeywordsText(importedDraft.keywords.join(', '))
      setReport(importedDraft.marketAnalysis ? prepareReportForDisplay(importedDraft.marketAnalysis) : null)
      setResearchErrors(importedDraft.externalResearch?.warnings ?? [])
    }
    setSaveError(''); setNotice('')
    return null
  }

  function persistDraft(candidate: BusinessIdea, analysis?: MarketAnalysis): boolean {
    if (!candidate.title.trim()) { setSaveError('Bitte einen Titel für die Idee eingeben.'); return false }
    const next = upsertIdea(ideas, { ...candidate, marketAnalysis: analysis ?? candidate.marketAnalysis })
    if (!persistIdeas(next)) return false
    setDraft(next.find(idea => idea.id === candidate.id)!); setDraftDirty(false)
    setNotice(analysis ? 'Einschätzung und Recherche gespeichert.' : 'Entwurf gespeichert.')
    return true
  }

  function removeIdea(idea: BusinessIdea) {
    if (!persistIdeas(ideas.filter(item => item.id !== idea.id))) return
    setDeletedIdeas(previous => [idea, ...previous])
    if (draft.id === idea.id) { cancelResearch(); setDraft(createIdea()); setEvaluationStep(0); setKeywordsText(''); setDraftDirty(false); setReport(null) }
    setNotice('Idee gelöscht. Du kannst das Löschen rückgängig machen, solange diese Seite geöffnet bleibt.')
  }

  function undoDelete() {
    const [idea, ...remaining] = deletedIdeas
    if (idea && persistIdeas(upsertIdea(ideas, idea))) { setDeletedIdeas(remaining); setNotice('Idee wiederhergestellt.') }
  }

  const setIdeaTitle = (title: string) => changeDraft({ title })
  const setIdeaRegion = (region: string) => changeDraft({ region })
  const setTargetAudience = (audience: string) => changeDraft({ targetAudience: audience })
  const setWeights = (next: typeof weights) => changeDraft({ weights: next })

  function handleAutoPopulate(idea: RegionalIdea) {
    startNewIdea({ title: idea.title, region: idea.region, targetAudience: idea.targetAudience, keywords: idea.keywords,
      researchEntries: idea.researchEntries, notes: idea.reason })
  }

  async function handleEvaluate(useExternal = false) {
    if (!draft.title.trim()) { setSaveError('Bitte einen Titel für die Idee eingeben.'); return }
    if (useExternal && !serperApiKey) { setSaveError('Bitte zuerst einen Serper-Schlüssel verwenden.'); return }
    cancelResearch()
    const current = generation.current
    const controller = new AbortController()
    request.current = controller
    setIsEvaluating(true); setResearchErrors([]); setNotice(''); setSaveError('')
    let candidate = { ...draft, title: draft.title.trim(), region: draft.region.trim() }
    let totalResults = currentExternalResearch(candidate) ? candidate.marketAnalysis?.metrics.totalResults : undefined
    try {
      if (useExternal) {
        const result = await collectExternalResearch(candidate, serperApiKey, controller.signal)
        if (generation.current !== current || controller.signal.aborted) return
        setResearchErrors(result.warnings)
        if (!result.changed) {
          setNotice('Keine neue externe Recherche erhalten. Der bisherige Entwurf und vorhandene Berichte bleiben erhalten.')
          return
        }
        candidate = result.idea
        totalResults = result.totalResults
      }
      const analysis = generateMarketAnalysis(candidate)
      if (totalResults !== undefined && currentExternalResearch(candidate)) analysis.metrics.totalResults = totalResults
      if (generation.current !== current) return
      setReport(analysis)
      setDraft({ ...candidate, marketAnalysis: analysis })
      setDraftDirty(true)
      persistDraft(candidate, analysis)
      setEvaluationStep(2)
    } catch {
      if (generation.current !== current || controller.signal.aborted) return
      setSaveError('Die Einschätzung konnte nicht erstellt werden. Der Entwurf bleibt erhalten.')
    } finally {
      if (generation.current === current) { setIsEvaluating(false); request.current = null }
    }
  }

  function handleDerive() {
    if (!deriveRegion.trim()) { setDeriveError('Bitte eine Region angeben.'); return }
    const results = generateRegionalIdeas({ region: deriveRegion,
      terms: deriveSearchTerms.split(/[,\n]/), interests: deriveInterests.split(/[,\n]/),
      observations: regionSignals.filter(entry => !excludedSignalIds.includes(entry.id)) })
    setDerivedIdeas(results)
    setDeriveError(results.length ? '' : 'Keine passenden Beobachtungen ausgewählt. Erfasse eine Beobachtung für diese Region oder ändere den Suchbegriff-Filter.')
  }

  function saveKey() {
    const error = saveApiKey(apiKeyDraft, rememberKey)
    if (error) { setKeyNotice(error); return }
    setSerperApiKey(apiKeyDraft.trim())
    setKeyNotice(apiKeyDraft.trim() ? rememberKey ? 'Schlüssel auf diesem Gerät gespeichert.' : 'Schlüssel nur für diese Browsersitzung gespeichert.' : 'Schlüssel entfernt.')
  }

  function forgetKey() {
    cancelResearch()
    const error = deleteApiKey()
    setSerperApiKey(''); setApiKeyDraft(''); setRememberKey(false)
    setKeyNotice(error ?? 'Schlüssel aus Sitzung und Geräteablage gelöscht.')
  }

  function handleExport() {
    if (!report) return
    const md = generateReportMarkdown(draft.title, draft.region, report)
    const url = URL.createObjectURL(new Blob([md], { type: 'text/markdown' }))
    const anchor = document.createElement('a')
    anchor.href = url; anchor.download = `Analyse_${draft.title.replace(/\s+/g, '_')}.md`; anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="app-container">
      <a className="skip-link" href="#workspace">Zum Inhalt</a>
      <header className="app-header">
        <span className="app-brand"><span className="brand-mark" aria-hidden="true">↗</span>Ideen Scout</span>
        <span className="header-note">Regionale Geschäftsideen recherchieren</span>
      </header>
      <div className="app-shell">
        <AppNavigation mode={mode} count={ideas.length} onNavigate={navigate} />
        <main className={`main-content ${mode === 'compare' ? 'wide-content' : ''}`} id="workspace" tabIndex={-1}>
          <div className="workspace-inner">
            <div className="page-heading">
              <h1 ref={heading} tabIndex={-1}>{({ home: 'Sammlung', evaluate: 'Idee prüfen', discover: 'Ideen finden', compare: 'Ideen vergleichen', settings: 'Einstellungen' })[mode]}</h1>
              {mode === 'evaluate' && <span className="step-caption">Schritt {evaluationStep + 1} von 3</span>}
            </div>
            {initialStore.error && <p role="alert" className="notice error">{initialStore.error}</p>}
            {saveError && <p role="alert" className="notice error">{saveError}</p>}
            {notice && <p role="status" className="notice">{notice}</p>}
            {deletedIdeas.length > 0 && <button className="btn-text undo-button" onClick={undoDelete}>Letztes Löschen rückgängig machen</button>}

            <section hidden={mode !== 'settings'} aria-label="Schlüsselverwaltung" className="settings-panel">
              <h2>Externe Recherche</h2>
              <p>Such- und Maps-Abfragen sind optional und werden nur ausdrücklich gestartet.</p>
              <p className="context-strip">{serperApiKey ? 'Schlüssel aktiv' : 'Kein Schlüssel hinterlegt'}</p>
              <div className="key-settings-body">
                <p className="helper-text">Ein Schlüssel wird nur für eine gestartete Serper-Abfrage verwendet. Standardmäßig gilt er für diese Browsersitzung.</p>
                <label htmlFor="serper-key">Serper-Schlüssel</label>
                <input id="serper-key" type="password" autoComplete="off" value={apiKeyDraft} onChange={event => setApiKeyDraft(event.target.value)} />
                <label className="checkbox-label"><input type="checkbox" checked={rememberKey} onChange={event => setRememberKey(event.target.checked)} />Auf diesem Gerät speichern (freiwillig)</label>
                <p className="helper-text">Bei Geräteablage kann JavaScript unter dieser lokalen Adresse den Schlüssel lesen. Löschen entfernt auch eine frühere Geräteablage.</p>
                <div className="button-row"><button className="btn-secondary" onClick={saveKey}>Schlüssel verwenden</button><button className="btn-outline" onClick={forgetKey}>Schlüssel löschen</button></div>
                {keyNotice && <p role="status" className="notice">{keyNotice}</p>}
              </div>
            </section>

            <section hidden={mode !== 'home'} aria-label="Gespeicherte Ideen">
              <div className="section-heading"><h2>Deine Ideen ({ideas.length})</h2><button className="btn-text" onClick={() => startNewIdea()}>Neue Idee</button></div>
              <BackupPanel ideas={ideas} exportBlocked={!!initialStore.error} importBlocked={!!initialStore.error || draftDirty || isEvaluating} onImport={importCollection} />
              {ideas.length === 0 ? <div className="empty-state"><p>Noch keine Ideen gespeichert.</p><p className="helper-text">Prüfe deine erste Idee oder entwickle ein Angebot aus lokalen Beobachtungen.</p><div className="button-row"><button className="btn-primary" onClick={() => navigate('evaluate')}>Idee prüfen</button><button className="btn-secondary" onClick={() => navigate('discover')}>Ideen finden</button></div></div> :
                <div className="ideas-list">{ideas.map(idea => <article className="idea-card" key={idea.id}>
                  <div className="idea-card-header"><h3>{idea.title}</h3><button className="btn-secondary" onClick={() => openIdea(idea)}>Öffnen</button></div>
                  <p className="helper-text">{idea.region || 'Region nicht angegeben'} · {idea.marketAnalysis ? `Orientierungs-Score: ${idea.marketAnalysis.scoreAtGeneration}` : 'Entwurf ohne Einschätzung'}</p>
                  {idea.marketAnalysis && <p className="helper-text">{describeDataBasis(idea.marketAnalysis)}</p>}
                  <details className="idea-actions"><summary>Weitere Aktionen</summary><button className="btn-text danger" onClick={() => removeIdea(idea)} disabled={!!initialStore.error}>Idee löschen</button></details>
                </article>)}</div>}
            </section>

            <section hidden={mode !== 'evaluate'} aria-label="Idee schrittweise prüfen">
              <ol className="evaluation-steps" aria-label="Prüfschritte">{(['Idee', 'Beobachtungen', 'Einschätzung'] as const).map((label, index) => <li key={label}><button type="button" aria-current={evaluationStep === index ? 'step' : undefined} onClick={() => goToStep(index as EvaluationStep)}><span className="step-dot">{index + 1}</span>{label}</button></li>)}</ol>
              <div className="section-heading editor-caption"><span className="helper-text">{draftDirty ? 'Ungespeicherte Änderungen' : isSaved ? 'Gespeicherte Idee' : 'Neuer Entwurf'}</span><button className="btn-text" onClick={() => startNewIdea()}>Neue Idee</button></div>
              <fieldset disabled={isEvaluating} className="editor-fields">
                <div hidden={evaluationStep !== 0}>
                  <h2>Was hast du vor?</h2>
                  <div className="form-group"><label htmlFor="title">Deine Geschäftsidee</label><input id="title" value={ideaTitle} onChange={event => setIdeaTitle(event.target.value)} placeholder="z. B. Mobiler Fahrradservice" /></div>
                  <div className="form-group"><label htmlFor="region">In welcher Region? (optional)</label><input id="region" value={ideaRegion} onChange={event => setIdeaRegion(event.target.value)} placeholder="z. B. Freiburg" /></div>
                  <details className="draft-details"><summary>Zielgruppe, Suchbegriffe und Notizen <span className="optional-label">optional</span></summary>
                    <div className="form-group"><label htmlFor="targetAudience">Zielgruppe</label><input id="targetAudience" value={targetAudience} onChange={event => setTargetAudience(event.target.value)} placeholder="z. B. Pendler" /></div>
                    <div className="form-group"><label htmlFor="idea-keywords">Suchbegriffe (durch Komma getrennt)</label><textarea id="idea-keywords" rows={2} value={keywordsText} onChange={event => { setKeywordsText(event.target.value); changeDraft({ keywords: event.target.value.split(',').map(term => term.trim()).filter(Boolean) }) }} /></div>
                    <div className="form-group"><label htmlFor="idea-notes">Notizen zur Idee</label><textarea id="idea-notes" rows={3} value={draft.notes} onChange={event => changeDraft({ notes: event.target.value })} /></div>
                  </details>
                  <div className="editor-actions"><button className="btn-text" onClick={() => persistDraft(draft)} disabled={!draft.title.trim() || !!initialStore.error}>Entwurf speichern</button><button className="btn-primary" onClick={() => goToStep(1)}>Weiter zu Beobachtungen →</button></div>
                </div>

                <div hidden={evaluationStep !== 1}>
                  <h2>Was weißt du schon?</h2>
                  <p className="helper-text">Halte Beobachtungen mit ihrer Quelle fest. Du kannst auch ohne sie weitergehen.</p>
                  <div className="context-strip"><strong>{ideaTitle || 'Deine Idee'}</strong><span>{ideaRegion || 'Region noch offen'}</span></div>
                  <ResearchPanel key={draft.id} region={draft.region} entries={draft.researchEntries ?? []}
                    onAdd={entry => changeDraft({ researchEntries: [...(draft.researchEntries ?? []), entry] })}
                    onRemove={id => changeDraft({ researchEntries: draft.researchEntries?.filter(entry => entry.id !== id) })}
                    saveHint="Beobachtung vorgemerkt. Mit Entwurf speichern oder Prüfen und speichern sichern." />
                  <details className="research-links"><summary>Gezielt weiter recherchieren</summary>
                    <p className="helper-text">Links öffnen externe Seiten erst nach deinem Klick. Ergebnisse anschließend als Beobachtung mit Quelle erfassen.</p>
                    {(['google', 'maps', 'trends', 'pain-point'] as const).map(category => <details key={category}><summary>{{ google: 'Google-Suche', maps: 'Lokale Anbieter auf Maps', trends: 'Google Trends', 'pain-point': 'Kundenprobleme recherchieren' }[category]}</summary><ul>{researchQueries.filter(query => query.category === category).map((query, index) => <li key={`${query.url}-${index}`}><a href={query.url} target="_blank" rel="noopener noreferrer">{query.label}</a></li>)}</ul></details>)}
                  </details>
                  <details className="external-action"><summary>Mit externer Recherche ergänzen</summary>
                    <p>Diese freiwillige Abfrage sendet Titel und Region an Serper für Google-Suche und Maps. Dafür können Serper-Credits anfallen. Monatliches Suchvolumen wird dabei nicht ermittelt.</p>
                    <button className="btn-outline" disabled={!serperApiKey || !draft.title.trim() || !!initialStore.error} onClick={() => handleEvaluate(true)}>Such- und Maps-Abfrage starten</button>
                    {!serperApiKey && <p className="helper-text">Einen Schlüssel kannst du in den <button className="btn-text" onClick={() => navigate('settings')}>Einstellungen</button> hinterlegen. Dein Entwurf bleibt erhalten.</p>}
                  </details>
                  <div className="editor-actions"><button className="btn-text" onClick={() => goToStep(0)}>← Zurück</button><button className="btn-secondary" onClick={() => persistDraft(draft)} disabled={!draft.title.trim() || !!initialStore.error}>Entwurf speichern</button><button className="btn-primary" onClick={() => handleEvaluate()} disabled={!draft.title.trim() || !!initialStore.error}>Prüfen und speichern →</button></div>
                </div>

                <div hidden={evaluationStep !== 2}>
                  {!report && <div className="empty-state"><h2>Bereit für eine erste Einschätzung?</h2><p>Die vorhandenen Angaben werden lokal ausgewertet. Fehlende Daten bleiben als offen erkennbar.</p><button className="btn-primary" onClick={() => handleEvaluate()} disabled={!draft.title.trim() || !!initialStore.error}>Prüfen und speichern</button></div>}

                </div>
              </fieldset>
              {isEvaluating && <p className="notice" role="status">Recherche läuft… <button className="btn-text" onClick={cancelResearch}>Recherche abbrechen</button></p>}
              {displayedResearchErrors.length > 0 && <div role="alert" className="notice error"><strong>Recherche nur teilweise oder nicht abgeschlossen</strong><ul>{displayedResearchErrors.map(error => <li key={error}>{error}</li>)}</ul><p>Manuelle Angaben und der bisherige Stand bleiben erhalten. Eine weitere Abfrage startest du selbst.</p></div>}
              {evaluationStep === 2 && <div className="context-strip"><strong>{ideaTitle}</strong><span>{ideaRegion || 'Region noch offen'}</span></div>}
              {report && evaluationStep === 2 && <AnalysisReport report={report} ideaTitle={ideaTitle} onExport={handleExport} />}
              <fieldset className="editor-fields" disabled={isEvaluating} hidden={evaluationStep !== 2}>
                  <details className="weight-settings"><summary>Gewichtung anpassen</summary><div className="weight-group">{([['demand', 'Markt-Nachfrage'], ['competition', 'Wettbewerb'], ['urgency', 'Dringlichkeit'], ['profitability', 'Profitabilität']] as const).map(([key, label]) => <div className="weight-row" key={key}><label htmlFor={`weight-${key}`}>{label}</label><input id={`weight-${key}`} type="range" min="0" max="100" value={weights[key]} onChange={event => setWeights({ ...weights, [key]: Number(event.target.value) })} /><span className="weight-val">{weights[key]}%</span></div>)}<p className="helper-text">Die Gewichte werden für die Berechnung ins Verhältnis gesetzt. Nach einer Änderung erneut prüfen und speichern.</p></div></details>
              </fieldset>
              {evaluationStep === 2 && <div className="editor-actions"><button className="btn-text" onClick={() => goToStep(1)}>← Beobachtungen ergänzen</button>{report && <button className="btn-secondary" onClick={() => navigate('home')}>Zur Sammlung</button>}</div>}
            </section>
        <div hidden={mode !== 'discover'} className="dashboard-grid single-col" aria-label="Regionale Ideenfindung">
            <section className="panel form-panel">
              <h2>Regionale Beobachtungen auswählen</h2>
              <p>Aus deinen Quellen entstehen prüfbare Arbeitshypothesen. Es werden hier keine aktuellen Suchsignale automatisch abgerufen.</p>
              <div className="form-row">
                <div className="form-group"><label htmlFor="deriveRegion">Region für neue Ideen</label><input id="deriveRegion" value={deriveRegion} onChange={event => { setDeriveRegion(event.target.value); setDerivedIdeas(null); setDeriveError('') }} placeholder="z. B. Freiburg" /></div>
                <div className="form-group"><label htmlFor="searchTerms">Suchbegriffe eingrenzen (optional)</label><input id="searchTerms" value={deriveSearchTerms} onChange={event => { setDeriveSearchTerms(event.target.value); setDerivedIdeas(null) }} placeholder="z. B. Fahrrad, Garten" /></div>
              </div>
              <div className="form-group"><label htmlFor="interests">Zielgruppe / Interessen (optional)</label><input id="interests" value={deriveInterests} onChange={event => { setDeriveInterests(event.target.value); setDerivedIdeas(null) }} placeholder="z. B. Pendler, Familien" /></div>
              <ResearchPanel region={deriveRegion} entries={discoveryEntries}
                onAdd={entry => { setDiscoveryEntries(previous => [...previous, entry]); setDerivedIdeas(null); setDeriveError('') }}
                onRemove={id => { setDiscoveryEntries(previous => previous.filter(entry => entry.id !== id)); setDerivedIdeas(null) }}
                saveHint="Für diese Suche vorgemerkt. Beim Übernehmen eines Vorschlags wird die Beobachtung Teil des neuen Ideenentwurfs; anschließend speichern." />
              <h3>Passende Beobachtungen ({regionSignals.length})</h3>
              <p className="helper-text">Es zählen nur Angaben zur gleichen Region. Vorgemerkte Angaben und Beobachtungen aus gespeicherten Ideen stehen zur Auswahl.</p>
              {regionSignals.length === 0 ? <p>Für diese Region sind noch keine passenden Beobachtungen vorhanden. Füge oben eine Quelle hinzu.</p> : <ul className="signal-list">{regionSignals.map(entry => <li key={entry.id}><label><input type="checkbox" checked={!excludedSignalIds.includes(entry.id)} onChange={event => { setExcludedSignalIds(previous => event.target.checked ? previous.filter(id => id !== entry.id) : [...previous, entry.id]); setDerivedIdeas(null) }} /><span><strong>{entry.topic}</strong><br />{entry.region} · {entry.source} · {entry.observedOn}</span></label></li>)}</ul>}
              {deriveError && <p role="alert" className="notice error">{deriveError}</p>}
              <button className="btn-primary large" onClick={handleDerive} disabled={!deriveRegion.trim()}>Vorschläge aus Beobachtungen erstellen</button>
            </section>

            {derivedIdeas && (
              <section className="panel results-panel fade-in">
                <div className="panel-header">
                  <h2>Abgeleitete Geschäftsideen</h2>
                  <span className="badge-hypothesis">Vorschläge aus Vorlagen</span>
                </div>
                <div className="ideas-list">
                  {derivedIdeas.map((idea, idx) => (
                    <div key={idx} className="idea-card">
                      <div className="idea-card-header">
                        <h3>{idea.title}</h3>
                        <button
                          className="btn-outline small"
                          onClick={() => handleAutoPopulate(idea)}
                        >
                          Als Idee übernehmen
                        </button>
                      </div>
                      <p>
                        <strong>Warum:</strong> {idea.reason}
                      </p>
                      <p>
                        <strong>Potenzial:</strong> {idea.potential}
                      </p>
                      <details><summary>Verwendete Beobachtungen ({idea.researchEntries.length})</summary><ul>{idea.researchEntries.map(entry => <li key={entry.id}>{entry.topic} · {entry.source} · {entry.observedOn} · {entry.region}</li>)}</ul></details>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
          <div hidden={mode !== 'compare'} className="dashboard-grid single-col" aria-label="Vergleich gespeicherter Ideen">
            <section className="panel results-panel fade-in">
<p className="helper-text">Vergleiche zuerst die Datenbasis und die offenen Fragen. Scores sind keine Erfolgsprognose.</p>
              {comparableIdeas.length < 2 ? (
                <div className="empty-state"><p>Du benötigst mindestens 2 gespeicherte Berichte für einen Vergleich.</p><button className="btn-primary" onClick={() => navigate('evaluate')}>Idee prüfen</button></div>
              ) : (
                <div className="compare-table-container" role="region" aria-label="Vergleichstabelle, bei Bedarf seitlich scrollen" tabIndex={0}>
                  <table className="compare-table" >
                    <thead>
                      <tr>
                        <th>Metrik</th>
                        {comparableIdeas.map(idea => (
                          <th key={idea.id}>{idea.title} {!idea.title.toLocaleLowerCase('de-DE').includes(idea.region.toLocaleLowerCase('de-DE')) && <><br/><small>{idea.region}</small></>}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Datenbasis</td>
                        {comparableIdeas.map(idea => (
                          <td key={idea.id}>{describeDataBasis(idea.marketAnalysis)}</td>
                        ))}
                      </tr>
                      <tr>
                        <td>Passende Beobachtungen</td>
                        {comparableIdeas.map(idea => <td key={idea.id}>{idea.marketAnalysis.researchEntries?.length ?? 'Nicht dokumentiert'}</td>)}
                      </tr>
                      <tr>
                        <td>Orientierungs-Score</td>
                        {comparableIdeas.map(idea => (
                          <td key={idea.id}>
                            <strong>{idea.marketAnalysis?.scoreAtGeneration}</strong>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td>Suchvolumen</td>
                        {comparableIdeas.map(idea => (
                          <td key={idea.id}>{idea.marketAnalysis?.metrics.searchVolume}</td>
                        ))}
                      </tr>
                      <tr>
                        <td>Konkurrenz</td>
                        {comparableIdeas.map(idea => (
                          <td key={idea.id}>{idea.marketAnalysis?.metrics.competition}</td>
                        ))}
                      </tr>
                      <tr>
                        <td>Recherche-Fortschritt</td>
                        {comparableIdeas.map(idea => (
                          <td key={idea.id}>
                            {idea.marketAnalysis.evidencePercent === undefined ? 'Nicht dokumentiert' : `${idea.marketAnalysis.evidencePercent}% der Recherchemerkmale vorhanden`}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td>Fazit</td>
                        {comparableIdeas.map(idea => (
                          <td key={idea.id}>{idea.marketAnalysis?.verdict}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
            <footer className="workspace-footer">Keine automatische Websuche · Einschätzungen enthalten Annahmen.</footer>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
