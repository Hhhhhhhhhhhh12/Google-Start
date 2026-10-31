import type { MarketAnalysis } from '../types'
import { describeDataBasis } from '../lib/reportProvenance'
import { safeSourceUrl } from '../lib/research'

type Props = { report: MarketAnalysis; ideaTitle: string; onExport: () => void }

export function AnalysisReport({ report, ideaTitle, onExport }: Props) {
  return (
    <section className="panel results-panel fade-in">
      <div className="report-header">
        <div className="report-intro">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2>Was lässt sich daraus ableiten?</h2>
            <span className="badge-hypothesis">{describeDataBasis(report)}</span>
          </div>
          <p className="helper-text">Einschätzung vom {new Date(report.generatedAt).toLocaleString('de-DE')}</p>
          <p className="summary-text">{report.verdict}</p>
          <p className="helper-text">Score, SWOT, Zielgruppe und Strategie sind regelbasierte Arbeitshypothesen. Sie belegen weder regionale Nachfrage noch Zahlungsbereitschaft.</p>

          <details className="report-details"><summary>Orientierungs-Score und Rechercheumfang</summary>
          <p className="score-line"><strong>{report.scoreAtGeneration} / 100</strong> · Orientierungs-Score mit Annahmen</p>
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
          </details>
        </div>
      </div>

      <details className="report-details"><summary>Erfasste Kennzahlen und offene Angaben</summary>
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
            {report.metrics.totalResults !== undefined
              ? report.metrics.totalResults.toLocaleString('de-DE')
              : '---'}
          </span>
        </div>
        <div className="metric-card">
          <span className="metric-label">CPC (Ads)</span>
          <span className="metric-value">{report.metrics.cpc}</span>
        </div>
      </div>

      </details>
      <details className="report-details"><summary>Arbeitshypothesen: Strategie, Zielgruppe und Erlöse</summary>
      <p className="helper-text">Die folgenden Vorschläge entstehen aus Regeln und Vorlagen, nicht aus einer unabhängigen Marktprüfung.</p>
      <div className="report-grid">
        <div className="report-column">
          <h3>Stärken, Schwächen, Chancen und Risiken</h3>
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
          <h3>Mögliche Zielgruppe</h3>
          <div className="persona-card">
            <h4>{report.persona.name}</h4>
            <p>
              <strong>Kundenprobleme:</strong>{' '}
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
        <h3>Vorschlag für den Markteintritt</h3>
        <p>{report.strategyRecommendation}</p>
      </div>

      </details>
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
        <details className="trends-group"><summary>Google Trends manuell öffnen</summary>
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
        </details>
        <div className="footer-btns">
          <button
            className="btn-secondary"
            onClick={onExport}
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
  )
}
