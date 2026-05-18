import { useState } from 'react'
import './App.css'
import { generateMarketAnalysis } from './lib/marketAnalysis'
import { deriveIdeasMock, type DerivedIdea } from './lib/aiMock'
import { scrapeGoogleMaps, scrapeSearchMetadata } from './lib/scraper'
import { generateReportMarkdown } from './lib/exportUtils'
import { calculateEvidencePercent, calculateEvidenceQuality } from './lib/scoring'
import type { BusinessIdea, MarketAnalysis } from './types'

import { useMemo, useEffect } from 'react'
import { calculateIdeaScore } from './lib/scoring'
import { buildResearchQueries } from './lib/queryBuilder'
import { loadIdeas, saveIdeas } from './lib/storage'

type AppMode = 'home' | 'evaluate' | 'discover' | 'compare'

function App() {
  const [mode, setMode] = useState<AppMode>('home')
  const [ideas, setIdeas] = useState<BusinessIdea[]>([])
  const [activeIdeaId, setActiveIdeaId] = useState<string | null>(null)
  const [isPreparingResearch, setIsPreparingResearch] = useState(false)
  
  // Load ideas on mount
  useEffect(() => {
    const loaded = loadIdeas()
    setIdeas(loaded)
  }, [])

  // Save ideas when they change
  useEffect(() => {
    if (ideas.length > 0) {
      saveIdeas(ideas)
    }
  }, [ideas])

  const [serperApiKey, setSerperApiKey] = useState(
    localStorage.getItem('serper_api_key') || ''
  )

  const handleSaveApiKey = (val: string) => {
    setSerperApiKey(val)
    localStorage.setItem('serper_api_key', val)
  }

  // Evaluate State
  const [ideaTitle, setIdeaTitle] = useState('')
  const [ideaRegion, setIdeaRegion] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [report, setReport] = useState<(MarketAnalysis & {
    evidencePercent?: number
    evidenceQuality?: string
  }) | null>(null)

  // Derive State
  const [deriveSearchTerms, setDeriveSearchTerms] = useState('')
  const [deriveRegion, setDeriveRegion] = useState('')
  const [deriveInterests, setDeriveInterests] = useState('')
  const [isDeriving, setIsDeriving] = useState(false)
  const [derivedIdeas, setDerivedIdeas] = useState<DerivedIdea[] | null>(null)

  // Configuration State
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [weights, setWeights] = useState({
    demand: 25,
    competition: 30,
    urgency: 20,
    profitability: 25,
  })

  const handleAutoPopulate = (idea: DerivedIdea) => {
    setIdeaTitle(idea.title)
    setIdeaRegion(deriveRegion || 'Lokal')
    setMode('evaluate')
    setReport(null)
  }

  const buildBaseIdea = (): BusinessIdea => ({
    id: crypto.randomUUID(),
    title: ideaTitle,
    region: ideaRegion,
    targetAudience: targetAudience || 'Zielgruppe offen',
    keywords: [ideaTitle],
    keywordData: [],
    competitorCount: serperApiKey ? 0 : 5,
    professionalCompetitorCount: serperApiKey ? 0 : 2,
    competitors: [],
    complaintDensity: 6,
    urgency: 7,
    willingnessToPay: 6,
    commercialCompetition: 5,
    notes: '',
    painPoints: [],
    painPointEntries: [],
    trendDirection: 'stable',
    trendNotes: '',
    checklist: {
      keywordPlannerChecked: !serperApiKey,
      googleTrendsChecked: false,
      googleMapsChecked: !serperApiKey,
      reviewsChecked: false,
      cpcChecked: false,
    },
    weights,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  })

  const handleEvaluate = async () => {
    if (!ideaTitle) return
    setIsEvaluating(true)
    setReport(null)

    let idea = buildBaseIdea()

    try {
      if (serperApiKey) {
        const query = `${ideaTitle} ${ideaRegion}`.trim()
        const [mapsResults, searchMeta] = await Promise.all([
          scrapeGoogleMaps(query, serperApiKey).catch(e => {
            console.error('Maps Error:', e)
            return []
          }),
          scrapeSearchMetadata(ideaTitle, serperApiKey).catch(e => {
            console.error('Search Error:', e)
            return { adCount: 0, resultCount: 0, organic: [] }
          }),
        ])

        const estimatedVolume = Math.min(
          1500,
          Math.floor(searchMeta.resultCount / 10000)
        )
        const adBonus = searchMeta.adCount > 0 ? 500 : 0

        idea = {
          ...idea,
          competitors: mapsResults.slice(0, 10),
          competitorCount: mapsResults.length,
          professionalCompetitorCount: Math.round(mapsResults.length * 0.4),
          commercialCompetition: Math.min(
            10,
            Math.max(1, searchMeta.adCount * 2)
          ),
          keywordData: [
            { term: ideaTitle, monthlyVolume: estimatedVolume + adBonus },
          ],
          organicResults: searchMeta.organic,
          peopleAlsoAsk: searchMeta.peopleAlsoAsk,
          relatedSearches: searchMeta.relatedSearches,
          checklist: {
            ...idea.checklist,
            googleMapsChecked: mapsResults.length > 0,
            cpcChecked: searchMeta.adCount > 0,
            keywordPlannerChecked: searchMeta.resultCount > 0,
          },
        }

        const analysis = generateMarketAnalysis(idea)
        const evidencePercent = calculateEvidencePercent(idea)
        const evidenceQuality = calculateEvidenceQuality(idea)

        const finalReport = {
          ...analysis,
          metrics: {
            ...analysis.metrics,
            totalResults: searchMeta.resultCount,
          },
          evidencePercent,
          evidenceQuality,
        };
        
        setReport(finalReport);
        
        // Save to ideas list
        idea.marketAnalysis = finalReport;
        setIdeas(prev => {
          const existing = prev.find(i => i.title === idea.title && i.region === idea.region);
          if (existing) {
            return prev.map(i => i.id === existing.id ? { ...idea, id: existing.id } : i);
          }
          return [idea, ...prev];
        });
      } else {
        await new Promise(r => setTimeout(r, 1500))
        const analysis = generateMarketAnalysis(idea)
        setReport(analysis)
        
        // Save to ideas list
        idea.marketAnalysis = analysis;
        setIdeas(prev => {
          const existing = prev.find(i => i.title === idea.title && i.region === idea.region);
          if (existing) {
            return prev.map(i => i.id === existing.id ? { ...idea, id: existing.id } : i);
          }
          return [idea, ...prev];
        });
      }
    } catch (err) {
      console.error(err)
      alert('Es gab ein Problem beim Abrufen der Daten.')
    } finally {
      setIsEvaluating(false)
    }
  }

  const handleDerive = async () => {
    if (!deriveSearchTerms && !deriveInterests) return
    setIsDeriving(true)
    setDerivedIdeas(null)
    try {
      const combinedInput = `${deriveSearchTerms} ${deriveInterests}`.trim()
      const results = await deriveIdeasMock(combinedInput)
      setDerivedIdeas(results)
    } finally {
      setIsDeriving(false)
    }
  }

  const handleExport = () => {
    if (!report) return
    const md = generateReportMarkdown(ideaTitle, ideaRegion, report)
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Analyse_${ideaTitle.replace(/\s+/g, '_')}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="api-config">
          <input
            type="password"
            placeholder="Serper API Key..."
            value={serperApiKey}
            onChange={e => handleSaveApiKey(e.target.value)}
          />
        </div>
      </header>

      <main className="main-content">
        {!serperApiKey && (
          <div className="simulation-banner">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>
              <strong>Simulations-Modus:</strong> Trage oben einen Serper API
              Key ein für echte Live-Daten aus Google Maps &amp; Suche.
            </span>
          </div>
        )}

        <section className="hero-card">
          <p className="eyebrow">AI Business Validator</p>
          <h1>Ideen Scout</h1>
          <p className="intro">
            Gib deine Geschäftsidee ein und erhalte datenbasierte Fakten, oder
            finde neue Ideen aus aktuellen Suchanfragen.
          </p>
          <div className="tab-navigation">
            <button
              className={`tab-button ${mode === 'home' ? 'active' : ''}`}
              onClick={() => setMode('home')}
            >
              Übersicht
            </button>
            <button
              className={`tab-button ${mode === 'evaluate' ? 'active' : ''}`}
              onClick={() => setMode('evaluate')}
            >
              1. Idee validieren
            </button>
            <button
              className={`tab-button ${mode === 'discover' ? 'active' : ''}`}
              onClick={() => setMode('discover')}
            >
              2. Ideen ableiten
            </button>
            <button
              className={`tab-button ${mode === 'compare' ? 'active' : ''}`}
              onClick={() => setMode('compare')}
            >
              Vergleich
            </button>
          </div>
        </section>

        {mode === 'home' && (
          <div className="dashboard-grid single-col">
            <section className="panel form-panel">
              <h2>Gespeicherte Ideen</h2>
              {ideas.length === 0 ? (
                <p>Noch keine Ideen gespeichert. Starte mit der Validierung oder Ableitung!</p>
              ) : (
                <div className="ideas-list">
                  {ideas.map((idea) => (
                    <div key={idea.id} className="idea-card">
                      <div className="idea-card-header">
                        <h3>{idea.title}</h3>
                        <div style={{display: 'flex', gap: '8px'}}>
                          <button
                            className="btn-outline small"
                            onClick={() => {
                              setActiveIdeaId(idea.id);
                              setIdeaTitle(idea.title);
                              setIdeaRegion(idea.region);
                              setTargetAudience(idea.targetAudience);
                              if (idea.marketAnalysis) {
                                setReport(idea.marketAnalysis);
                              } else {
                                setReport(null);
                              }
                              setMode('evaluate');
                            }}
                          >
                            Öffnen
                          </button>
                          <button
                            className="btn-outline small"
                            style={{color: '#dc2626', borderColor: '#dc2626'}}
                            onClick={() => {
                              setIdeas(ideas.filter(i => i.id !== idea.id));
                              if (activeIdeaId === idea.id) setActiveIdeaId(null);
                            }}
                          >
                            Löschen
                          </button>
                        </div>
                      </div>
                      <p>
                        <strong>Score:</strong> {idea.marketAnalysis?.scoreAtGeneration || idea.weights?.demand || '---'} |{' '}
                        <strong>Region:</strong> {idea.region || 'Keine'}
                      </p>
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
                        <label>{label}</label>
                        <input
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
                      Passe an, welche Faktoren für deine Entscheidung am
                      wichtigsten sind.
                    </p>
                  </div>
                </div>
              )}

              <button
                className="btn-primary large"
                onClick={handleEvaluate}
                disabled={isEvaluating || !ideaTitle}
              >
                {isEvaluating ? 'Analysiere Daten...' : 'Zahlen & Fakten abrufen'}
              </button>
            </section>

            {report && (
              <section className="panel results-panel fade-in">
                <div className="report-header">
                  <div className="score-badge">
                    <strong>{report.scoreAtGeneration}</strong>
                    <span>Score</span>
                  </div>
                  <div className="report-intro">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h2>Analyse-Ergebnis</h2>
                      {serperApiKey && (
                        <span className="badge-live">LIVE-DATEN SCAN</span>
                      )}
                    </div>
                    <p className="summary-text">{report.verdict}</p>

                    {report.evidencePercent !== undefined && (
                      <div className="evidence-progress-container">
                        <div className="evidence-progress-header">
                          <span className="evidence-label">DATEN-QUALITÄT</span>
                          <span className={`quality-badge ${report.evidenceQuality}`}>
                            {report.evidenceQuality === 'strong'
                              ? 'Stark'
                              : report.evidenceQuality === 'usable'
                                ? 'Verwendbar'
                                : report.evidenceQuality === 'weak'
                                  ? 'Schwach'
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
                          {report.evidencePercent}% der Validierungsschritte
                          abgeschlossen.
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
                    <h3>Market Evidence (Google Ergebnisse)</h3>
                    <div className="organic-list">
                      {report.organicEvidence.map((item, i) => (
                        <div key={i} className="organic-item">
                          <a
                            href={item.link}
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
                      <li key={idx}>✓ {source}</li>
                    ))}
                  </ul>
                </div>

                <div className="action-footer">
                  <div className="trends-group">
                    <p className="trends-label">Google Trends Explorer:</p>
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
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="searchTerms">Suchtrends / Keywords</label>
                  <input
                    id="searchTerms"
                    value={deriveSearchTerms}
                    onChange={e => setDeriveSearchTerms(e.target.value)}
                    placeholder="z.B. Photovoltaik Reinigung"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="deriveRegion">Ziel-Region</label>
                  <input
                    id="deriveRegion"
                    value={deriveRegion}
                    onChange={e => setDeriveRegion(e.target.value)}
                    placeholder="z.B. Hamburg"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="interests">Interessen / Branchen</label>
                <textarea
                  id="interests"
                  rows={2}
                  value={deriveInterests}
                  onChange={e => setDeriveInterests(e.target.value)}
                  placeholder="z.B. Handwerk, Nachhaltigkeit, Senioren..."
                />
              </div>
              <button
                className="btn-primary large"
                onClick={handleDerive}
                disabled={isDeriving || (!deriveSearchTerms && !deriveInterests)}
              >
                {isDeriving ? 'Generiere Ideen...' : 'Ideen ableiten'}
              </button>
            </section>

            {derivedIdeas && (
              <section className="panel results-panel fade-in">
                <div className="panel-header">
                  <h2>Abgeleitete Geschäftsideen</h2>
                  <span className="badge-hypothesis">Hypothesen-Modus</span>
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
                          Validieren
                        </button>
                      </div>
                      <p>
                        <strong>Warum:</strong> {idea.reason}
                      </p>
                      <p>
                        <strong>Potenzial:</strong> {idea.potential}
                      </p>
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
              {ideas.filter(i => i.marketAnalysis).length < 2 ? (
                <p>Du benötigst mindestens 2 validierte Ideen für einen Vergleich.</p>
              ) : (
                <div className="compare-table-container" style={{overflowX: 'auto'}}>
                  <table className="compare-table" style={{width: '100%', textAlign: 'left', borderCollapse: 'collapse'}}>
                    <thead>
                      <tr>
                        <th style={{padding: '12px', borderBottom: '2px solid #e2e8f0'}}>Metrik</th>
                        {ideas.filter(i => i.marketAnalysis).map(idea => (
                          <th key={idea.id} style={{padding: '12px', borderBottom: '2px solid #e2e8f0'}}>{idea.title} <br/><small>{idea.region}</small></th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{padding: '12px', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold'}}>Score</td>
                        {ideas.filter(i => i.marketAnalysis).map(idea => (
                          <td key={idea.id} style={{padding: '12px', borderBottom: '1px solid #e2e8f0'}}>
                            <strong style={{color: '#1d4ed8'}}>{idea.marketAnalysis?.scoreAtGeneration}</strong>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td style={{padding: '12px', borderBottom: '1px solid #e2e8f0'}}>Suchvolumen</td>
                        {ideas.filter(i => i.marketAnalysis).map(idea => (
                          <td key={idea.id} style={{padding: '12px', borderBottom: '1px solid #e2e8f0'}}>{idea.marketAnalysis?.metrics.searchVolume}</td>
                        ))}
                      </tr>
                      <tr>
                        <td style={{padding: '12px', borderBottom: '1px solid #e2e8f0'}}>Konkurrenz</td>
                        {ideas.filter(i => i.marketAnalysis).map(idea => (
                          <td key={idea.id} style={{padding: '12px', borderBottom: '1px solid #e2e8f0'}}>{idea.marketAnalysis?.metrics.competition}</td>
                        ))}
                      </tr>
                      <tr>
                        <td style={{padding: '12px', borderBottom: '1px solid #e2e8f0'}}>Daten-Qualität</td>
                        {ideas.filter(i => i.marketAnalysis).map(idea => (
                          <td key={idea.id} style={{padding: '12px', borderBottom: '1px solid #e2e8f0'}}>
                            {idea.marketAnalysis?.evidencePercent}% ({idea.marketAnalysis?.evidenceQuality})
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td style={{padding: '12px', borderBottom: '1px solid #e2e8f0'}}>Fazit</td>
                        {ideas.filter(i => i.marketAnalysis).map(idea => (
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