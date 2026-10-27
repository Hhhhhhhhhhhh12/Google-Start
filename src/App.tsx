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
import { currentExternalResearch, projectResearch, safeSourceUrl, scopedResearch } from './lib/research'
import { buildResearchQueries } from './lib/queryBuilder'
import { deleteApiKey, loadApiKey, saveApiKey } from './lib/apiKey'
import { ResearchPanel } from './components/ResearchPanel'

type AppMode = 'home' | 'evaluate' | 'discover' | 'compare'

function App() {
  const [initialStore] = useState(loadIdeasWithStatus)
  const [ideas, setIdeas] = useState(initialStore.ideas)
  const [mode, setMode] = useState<AppMode>('home')
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
  const [showAdvanced, setShowAdvanced] = useState(false)
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

  function navigate(next: AppMode) {
    setMode(next)
    requestAnimationFrame(() => heading.current?.focus())
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
    setNotice('Änderungen noch nicht gespeichert. Die Einschätzung wird beim nächsten Prüfen neu erstellt.')
    setSaveError('')
  }

  function openIdea(idea: BusinessIdea) {
    if (draftDirty && !window.confirm('Ungespeicherte Änderungen an der aktuellen Idee verwerfen?')) return
    cancelResearch()
    setDraft({ ...idea, weights: { ...(idea.weights ?? DEFAULT_WEIGHTS) } })
    setKeywordsText(idea.keywords.join(', '))
    setReport(idea.marketAnalysis ? prepareReportForDisplay(idea.marketAnalysis) : null)
    setResearchErrors(idea.externalResearch?.warnings ?? [])
    setDraftDirty(false); setNotice(''); setSaveError(''); navigate('evaluate')
  }

  function startNewIdea(overrides: Partial<BusinessIdea> = {}) {
    if (draftDirty && !window.confirm('Ungespeicherte Änderungen an der aktuellen Idee verwerfen?')) return false
    cancelResearch()
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
    if (draft.id === idea.id) { cancelResearch(); setDraft(createIdea()); setKeywordsText(''); setDraftDirty(false); setReport(null) }
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
      <header className="app-header workflow-header">
        <button className="btn-text" onClick={() => navigate('home')}>Zur Sammlung ({ideas.length})</button>
        <details className="key-settings">
          <summary>Externe Recherche {serperApiKey ? '· Schlüssel aktiv' : '· optional'}</summary>
          <div className="key-settings-body">
            <p>Ein Schlüssel wird nur für eine ausdrücklich gestartete Serper-Abfrage verwendet. Standardmäßig gilt er nur für diese Browsersitzung.</p>
            <label htmlFor="serper-key">Serper-Schlüssel</label>
            <input id="serper-key" type="password" autoComplete="off" value={apiKeyDraft} onChange={event => setApiKeyDraft(event.target.value)} />
            <label className="checkbox-label"><input type="checkbox" checked={rememberKey} onChange={event => setRememberKey(event.target.checked)} />Auf diesem Gerät speichern (freiwillig)</label>
            <p className="helper-text">Bei Geräteablage kann JavaScript unter dieser lokalen Adresse den Schlüssel lesen. Löschen entfernt auch eine frühere Geräteablage.</p>
            <div className="button-row"><button className="btn-secondary" onClick={saveKey}>Schlüssel verwenden</button><button className="btn-outline" onClick={forgetKey}>Schlüssel löschen</button></div>
            {keyNotice && <p role="status" className="notice">{keyNotice}</p>}
          </div>
        </details>
      </header>

      <main className="main-content">
          <div className="simulation-banner">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>
              <strong>Recherchehilfe:</strong> Bewertungen und Vorschläge entstehen aus Regeln und Annahmen.
              {' '}{serperApiKey ? 'Ein Serper-Schlüssel ermöglicht ergänzende Such- und Maps-Abfragen. Er liefert kein monatliches Suchvolumen und keinen geprüften Trend.' : 'Ohne externe Abfrage werden keine aktuellen Marktdaten erhoben.'}
            </span>
          </div>

        {initialStore.error && <p role="alert" className="notice error">{initialStore.error}</p>}
        {saveError && <p role="alert" className="notice error">{saveError}</p>}
        {notice && <p role="status" className="notice">{notice}</p>}
        {deletedIdeas.length > 0 && <button className="btn-outline undo-button" onClick={undoDelete}>Letztes Löschen rückgängig machen</button>}
        <section className="hero-card">
          <p className="eyebrow">Regionale Geschäftsideen recherchieren</p>
          <h1 ref={heading} tabIndex={-1}>{mode === 'home' ? 'Ideen Scout' : mode === 'evaluate' ? 'Idee prüfen' : mode === 'discover' ? 'Ideen finden' : 'Ideen vergleichen'}</h1>
          <p className="intro">{mode === 'home' ? 'Wähle deinen Einstieg. Beobachtungen und Quellen helfen dir, regionale Nachfrage Schritt für Schritt einzuschätzen.' : mode === 'evaluate' ? 'Starte mit Idee und Region. Ergänze belegbare Beobachtungen, wenn du bereit bist.' : mode === 'discover' ? 'Entwickle Angebote aus deinen Beobachtungen für eine konkrete Region.' : 'Vergleiche gespeicherte Einschätzungen und ihre Datenbasis.'}</p>
          {mode === 'home' ? <div className="main-paths">
            <button className="main-path" onClick={() => navigate('evaluate')}><strong>Idee prüfen</strong><span>Eine Geschäftsidee eingeben und nachvollziehbar recherchieren.</span></button>
            <button className="main-path" onClick={() => navigate('discover')}><strong>Ideen finden</strong><span>Aus erfassten lokalen Beobachtungen Vorschläge entwickeln.</span></button>
            <button className="main-path" onClick={() => navigate('compare')}><strong>Ideen vergleichen</strong><span>Gespeicherte Ideen mit ihrer Datenbasis nebeneinander ansehen.</span></button>
          </div> : <nav className="tab-navigation" aria-label="Hauptwege">
            {([['evaluate', 'Idee prüfen'], ['discover', 'Ideen finden'], ['compare', 'Ideen vergleichen']] as const).map(([value, label]) => <button key={value} className={`tab-button ${mode === value ? 'active' : ''}`} aria-current={mode === value ? 'page' : undefined} onClick={() => navigate(value)}>{label}</button>)}
          </nav>}
        </section>

        {mode === 'home' && (
          <div className="dashboard-grid single-col">
            <section className="panel form-panel">
              <h2>Gespeicherte Ideen</h2>
              {ideas.length === 0 ? (
                <p>Noch keine Ideen gespeichert. Wähle oben „Idee prüfen“ oder „Ideen finden“.</p>
              ) : (
                <div className="ideas-list">
                  {ideas.map((idea) => (
                    <div key={idea.id} className="idea-card">
                      <div className="idea-card-header">
                        <h3>{idea.title}</h3>
                        <div style={{display: 'flex', gap: '8px'}}>
                          <button
                            className="btn-outline small"
                            onClick={() => openIdea(idea)}
                          >
                            Öffnen
                          </button>
                          <button
                            className="btn-outline small"
                            style={{color: '#dc2626', borderColor: '#dc2626'}}
                            onClick={() => removeIdea(idea)}
                            disabled={!!initialStore.error}
                          >
                            Löschen
                          </button>
                        </div>
                      </div>
                      <p>
                        <strong>Orientierungs-Score:</strong> {idea.marketAnalysis?.scoreAtGeneration ?? '---'} |{' '}
                        <strong>Region:</strong> {idea.region || 'Keine'}
                      </p>
                      {idea.marketAnalysis && <p className="helper-text">{describeDataBasis(idea.marketAnalysis)}</p>}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {mode === 'evaluate' && (
          <div className="dashboard-grid single-col">
            <section className="panel form-panel">
              <div className="section-heading"><h2>{isSaved ? 'Gespeicherte Idee bearbeiten' : 'Deine Idee'}</h2><button className="btn-text" onClick={() => startNewIdea()}>Neue Idee</button></div>
              {draftDirty && <p className="helper-text">Ungespeicherte Änderungen</p>}
              <fieldset disabled={isEvaluating} className="editor-fields">

              <div className="form-group">
                <label htmlFor="title">Deine Geschäftsidee</label>
                <input
                  id="title"
                  value={ideaTitle}
                  onChange={e => setIdeaTitle(e.target.value)}
                  placeholder="z.B. Mobiler Fahrrad-Reparaturservice"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="region">Region (optional)</label>
                  <input
                    id="region"
                    value={ideaRegion}
                    onChange={e => setIdeaRegion(e.target.value)}
                    placeholder="z.B. Berlin Kreuzberg"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="targetAudience">Zielgruppe (optional)</label>
                  <input
                    id="targetAudience"
                    value={targetAudience}
                    onChange={e => setTargetAudience(e.target.value)}
                    placeholder="z.B. Senioren, Pendler..."
                  />
                </div>
              </div>

              <details className="draft-details">
                <summary>Suchbegriffe und Notizen</summary>
                <div className="form-group"><label htmlFor="idea-keywords">Suchbegriffe (durch Komma getrennt)</label><textarea id="idea-keywords" rows={2} value={keywordsText} onChange={event => { setKeywordsText(event.target.value); changeDraft({ keywords: event.target.value.split(',').map(term => term.trim()).filter(Boolean) }) }} /></div>
                <div className="form-group"><label htmlFor="idea-notes">Notizen zur Idee</label><textarea id="idea-notes" rows={3} value={draft.notes} onChange={event => changeDraft({ notes: event.target.value })} /></div>
              </details>
              <ResearchPanel key={draft.id} region={draft.region} entries={draft.researchEntries ?? []}
                onAdd={entry => changeDraft({ researchEntries: [...(draft.researchEntries ?? []), entry] })}
                onRemove={id => changeDraft({ researchEntries: draft.researchEntries?.filter(entry => entry.id !== id) })}
                saveHint="Beobachtung vorgemerkt. Mit Entwurf speichern oder Prüfen und speichern sichern." />
              <details className="research-links"><summary>Recherchelinks manuell öffnen</summary>
                <p className="helper-text">Die Links öffnen externe Seiten erst nach deinem Klick. Quellen und Ergebnisse anschließend oben als Beobachtung erfassen.</p>
                {(['google', 'maps', 'trends', 'pain-point'] as const).map(category => <details key={category}>
                  <summary>{{ google: 'Google-Suche', maps: 'Lokale Anbieter auf Maps', trends: 'Google Trends', 'pain-point': 'Kundenprobleme recherchieren' }[category]}</summary>
                  <ul>{researchQueries.filter(query => query.category === category).map((query, index) => <li key={`${query.url}-${index}`}><a href={query.url} target="_blank" rel="noopener noreferrer">{query.label}</a></li>)}</ul>
                </details>)}
              </details>
              <div className="advanced-toggle">
                <button
                  className="btn-text"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {showAdvanced
                    ? '− Weniger Einstellungen'
                    : '+ Erweiterte Gewichtung'}
                </button>
              </div>

              {showAdvanced && (
                <div className="advanced-panel fade-in">
                  <div className="weight-group">
                    {(
                      [
                        ['demand', 'Markt-Nachfrage'],
                        ['competition', 'Wettbewerb'],
                        ['urgency', 'Dringlichkeit'],
                        ['profitability', 'Profitabilität'],
                      ] as const
                    ).map(([key, label]) => (
                      <div className="weight-row" key={key}>
                        <label htmlFor={`weight-${key}`}>{label}</label>
                        <input
                          id={`weight-${key}`}
                          type="range"
                          min="0"
                          max="100"
                          value={weights[key]}
                          onChange={e =>
                            setWeights({
                              ...weights,
                              [key]: parseInt(e.target.value),
                            })
                          }
                        />
                        <span className="weight-val">{weights[key]}%</span>
                      </div>
                    ))}
                    <p className="helper-text">
                      Lege fest, welche Faktoren dir wichtiger sind. Die Gewichte werden für die Berechnung ins Verhältnis gesetzt.
                    </p>
                  </div>
                </div>
              )}

              <div className="editor-actions">
                <button className="btn-secondary" onClick={() => persistDraft(draft)} disabled={!draft.title.trim() || !!initialStore.error}>Entwurf speichern</button>
                <button className="btn-primary" onClick={() => handleEvaluate()} disabled={!draft.title.trim() || !!initialStore.error}>{isEvaluating ? 'Einschätzung wird erstellt…' : 'Prüfen und speichern'}</button>
              </div>
              <details className="external-action"><summary>Mit externer Recherche ergänzen</summary>
                <p>Diese freiwillige Abfrage sendet Titel und Region an Serper für Google-Suche und Maps. Dafür können Serper-Credits anfallen. Monatliches Suchvolumen wird dabei nicht ermittelt.</p>
                <button className="btn-outline" disabled={!serperApiKey || !draft.title.trim() || !!initialStore.error} onClick={() => handleEvaluate(true)}>Such- und Maps-Abfrage starten</button>
                {!serperApiKey && <p className="helper-text">Den Schlüssel kannst du oben unter „Externe Recherche“ für diese Sitzung hinterlegen.</p>}
              </details>
              </fieldset>
              {isEvaluating && <button className="btn-text" onClick={cancelResearch}>Recherche abbrechen</button>}
              {displayedResearchErrors.length > 0 && <div role="alert" className="notice error"><strong>Recherche nur teilweise oder nicht abgeschlossen</strong><ul>{displayedResearchErrors.map(error => <li key={error}>{error}</li>)}</ul><p>Manuelle Angaben und der bisherige Stand bleiben erhalten. Eine weitere Abfrage startest du selbst.</p></div>}
            </section>

            {report && (
              <section className="panel results-panel fade-in">
                <div className="report-header">
                  <div className="score-badge">
                    <strong>{report.scoreAtGeneration}</strong>
                    <span>Orientierung</span>
                  </div>
                  <div className="report-intro">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h2>Analyse-Ergebnis</h2>
                      <span className="badge-hypothesis">{describeDataBasis(report)}</span>
                    </div>
                    <p className="helper-text">Einschätzung vom {new Date(report.generatedAt).toLocaleString('de-DE')}</p>
                    <p className="summary-text">{report.verdict}</p>
                    <p className="helper-text">Score, SWOT, Zielgruppe und Strategie sind regelbasierte Arbeitshypothesen. Sie belegen weder regionale Nachfrage noch Zahlungsbereitschaft.</p>

                    {report.evidencePercent !== undefined && (
                      <div className="evidence-progress-container">
                        <div className="evidence-progress-header">
                          <span className="evidence-label">RECHERCHE-FORTSCHRITT</span>
                          <span className={`quality-badge ${report.evidenceQuality}`}>
                            {report.evidenceQuality === 'strong'
                              ? 'Weitgehend erfasst'
                              : report.evidenceQuality === 'usable'
                                ? 'Teilweise erfasst'
                                : report.evidenceQuality === 'weak'
                                  ? 'Wenige Angaben'
                                  : 'Unvollständig'}
                          </span>
                        </div>
                        <div className="progress-bar-bg">
                          <div
                            className={`progress-bar-fill ${report.evidenceQuality}`}
                            style={{ width: `${report.evidencePercent}%` }}
                          />
                        </div>
                        <p className="helper-text">
                          {report.evidencePercent}% der erfassten Recherchemerkmale vorhanden.
                          Die Vollständigkeit bestätigt nicht die Verlässlichkeit der Angaben.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="evidence-details">
                  <h4>Validierungs-Status</h4>
                  <div className="evidence-grid">
                    {[
                      ['keywordPlannerChecked', 'Keyword Volumen'],
                      ['googleMapsChecked', 'Lokale Konkurrenz'],
                      ['googleTrendsChecked', 'Trend Stabilität'],
                      ['reviewsChecked', 'Kunden-Feedback'],
                    ].map(([key, label]) => {
                      const checked =
                        report.checklist?.[key as keyof typeof report.checklist]
                      return (
                        <div
                          key={key}
                          className={`evidence-item ${checked ? 'valid' : 'missing'}`}
                        >
                          <span className="status-icon">{checked ? '✓' : '○'}</span>
                          <span className="status-label">{label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="metrics-grid">
                  <div className="metric-card">
                    <span className="metric-label">Konkurrenz</span>
                    <span className="metric-value">{report.metrics.competition}</span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-label">Suchvolumen</span>
                    <span className="metric-value">{report.metrics.searchVolume}</span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-label">Trend</span>
                    <span className="metric-value">{report.metrics.trend}</span>
                  </div>
                  <div className="metric-card highlight">
                    <span className="metric-label">Google Treffer</span>
                    <span className="metric-value">
                      {report.metrics.totalResults
                        ? report.metrics.totalResults.toLocaleString('de-DE')
                        : '---'}
                    </span>
                  </div>
                  <div className="metric-card">
                    <span className="metric-label">CPC (Ads)</span>
                    <span className="metric-value">{report.metrics.cpc}</span>
                  </div>
                </div>

                <div className="report-grid">
                  <div className="report-column">
                    <h3>SWOT Analyse</h3>
                    <div className="swot-grid">
                      {(
                        [
                          ['strengths', 'Stärken', 'strengths'],
                          ['weaknesses', 'Schwächen', 'weaknesses'],
                          ['opportunities', 'Chancen', 'opportunities'],
                          ['threats', 'Risiken', 'threats'],
                        ] as const
                      ).map(([key, label, cls]) => (
                        <div key={key} className={`swot-item ${cls}`}>
                          <strong>{label}</strong>
                          <ul>
                            {report.swot[key].map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="report-column">
                    <h3>Target Persona</h3>
                    <div className="persona-card">
                      <h4>{report.persona.name}</h4>
                      <p>
                        <strong>Pains:</strong>{' '}
                        {report.persona.painPoints.join(', ')}
                      </p>
                      <p>
                        <strong>Zahlungsbereitschaft:</strong>{' '}
                        {report.persona.willingnessToPay}
                      </p>
                    </div>

                    <h3>Erlös-Modelle</h3>
                    <ul className="revenue-list">
                      {report.revenueModels.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="strategy-box">
                  <h3>Go-to-Market Strategie</h3>
                  {/* FIX: MarketAnalysis hat strategyRecommendation, nicht strategy */}
                  <p>{report.strategyRecommendation}</p>
                </div>

                <div className="next-steps-container">
                  <h3>Nächste Schritte</h3>
                  <div className="steps-list">
                    {report.nextSteps.map((step, idx) => (
                      <div key={idx} className="step-item">
                        <span className="step-number">{idx + 1}</span>
                        <p>{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {report.organicEvidence && report.organicEvidence.length > 0 && (
                  <div className="evidence-section">
                    <h3>{report.dataBasis === 'unverified' ? 'Gespeicherte Suchergebnisse (Herkunft ungeklärt)' : 'Erfasste Suchergebnisse'}</h3>
                    <div className="organic-list">
                      {report.organicEvidence.map((item, i) => (
                        <div key={i} className="organic-item">
                          <a
                            href={safeSourceUrl(item.link)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="organic-title"
                          >
                            {item.title}
                          </a>
                          <p className="organic-snippet">{item.snippet}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {((report.peopleAlsoAsk && report.peopleAlsoAsk.length > 0) || 
                  (report.relatedSearches && report.relatedSearches.length > 0)) && (
                  <div className="insights-grid">
                    {report.peopleAlsoAsk && report.peopleAlsoAsk.length > 0 && (
                      <div className="insight-column">
                        <h3>Kunden-Fragen (People Also Ask)</h3>
                        <ul className="insight-list">
                          {report.peopleAlsoAsk.map((q, i) => (
                            <li key={i} className="insight-item question">{q}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {report.relatedSearches && report.relatedSearches.length > 0 && (
                      <div className="insight-column">
                        <h3>Verwandte Segmente</h3>
                        <div className="insight-chips">
                          {report.relatedSearches.map((r, i) => (
                            <span key={i} className="insight-chip">{r}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="sources-section">
                  <h4>Daten-Herkunft</h4>
                  <ul>
                    {report.sources.map((source, idx) => (
                      <li key={idx}>{source}</li>
                    ))}
                  </ul>
                </div>

                <div className="action-footer">
                  <div className="trends-group">
                    <p className="trends-label">Google Trends manuell öffnen:</p>
                    <div className="trends-links">
                      <a
                        href={`https://trends.google.com/trends/explore?q=${encodeURIComponent(ideaTitle)}&geo=DE`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="trends-link-chip"
                      >
                        Spezifisch: "{ideaTitle}"
                      </a>
                      <a
                        href={`https://trends.google.com/trends/explore?q=${encodeURIComponent(ideaTitle.split(' ').slice(0, 2).join(' '))}&geo=DE`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="trends-link-chip secondary"
                      >
                        Allgemeiner: "{ideaTitle.split(' ').slice(0, 2).join(' ')}"
                      </a>
                    </div>
                  </div>
                  <div className="footer-btns">
                    <button
                      className="btn-secondary"
                      onClick={handleExport}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      <span>Bericht speichern</span>
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}

        {mode === 'discover' && (
          <div className="dashboard-grid single-col">
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
        )}
        {mode === 'compare' && (
          <div className="dashboard-grid single-col">
            <section className="panel results-panel fade-in">
              <div className="panel-header">
                <h2>Ideen-Vergleich</h2>
              </div>
              {comparableIdeas.length < 2 ? (
                <p>Du benötigst mindestens 2 gespeicherte Berichte für einen Vergleich.</p>
              ) : (
                <div className="compare-table-container" style={{overflowX: 'auto'}}>
                  <table className="compare-table" style={{width: '100%', textAlign: 'left', borderCollapse: 'collapse'}}>
                    <thead>
                      <tr>
                        <th style={{padding: '12px', borderBottom: '2px solid #e2e8f0'}}>Metrik</th>
                        {comparableIdeas.map(idea => (
                          <th key={idea.id} style={{padding: '12px', borderBottom: '2px solid #e2e8f0'}}>{idea.title} {!idea.title.toLocaleLowerCase('de-DE').includes(idea.region.toLocaleLowerCase('de-DE')) && <><br/><small>{idea.region}</small></>}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{padding: '12px', borderBottom: '1px solid #e2e8f0'}}>Datenbasis</td>
                        {comparableIdeas.map(idea => (
                          <td key={idea.id} style={{padding: '12px', borderBottom: '1px solid #e2e8f0'}}>{describeDataBasis(idea.marketAnalysis)}</td>
                        ))}
                      </tr>
                      <tr>
                        <td style={{padding: '12px', borderBottom: '1px solid #e2e8f0'}}>Passende Beobachtungen</td>
                        {comparableIdeas.map(idea => <td key={idea.id} style={{padding: '12px', borderBottom: '1px solid #e2e8f0'}}>{idea.marketAnalysis.researchEntries?.length ?? 'Nicht dokumentiert'}</td>)}
                      </tr>
                      <tr>
                        <td style={{padding: '12px', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold'}}>Orientierungs-Score</td>
                        {comparableIdeas.map(idea => (
                          <td key={idea.id} style={{padding: '12px', borderBottom: '1px solid #e2e8f0'}}>
                            <strong style={{color: '#1d4ed8'}}>{idea.marketAnalysis?.scoreAtGeneration}</strong>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td style={{padding: '12px', borderBottom: '1px solid #e2e8f0'}}>Suchvolumen</td>
                        {comparableIdeas.map(idea => (
                          <td key={idea.id} style={{padding: '12px', borderBottom: '1px solid #e2e8f0'}}>{idea.marketAnalysis?.metrics.searchVolume}</td>
                        ))}
                      </tr>
                      <tr>
                        <td style={{padding: '12px', borderBottom: '1px solid #e2e8f0'}}>Konkurrenz</td>
                        {comparableIdeas.map(idea => (
                          <td key={idea.id} style={{padding: '12px', borderBottom: '1px solid #e2e8f0'}}>{idea.marketAnalysis?.metrics.competition}</td>
                        ))}
                      </tr>
                      <tr>
                        <td style={{padding: '12px', borderBottom: '1px solid #e2e8f0'}}>Recherche-Fortschritt</td>
                        {comparableIdeas.map(idea => (
                          <td key={idea.id} style={{padding: '12px', borderBottom: '1px solid #e2e8f0'}}>
                            {idea.marketAnalysis.evidencePercent === undefined ? 'Nicht dokumentiert' : `${idea.marketAnalysis.evidencePercent}% der Recherchemerkmale vorhanden`}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td style={{padding: '12px', borderBottom: '1px solid #e2e8f0'}}>Fazit</td>
                        {comparableIdeas.map(idea => (
                          <td key={idea.id} style={{padding: '12px', borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem'}}>{idea.marketAnalysis?.verdict}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
