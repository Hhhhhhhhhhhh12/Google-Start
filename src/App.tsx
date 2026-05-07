import { useState } from 'react'
import './App.css'
import { generateMarketAnalysis } from './lib/marketAnalysis'
import { deriveIdeasMock, type DerivedIdea } from './lib/aiMock'
import { scrapeGoogleMaps, scrapeSearchMetadata } from './lib/scraper'
import { generateReportMarkdown } from './lib/exportUtils'
import { calculateEvidencePercent, calculateEvidenceQuality } from './lib/scoring'
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

  // Configuration State
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [weights, setWeights] = useState({
    demand: 25,
    competition: 30,
    urgency: 20,
    profitability: 25
  })

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
        keywordPlannerChecked: !serperApiKey, // In simulation mode, we assume "checked" for demo purposes
        googleTrendsChecked: false,
        googleMapsChecked: !serperApiKey,
        reviewsChecked: false,
        cpcChecked: false,
      },
      weights,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    try {
      if (serperApiKey) {
        console.log('Starting Live Scan for:', ideaTitle, 'in', ideaRegion);
        const query = `${ideaTitle} ${ideaRegion}`.trim();
        const [mapsResults, searchMeta] = await Promise.all([
          scrapeGoogleMaps(query, serperApiKey).catch((e) => { console.error('Maps Error:', e); return []; }),
          scrapeSearchMetadata(ideaTitle, serperApiKey).catch((e) => { console.error('Search Error:', e); return { adCount: 0, resultCount: 0, organic: [] }; })
        ]);

        console.log('Scrape Results:', { maps: mapsResults.length, ads: searchMeta.adCount, results: searchMeta.resultCount });

        // Refined Heuristic: totalResults is informational, not commercial.
        // We lower the base volume and rely more on ads for the "floor".
        const estimatedVolume = Math.min(1500, Math.floor(searchMeta.resultCount / 10000));
        const adBonus = searchMeta.adCount > 0 ? 500 : 0;
        const finalEstimatedVolume = estimatedVolume + adBonus;

        tempIdea = {
          ...tempIdea,
          competitors: mapsResults.slice(0, 10),
          competitorCount: mapsResults.length,
          professionalCompetitorCount: Math.round(mapsResults.length * 0.4),
          commercialCompetition: Math.min(10, Math.max(1, searchMeta.adCount * 2)),
          keywordData: [{ term: ideaTitle, monthlyVolume: finalEstimatedVolume }],
          organicResults: searchMeta.organic,
          checklist: {
            ...tempIdea.checklist,
            googleMapsChecked: mapsResults.length > 0,
            cpcChecked: searchMeta.adCount > 0,
            keywordPlannerChecked: searchMeta.resultCount > 0
          }
        };

        const analysis = generateMarketAnalysis(tempIdea);
        
        // Enrich report with raw stats
        const finalReport = {
          ...analysis,
          metrics: {
            ...analysis.metrics,
            totalResults: searchMeta.resultCount
          }
        };
      console.log('Generated Analysis Score:', analysis.scoreAtGeneration);

      
      // Calculate evidence on the final state
      const evidencePercent = calculateEvidencePercent(tempIdea);
      const evidenceQuality = calculateEvidenceQuality(tempIdea);

        setReport({
          ...(finalReport || analysis),
          evidencePercent,
          evidenceQuality
        });
      } else {
        // Fallback or simulation delay
        await new Promise(r => setTimeout(r, 1500));
        const analysis = generateMarketAnalysis(tempIdea);
        setReport(analysis);
      }
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

  const handleExport = () => {
    if (!report) return;
    const md = generateReportMarkdown(ideaTitle, ideaRegion, report);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Analyse_${ideaTitle.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
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
        {!serperApiKey && (
          <div className="simulation-banner">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span><strong>Simulations-Modus:</strong> Trage oben einen Serper API Key ein für echte Live-Daten aus Google Maps & Suche.</span>
          </div>
        )}
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
              
              <div className="advanced-toggle">

                <button 
                  className="btn-text" 
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {showAdvanced ? '− Weniger Einstellungen' : '+ Erweiterte Gewichtung'}
                </button>
              </div>

              {showAdvanced && (
                <div className="advanced-panel fade-in">
                  <div className="weight-group">
                    <div className="weight-row">
                      <label>Markt-Nachfrage</label>
                      <input 
                        type="range" min="0" max="100" 
                        value={weights.demand} 
                        onChange={(e) => setWeights({...weights, demand: parseInt(e.target.value)})} 
                      />
                      <span className="weight-val">{weights.demand}%</span>
                    </div>
                    <div className="weight-row">
                      <label>Wettbewerb</label>
                      <input 
                        type="range" min="0" max="100" 
                        value={weights.competition} 
                        onChange={(e) => setWeights({...weights, competition: parseInt(e.target.value)})} 
                      />
                      <span className="weight-val">{weights.competition}%</span>
                    </div>
                    <div className="weight-row">
                      <label>Dringlichkeit</label>
                      <input 
                        type="range" min="0" max="100" 
                        value={weights.urgency} 
                        onChange={(e) => setWeights({...weights, urgency: parseInt(e.target.value)})} 
                      />
                      <span className="weight-val">{weights.urgency}%</span>
                    </div>
                    <div className="weight-row">
                      <label>Profitabilität</label>
                      <input 
                        type="range" min="0" max="100" 
                        value={weights.profitability} 
                        onChange={(e) => setWeights({...weights, profitability: parseInt(e.target.value)})} 
                      />
                      <span className="weight-val">{weights.profitability}%</span>
                    </div>
                    <p className="helper-text">Passe an, welche Faktoren für deine Entscheidung am wichtigsten sind.</p>
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
                    <strong>{report.scoreAtGeneration || report.demandScore}</strong>
                    <span>Score</span>
                  </div>
                  <div className="report-intro">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h2>Analyse-Ergebnis</h2>
                      {serperApiKey && <span className="badge-live">LIVE-DATEN SCAN</span>}
                    </div>
                    <p className="summary-text">{report.verdict || report.summary}</p>
                    
                    {report.evidencePercent !== undefined && (
                      <div className="evidence-progress-container">
                        <div className="evidence-progress-header">
                          <span className="evidence-label">DATEN-QUALITÄT</span>
                          <span className={`quality-badge ${report.evidenceQuality}`}>
                            {report.evidenceQuality === 'strong' ? 'Stark' : 
                             report.evidenceQuality === 'usable' ? 'Verwendbar' : 
                             report.evidenceQuality === 'weak' ? 'Schwach' : 'Unvollständig'}
                          </span>
                        </div>
                        <div className="progress-bar-bg">
                          <div 
                            className={`progress-bar-fill ${report.evidenceQuality}`} 
                            style={{ width: `${report.evidencePercent}%` }}
                          ></div>
                        </div>
                        <p className="helper-text">
                          {report.evidencePercent}% der Validierungsschritte abgeschlossen.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="evidence-details">
                  <h4>Validierungs-Status</h4>
                  <div className="evidence-grid">
                    <div className={`evidence-item ${report.checklist?.keywordPlannerChecked && report.metrics.searchVolume !== 'Unbekannt' ? 'valid' : 'missing'}`}>
                      <span className="status-icon">{report.checklist?.keywordPlannerChecked && report.metrics.searchVolume !== 'Unbekannt' ? '✓' : '○'}</span>
                      <span className="status-label">Keyword Volumen</span>
                    </div>
                    <div className={`evidence-item ${report.checklist?.googleMapsChecked && report.metrics.competition !== 'Unbekannt' ? 'valid' : 'missing'}`}>
                      <span className="status-icon">{report.checklist?.googleMapsChecked && report.metrics.competition !== 'Unbekannt' ? '✓' : '○'}</span>
                      <span className="status-label">Lokale Konkurrenz</span>
                    </div>
                    <div className={`evidence-item ${report.checklist?.googleTrendsChecked ? 'valid' : 'missing'}`}>
                      <span className="status-icon">{report.checklist?.googleTrendsChecked ? '✓' : '○'}</span>
                      <span className="status-label">Trend Stabilität</span>
                    </div>
                    <div className={`evidence-item ${report.checklist?.reviewsChecked ? 'valid' : 'missing'}`}>
                      <span className="status-icon">{report.checklist?.reviewsChecked ? '✓' : '○'}</span>
                      <span className="status-label">Kunden-Feedback</span>
                    </div>
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
                    <span className="metric-value">{report.metrics.totalResults?.toLocaleString('de-DE') || '---'}</span>
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
                        <ul>{report.swot.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
                      </div>
                      <div className="swot-item weaknesses">
                        <strong>Schwächen</strong>
                        <ul>{report.swot.weaknesses.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
                      </div>
                      <div className="swot-item opportunities">
                        <strong>Chancen</strong>
                        <ul>{report.swot.opportunities.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
                      </div>
                      <div className="swot-item threats">
                        <strong>Risiken</strong>
                        <ul>{report.swot.threats.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
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
                      {report.revenueModels.map((m: string, i: number) => <li key={i}>{m}</li>)}
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
                    {report.nextSteps.map((step: string, idx: number) => (
                      <div key={idx} className="step-item">
                        <span className="step-number">{idx + 1}</span>
                        <p>{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {report.organicEvidence && report.organicEvidence.length > 0 && (
                  <div className="evidence-section">
                    <h3>Hard Evidence (Top Google Ergebnisse)</h3>
                    <div className="organic-list">
                      {report.organicEvidence.map((item: any, i: number) => (
                        <div key={i} className="organic-item">
                          <a href={item.link} target="_blank" rel="noopener noreferrer" className="organic-title">
                            {item.title}
                          </a>
                          <p className="organic-snippet">{item.snippet}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="sources-section">
                  <h4>Daten-Herkunft</h4>
                  <ul>
                    {report.sources.map((source: string, idx: number) => (
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
                    <button className="btn-secondary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      <span>Bericht speichern</span>
                    </button>
                  </div>
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