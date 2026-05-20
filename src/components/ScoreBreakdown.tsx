import { useMemo, useState } from 'react'
import type { BusinessIdea, TrendDirection } from '../types'
import { calculateIdeaScore, calculateScore } from '../lib/scoring'

interface SimInputs {
  competitorCount: number
  professionalCompetitorCount: number
  complaintDensity: number
  urgency: number
  willingnessToPay: number
  commercialCompetition: number
  trendDirection: TrendDirection
  totalSearchVolume: number
  averageCompetitorRating: number
}

function buildSimInputs(idea: BusinessIdea): SimInputs {
  const avgRating = idea.competitors?.length
    ? idea.competitors.reduce((s, c) => s + c.rating, 0) / idea.competitors.length
    : 0
  const totalVolume = (idea.keywordData || []).reduce((s, kd) => s + (kd.monthlyVolume || 0), 0)
  return {
    competitorCount: idea.competitorCount,
    professionalCompetitorCount: idea.professionalCompetitorCount,
    complaintDensity: idea.complaintDensity,
    urgency: idea.urgency,
    willingnessToPay: idea.willingnessToPay,
    commercialCompetition: idea.commercialCompetition,
    trendDirection: idea.trendDirection || 'stable',
    totalSearchVolume: totalVolume,
    averageCompetitorRating: avgRating,
  }
}

type ScoreComponentKey = 'competitionGap' | 'painScore' | 'commercialScore' | 'urgencyScore' | 'keywordBreadthScore' | 'trendScore'

const BAR_COMPONENTS: { label: string; key: ScoreComponentKey }[] = [
  { label: 'Wettbewerbs-Lücke',      key: 'competitionGap' },
  { label: 'Problem-Stärke',          key: 'painScore' },
  { label: 'Kommerzielles Potenzial', key: 'commercialScore' },
  { label: 'Dringlichkeit',           key: 'urgencyScore' },
  { label: 'Keyword-Breite',          key: 'keywordBreadthScore' },
  { label: 'Trend-Signal',            key: 'trendScore' },
]

interface ScoreBreakdownProps {
  evaluatedIdea: BusinessIdea
}

