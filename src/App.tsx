import { useState } from 'react'
import './App.css'
import { generateMarketAnalysis } from './lib/marketAnalysis'
import { deriveIdeasMock, type DerivedIdea } from './lib/aiMock'
import { scrapeGoogleMaps, scrapeSearchMetadata } from './lib/scraper'
import type { BusinessIdea } from './types'

type AppMode = 'evaluate' | 'derive';

function App() {
  const [mode, setMode] = useState<AppMode>('evaluate')
  
  const [serperApiKey, setSerperApiKey] = useState(localStorage.getItem('serper_api_key') || '')
  
  const handleSaveApiKey = (val: string) => {
    setSerperApiKey(val)
    localStorage.setItem('serper_api_key', val)
  }

  // Evaluate State
  const [ideaTitle, setIdeaTitle] = useState('')
  const [ideaRegion, setIdeaRegion] = useState('')
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [report, setReport] = useState<any | null>(null)

  // Derive State
  const [deriveSearchTerms, setDeriveSearchTerms] = useState('')
  const [deriveRegion, setDeriveRegion] = useState('')
  const [deriveInterests, setDeriveInterests] = useState('')
  const [isDeriving, setIsDeriving] = useState(false)
  const [derivedIdeas, setDerivedIdeas] = useState<DerivedIdea[] | null>(null)

  const handleSaveApiKey = (val: string) => {
    setSerperApiKey(val)
    localStorage.setItem('serper_api_key', val)
  }

  const handleAutoPopulate = (idea: DerivedIdea) => {
    setIdeaTitle(idea.title);
    setIdeaRegion(deriveRegion || 'Lokal');
    setMode('evaluate');
    setReport(null);
  }

  const handleEvaluate = async () => {
    if (!ideaTitle) return;
    setIsEvaluating(true);
    setReport(null);
    
    // Create a temporary BusinessIdea object for the analysis engine
    let tempIdea: BusinessIdea = {
      id: crypto.randomUUID(),
      title: ideaTitle,
      region: ideaRegion,
      targetAudience: 'Zielgruppe offen',
      keywords: [ideaTitle],
      keywordData: [],
      competitorCount: 0,
      professionalCompetitorCount: 0,
      competitors: [],
      complaintDensity: 5,
      urgency: 5,
      willingnessToPay: 5,
      commercialCompetition: 5,
      notes: '',
      painPoints: [],
      painPointEntries: [],
      trendDirection: 'stable',
      trendNotes: '',
      checklist: {
        keywordPlannerChecked: false,
        googleTrendsChecked: false,
        googleMapsChecked: false,
        reviewsChecked: false,
        cpcChecked: false,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    try {
      if (serperApiKey) {
        // Real-time Data Power!
        const query = `${ideaTitle} ${ideaRegion}`.trim();
        const [mapsResults, searchMeta] = await Promise.all([
          scrapeGoogleMaps(query, serperApiKey).catch(() => []),
          scrapeSearchMetadata(ideaTitle, serperApiKey).catch(() => ({ adCount: 0, totalResults: 0 }))
        ]);

        tempIdea = {
          ...tempIdea,
          competitors: mapsResults.slice(0, 5),
          competitorCount: mapsResults.length,
          professionalCompetitorCount: Math.round(mapsResults.length * 0.3), // Heuristic
          commercialCompetition: Math.min(10, Math.max(1, searchMeta.adCount * 3)),
          checklist: {
            ...tempIdea.checklist,
            googleMapsChecked: mapsResults.length > 0,
            cpcChecked: searchMeta.adCount > 0,
          }
        };
      } else {
        // Fallback or simulation delay
        await new Promise(r => setTimeout(r, 1500));
      }

      const analysis = generateMarketAnalysis(tempIdea);
      setReport(analysis);
    } catch (err) {
      console.error(err);
      alert('Es gab ein Problem beim Abrufen der Daten.');
    } finally {
      setIsEvaluating(false);
    }
  }



  const handleDerive = async () => {
    if (!deriveSearchTerms && !deriveInterests) return;
    setIsDeriving(true);
    setDerivedIdeas(null);
    try {
      // We'll use a combination of terms for the mock
      const combinedInput = `${deriveSearchTerms} ${deriveInterests}`.trim();
      const results = await deriveIdeasMock(combinedInput);
      setDerivedIdeas(results);
    } finally {
      setIsDeriving(false);
    }
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="api-config">
          <input 
            type="password" 
            placeholder="Serper API Key..." 
            value={serperApiKey}
            onChange={(e) => handleSaveApiKey(e.target.value)}
          />
        </div>
      </header>
      <main className="main-content">
        <section className="hero-card">
          <p className="eyebrow">AI Business Validator</p>
          <h1>Ideen Scout</h1>
          <p className="intro">
            Gib deine Geschäftsidee ein und erhalte datenbasierte Fakten, oder finde neue Ideen aus aktuellen Suchanfragen.
          </p>
          
          <div className="tab-navigation">
            <button 
              className={`tab-button ${mode === 'evaluate' ? 'active' : ''}`}
              onClick={() => setMode('evaluate')}
            >
              1. Idee validieren
            </button>
            <button 
              className={`tab-button ${mode === 'derive' ? 'active' : ''}`}
              onClick={() => setMode('derive')}
            >
              2. Ideen ableiten
            </button>
          </div>
        </section>

        {mode === 'evaluate' && (
          <div className="dashboard-grid single-col">
            <section className="panel form-panel">
              <div className="form-group">
                <label htmlFor="title">Deine Geschäftsidee</label>
                <input
                  id="title"
                  value={ideaTitle}
                  onChange={(e) => setIdeaTitle(e.target.value)}
                  placeholder="z.B. Mobiler Fahrrad-Reparaturservice"
                />
              </div>
              <div className="form-group">
                <label htmlFor="region">Region (optional)</label>
                <input
                  id="region"
                  value={ideaRegion}
                  onChange={(e) => setIdeaRegion(e.target.value)}
                  placeholder="z.B. Berlin Kreuzberg"
                />
              </div>
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
                    <strong>{report.scoreAtGeneration || report.demandScore}</strong>
                    <span>Score</span>
                  </div>
                  <div className="report-intro">
                    <h2>Analyse-Ergebnis</h2>
                    <p className="summary-text">{report.verdict || report.summary}</p>
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
                  <div className="metric-card">
                    <span className="metric-label">CPC (Ads)</span>
                    <span className="metric-value">{report.metrics.cpc}</span>
                  </div>
                </div>

                <div className="report-grid">
                  <div className="report-column">
                    <h3>SWOT Analyse</h3>
                    <div className="swot-grid">
                      <div className="swot-item strengths">
                        <strong>Stärken</strong>
                        <ul>{report.swot.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
                      </div>
                      <div className="swot-item weaknesses">
                        <strong>Schwächen</strong>
                        <ul>{report.swot.weaknesses.map((s, i) => <li key={i}>{s}</li>)}</ul>
                      </div>
                      <div className="swot-item opportunities">
                        <strong>Chancen</strong>
                        <ul>{report.swot.opportunities.map((s, i) => <li key={i}>{s}</li>)}</ul>
                      </div>
                      <div className="swot-item threats">
                        <strong>Risiken</strong>
                        <ul>{report.swot.threats.map((s, i) => <li key={i}>{s}</li>)}</ul>
                      </div>
                    </div>
                  </div>

                  <div className="report-column">
                    <h3>Target Persona</h3>
                    <div className="persona-card">
                      <h4>{report.persona.name}</h4>
                      <p><strong>Pains:</strong> {report.persona.painPoints.join(', ')}</p>
                      <p><strong>Zahlungsbereitschaft:</strong> {report.persona.willingnessToPay}</p>
                    </div>

                    <h3>Erlös-Modelle</h3>
                    <ul className="revenue-list">
                      {report.revenueModels.map((m, i) => <li key={i}>{m}</li>)}
                    </ul>
                  </div>
                </div>

                <div className="strategy-box">
                  <h3>Go-to-Market Strategie</h3>
                  <p>{report.strategy}</p>
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

                <div className="sources-section">
                  <h4>Belegte Quellen</h4>
                  <ul>
                    {report.sources.map((source, idx) => (
                      <li key={idx}>✓ {source}</li>
                    ))}
                  </ul>
                </div>

                <div className="action-footer">
                  <a 
                    href={`https://trends.google.com/trends/explore?q=${encodeURIComponent(ideaTitle)}&geo=DE`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-secondary details-btn"
                  >
                    <span>Details & Trends</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                  </a>
                </div>
              </section>
            )}
          </div>
        )}

        {mode === 'derive' && (
          <div className="dashboard-grid single-col">
            <section className="panel form-panel">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="searchTerms">Suchtrends / Keywords</label>
                  <input
                    id="searchTerms"
                    value={deriveSearchTerms}
                    onChange={(e) => setDeriveSearchTerms(e.target.value)}
                    placeholder="z.B. Photovoltaik Reinigung"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="deriveRegion">Ziel-Region</label>
                  <input
                    id="deriveRegion"
                    value={deriveRegion}
                    onChange={(e) => setDeriveRegion(e.target.value)}
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
                  onChange={(e) => setDeriveInterests(e.target.value)}
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
                      <p><strong>Warum:</strong> {idea.reason}</p>
                      <p><strong>Potenzial:</strong> {idea.potential}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App