import { useMemo } from 'react'
import type { BusinessIdea, MarketAnalysis } from '../types'
import { getImprovementSuggestions } from '../lib/improvementEngine'
import ScoreBreakdown from './ScoreBreakdown'

type ReportType = (MarketAnalysis & { evidencePercent?: number; evidenceQuality?: string }) | null

interface EvaluateViewProps {
  ideaTitle: string
  setIdeaTitle: (v: string) => void
  ideaRegion: string
  setIdeaRegion: (v: string) => void
  targetAudience: string
  setTargetAudience: (v: string) => void
  isEvaluating: boolean
  report: ReportType
  serperApiKey: string
  showAdvanced: boolean
  setShowAdvanced: (v: boolean) => void
  weights: { demand: number; competition: number; urgency: number; profitability: number }
  setWeights: (v: { demand: number; competition: number; urgency: number; profitability: number }) => void
  onEvaluate: () => void
  onExport: () => void
  ideas: BusinessIdea[]
  evaluationError: string | null
  onClearError: () => void
}

export default function EvaluateView({
  ideaTitle,
  setIdeaTitle,
  ideaRegion,
  setIdeaRegion,
  targetAudience,
  setTargetAudience,
  isEvaluating,
  report,
  serperApiKey,
  showAdvanced,
  setShowAdvanced,
  weights,
  setWeights,
  onEvaluate,
  onExport,
  ideas,
  evaluationError,
  onClearError,
}: EvaluateViewProps) {
  const evaluatedIdea = useMemo(() => {
    if (!report) return null
    return ideas.find(i => i.title === ideaTitle && i.region === ideaRegion) ?? null
  }, [report, ideas, ideaTitle, ideaRegion])

  const improvements = useMemo(() => {
    if (!evaluatedIdea) return []
    return getImprovementSuggestions(evaluatedIdea)
  }, [evaluatedIdea])

  return (
    <div className="dashboard-grid single-col">
      <section className="panel form-panel">
        {evaluationError && (
          <div className="error-banner" role="alert">
            <span>⚠</span>
            <span>{evaluationError}</span>
            <button className="btn-icon" onClick={onClearError} aria-label="Close error">✕</button>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="title">Your Business Idea</label>
          <input
            id="title"
            value={ideaTitle}
            onChange={e => setIdeaTitle(e.target.value)}
            placeholder="e.g. Mobile Bicycle Repair Service"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="region">Region (optional)</label>
            <input
              id="region"
              value={ideaRegion}
              onChange={e => setIdeaRegion(e.target.value)}
              placeholder="e.g. Berlin Kreuzberg"
            />
          </div>

          <div className="form-group">
            <label htmlFor="targetAudience">Target Audience (optional)</label>
            <input
              id="targetAudience"
              value={targetAudience}
              onChange={e => setTargetAudience(e.target.value)}
              placeholder="e.g. Seniors, Commuters..."
            />
          </div>
        </div>

        <div className="advanced-toggle">
          <button className="btn-text" onClick={() => setShowAdvanced(!showAdvanced)}>
            {showAdvanced ? '− Less Settings' : '+ Advanced Weighting'}
          </button>
        </div>

        {showAdvanced && (
          <div className="advanced-panel fade-in">
            <div className="weight-group">
              {(
                [
                  ['demand', 'Market Demand'],
                  ['competition', 'Competition'],
                  ['urgency', 'Urgency'],
                  ['profitability', 'Profitability'],
                ] as const
              ).map(([key, label]) => (
                <div className="weight-row" key={key}>
                  <label>{label}</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={weights[key]}
                    onChange={e => setWeights({ ...weights, [key]: parseInt(e.target.value) })}
                  />
                  <span className="weight-val">{weights[key]}%</span>
                </div>
              ))}
              <p className="helper-text">
                Adjust which factors matter most to your decision.
              </p>
            </div>
          </div>
        )}

        <button
          className="btn-primary large"
          onClick={onEvaluate}
          disabled={isEvaluating || !ideaTitle}
        >
          {isEvaluating ? 'Analyzing data...' : 'Fetch Data & Facts'}
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
              <div className="flex-row">
                <h2>Analysis Result</h2>
                {serperApiKey && <span className="badge-live">LIVE DATA SCAN</span>}
              </div>
              <p className="summary-text">{report.verdict}</p>

              {report.evidencePercent !== undefined && (
                <div className="evidence-progress-container">
                  <div className="evidence-progress-header">
                    <span className="evidence-label">DATA QUALITY</span>
                    <span className={`quality-badge ${report.evidenceQuality}`}>
                      {report.evidenceQuality === 'strong' ? 'Strong'
                        : report.evidenceQuality === 'usable' ? 'Usable'
                        : report.evidenceQuality === 'weak' ? 'Weak'
                        : 'Incomplete'}
                    </span>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className={`progress-bar-fill ${report.evidenceQuality}`}
                      style={{ width: `${report.evidencePercent}%` }}
                    />
                  </div>
                  <p className="helper-text">
                    {report.evidencePercent}% of validation steps completed.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="evidence-details">
            <h4>Validation Status</h4>
            <div className="evidence-grid">
              {[
                ['keywordPlannerChecked', 'Keyword Volume'],
                ['googleMapsChecked', 'Local Competition'],
                ['googleTrendsChecked', 'Trend Stability'],
                ['reviewsChecked', 'Customer Feedback'],
              ].map(([key, label]) => {
                const checked = report.checklist?.[key as keyof typeof report.checklist]
                return (
                  <div key={key} className={`evidence-item ${checked ? 'valid' : 'missing'}`}>
                    <span className="status-icon">{checked ? '✓' : '○'}</span>
                    <span className="status-label">{label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="metrics-grid">
            <div className="metric-card">
              <span className="metric-label">Competition</span>
              <span className="metric-value">{report.metrics.competition}</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Search Volume</span>
              <span className="metric-value">{report.metrics.searchVolume}</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Trend</span>
              <span className="metric-value">{report.metrics.trend}</span>
            </div>
            <div className="metric-card highlight">
              <span className="metric-label">Google Results</span>
              <span className="metric-value">
                {report.metrics.totalResults
                  ? report.metrics.totalResults.toLocaleString('en-US')
                  : '---'}
              </span>
            </div>
            <div className="metric-card">
              <span className="metric-label">CPC (Ads)</span>
              <span className="metric-value">{report.metrics.cpc}</span>
            </div>
          </div>

          {/* Score Breakdown + What-If Simulator */}
          {evaluatedIdea && <ScoreBreakdown evaluatedIdea={evaluatedIdea} />}

          <div className="report-grid">
            <div className="report-column">
              <h3>SWOT Analysis</h3>
              <div className="swot-grid">
                {(
                  [
                    ['strengths', 'Strengths', 'strengths'],
                    ['weaknesses', 'Weaknesses', 'weaknesses'],
                    ['opportunities', 'Opportunities', 'opportunities'],
                    ['threats', 'Threats', 'threats'],
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
                <p><strong>Pains:</strong> {report.persona.painPoints.join(', ')}</p>
                <p><strong>Willingness to Pay:</strong> {report.persona.willingnessToPay}</p>
              </div>

              <h3>Revenue Models</h3>
              <ul className="revenue-list">
                {report.revenueModels.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="strategy-box">
            <h3>Go-to-Market Strategy</h3>
            <p>{report.strategyRecommendation}</p>
          </div>

          <div className="next-steps-container">
            <h3>Next Steps</h3>
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
              <h3>Market Evidence (Google Results)</h3>
              <div className="organic-list">
                {report.organicEvidence.map((item, i) => (
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

          {((report.peopleAlsoAsk && report.peopleAlsoAsk.length > 0) ||
            (report.relatedSearches && report.relatedSearches.length > 0)) && (
            <div className="insights-grid">
              {report.peopleAlsoAsk && report.peopleAlsoAsk.length > 0 && (
                <div className="insight-column">
                  <h3>Customer Questions (People Also Ask)</h3>
                  <ul className="insight-list">
                    {report.peopleAlsoAsk.map((q, i) => (
                      <li key={i} className="insight-item question">{q}</li>
                    ))}
                  </ul>
                </div>
              )}
              {report.relatedSearches && report.relatedSearches.length > 0 && (
                <div className="insight-column">
                  <h3>Related Segments</h3>
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
            <h4>Data Sources</h4>
            <ul>
              {report.sources.map((source, idx) => (
                <li key={idx}>✓ {source}</li>
              ))}
            </ul>
          </div>

          {improvements.length > 0 && (
            <div className="improvements-section">
              <h3>Improvement Suggestions</h3>
              <div className="suggestions-list">
                {improvements.map((s) => (
                  <div key={s.id} className={`suggestion-card ${s.impact}`}>
                    <div className="suggestion-header">
                      <span className={`suggestion-type-badge type-${s.type}`}>
                        {s.type === 'pivot' ? 'Pivot' : s.type === 'niche' ? 'Niche'
                          : s.type === 'premium' ? 'Premium' : 'Strategy'}
                      </span>
                      <span className={`suggestion-impact-badge impact-${s.impact}`}>
                        {s.impact === 'high' ? 'High Impact'
                          : s.impact === 'medium' ? 'Medium Impact' : 'Low Impact'}
                      </span>
                    </div>
                    <h4>{s.title}</h4>
                    <p className="suggestion-desc">{s.description}</p>
                    <div className="suggestion-reason"><strong>Why: </strong>{s.reason}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                  Specific: "{ideaTitle}"
                </a>
                <a
                  href={`https://trends.google.com/trends/explore?q=${encodeURIComponent(ideaTitle.split(' ').slice(0, 2).join(' '))}&geo=DE`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="trends-link-chip secondary"
                >
                  General: "{ideaTitle.split(' ').slice(0, 2).join(' ')}"
                </a>
              </div>
            </div>
            <div className="footer-btns">
              <button className="btn-secondary flex-row" onClick={onExport}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Save Report</span>
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