export default function ScoreBreakdown({ evaluatedIdea }: ScoreBreakdownProps) {
  const [simActive, setSimActive] = useState(false)
  const [simInputs, setSimInputs] = useState<SimInputs | null>(null)

  const scoreBreakdown = useMemo(() => calculateIdeaScore(evaluatedIdea), [evaluatedIdea])

  const simulatedScores = useMemo(() => {
    if (!simInputs) return null
    return calculateScore({
      competitorCount: simInputs.competitorCount,
      professionalCompetitorCount: simInputs.professionalCompetitorCount,
      complaintDensity: simInputs.complaintDensity,
      urgency: simInputs.urgency,
      willingnessToPay: simInputs.willingnessToPay,
      commercialCompetition: simInputs.commercialCompetition,
      trendDirection: simInputs.trendDirection,
      totalSearchVolume: simInputs.totalSearchVolume,
      averageCompetitorRating: simInputs.averageCompetitorRating,
      keywordCount: evaluatedIdea.keywords.length,
      painPointEntryCount: (evaluatedIdea.painPointEntries || []).length,
    }, evaluatedIdea.weights)
  }, [simInputs, evaluatedIdea])

  const scoreDiff = simulatedScores
    ? simulatedScores.finalScore - scoreBreakdown.finalScore
    : 0

  const handleToggleSim = () => {
    if (!simActive) setSimInputs(buildSimInputs(evaluatedIdea))
    setSimActive(v => !v)
  }

  const handleResetSim = () => setSimInputs(buildSimInputs(evaluatedIdea))

  const updateSim = (key: keyof SimInputs, value: number | TrendDirection) =>
    setSimInputs(prev => prev ? { ...prev, [key]: value } : null)

  return (
    <div className="score-breakdown">
      <h3>Score-Aufschlüsselung</h3>
      <div className="score-bars">
        {BAR_COMPONENTS.map(({ label, key }) => {
          const realVal = scoreBreakdown[key] as number
          const simVal = simActive && simulatedScores ? simulatedScores[key] as number : null
          const displayVal = simVal ?? realVal
          const delta = simVal !== null ? simVal - realVal : 0

          return (
            <div key={key} className={`score-bar-row${simActive ? ' simulated' : ''}`}>
              <span className="score-bar-label">{label}</span>
              <div className="score-bar-track">
                {simActive && simVal !== null && (
                  <div
                    className="score-bar-fill"
                    style={{ width: `${realVal}%`, opacity: 0.2, position: 'absolute' }}
                  />
                )}
                <div
                  className={`score-bar-fill ${displayVal >= 70 ? 'good' : displayVal >= 40 ? 'medium' : 'weak'}`}
                  style={{ width: `${displayVal}%` }}
                />
              </div>
              <span className="score-bar-value">{displayVal}</span>
              {simActive && simVal !== null && (
                <span className={`score-bar-delta ${delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'neutral'}`}>
                  {delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : '±0'}
                </span>
              )}
            </div>
          )
        })}
      </div>

      <button
        className={`what-if-toggle${simActive ? ' active' : ''}`}
        onClick={handleToggleSim}
      >
        {simActive ? '✕ Simulator schließen' : '🎚 What-If Simulator öffnen'}
      </button>

      {simActive && simInputs && (
        <div className="what-if-panel">
          <div className="what-if-panel-header">
            <h4>Was wäre wenn…</h4>
            <button className="what-if-reset" onClick={handleResetSim}>
              Zurücksetzen
            </button>
          </div>

          <div className="what-if-sliders">
            {([
              { key: 'competitorCount',             label: 'Konkurrenten gesamt',    min: 0,    max: 30,   step: 1   },
              { key: 'professionalCompetitorCount', label: 'Davon Profis',           min: 0,    max: 20,   step: 1   },
              { key: 'complaintDensity',            label: 'Beschwerde-Dichte',      min: 0,    max: 10,   step: 0.5 },
              { key: 'urgency',                     label: 'Dringlichkeit',          min: 0,    max: 10,   step: 0.5 },
              { key: 'willingnessToPay',            label: 'Zahlungsbereitschaft',   min: 0,    max: 10,   step: 0.5 },
              { key: 'commercialCompetition',       label: 'Kommerzieller Druck',    min: 0,    max: 10,   step: 0.5 },
              { key: 'totalSearchVolume',           label: 'Suchvolumen / Monat',    min: 0,    max: 5000, step: 50  },
              { key: 'averageCompetitorRating',     label: 'Ø Konkurrenz-Bewertung', min: 0,    max: 5,    step: 0.1 },
            ] as const).map(({ key, label, min, max, step }) => (
              <div key={key} className="what-if-slider-row">
                <label>
                  {label}
                  <span>{simInputs[key]}</span>
                </label>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={simInputs[key] as number}
                  onChange={e => updateSim(key, parseFloat(e.target.value))}
                />
              </div>
            ))}

            <div className="what-if-slider-row">
              <label>Trend-Richtung</label>
              <select
                value={simInputs.trendDirection}
                onChange={e => updateSim('trendDirection', e.target.value as TrendDirection)}
              >
                <option value="rising">↑ Steigend (+100 Pkt.)</option>
                <option value="stable">→ Stabil (+70 Pkt.)</option>
                <option value="seasonal">◇ Saisonal (+50 Pkt.)</option>
                <option value="declining">↓ Sinkend (+20 Pkt.)</option>
              </select>
            </div>
          </div>

          {simulatedScores && (
            <div className="what-if-result">
              <span className="what-if-result-label">Simulierter Gesamt-Score</span>
              <div className="what-if-result-scores">
                <span className="what-if-original-score">{scoreBreakdown.finalScore}</span>
                <span className="what-if-arrow">→</span>
                <span className={`what-if-new-score ${scoreDiff > 0 ? 'better' : scoreDiff < 0 ? 'worse' : 'same'}`}>
                  {simulatedScores.finalScore}
                </span>
                <span className={`what-if-diff-badge ${scoreDiff > 0 ? 'positive' : scoreDiff < 0 ? 'negative' : 'neutral'}`}>
                  {scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff < 0 ? `${scoreDiff}` : '±0'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
