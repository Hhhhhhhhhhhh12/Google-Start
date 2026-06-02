import { useEffect, useMemo, useState } from 'react'
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
  { label: 'Competition Gap',      key: 'competitionGap' },
  { label: 'Problem Strength',     key: 'painScore' },
  { label: 'Commercial Potential', key: 'commercialScore' },
  { label: 'Urgency',              key: 'urgencyScore' },
  { label: 'Keyword Breadth',      key: 'keywordBreadthScore' },
  { label: 'Trend Signal',         key: 'trendScore' },
]

interface ScoreBreakdownProps {
  evaluatedIdea: BusinessIdea
}

export default function ScoreBreakdown({ evaluatedIdea }: ScoreBreakdownProps) {
  const [simActive, setSimActive] = useState(false)
  const [simInputs, setSimInputs] = useState<SimInputs | null>(null)

  // Auto-close simulator when idea changes
  useEffect(() => {
    setSimActive(false)
    setSimInputs(null)
  }, [evaluatedIdea.id])

  // Handle Escape key to close simulator
  useEffect(() => {
    if (!simActive) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSimActive(false)
        setSimInputs(null)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [simActive])

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
      <h3>Score Breakdown</h3>
      <div className="score-bars">
        {BAR_COMPONENTS.map(({ label, key }) => {
          const realVal = Math.max(0, Math.min(100, scoreBreakdown[key] as number))
          const simVal = simActive && simulatedScores ? Math.max(0, Math.min(100, simulatedScores[key] as number)) : null
          const displayVal = simVal ?? realVal
          const delta = simVal !== null ? simVal - realVal : 0

          return (
            <div
              key={key}
              className={`score-bar-row${simActive ? ' simulated' : ''}`}
              role="progressbar"
              aria-valuenow={displayVal}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${label}: ${displayVal} out of 100`}
            >
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
        {simActive ? '✕ Close Simulator' : '🎚 Open What-If Simulator'}
      </button>

      {simActive && simInputs && (
        <div className="what-if-panel">
          <div className="what-if-panel-header">
            <h4>What if…</h4>
            <button className="what-if-reset" onClick={handleResetSim}>
              Reset
            </button>
          </div>

          <div className="what-if-sliders">
            {([
              { key: 'competitorCount',             label: 'Total Competitors',        min: 0,    max: 30,   step: 1   },
              { key: 'professionalCompetitorCount', label: 'Of Which Professionals',   min: 0,    max: 20,   step: 1   },
              { key: 'complaintDensity',            label: 'Complaint Density',        min: 0,    max: 10,   step: 0.5 },
              { key: 'urgency',                     label: 'Urgency',                  min: 0,    max: 10,   step: 0.5 },
              { key: 'willingnessToPay',            label: 'Willingness to Pay',       min: 0,    max: 10,   step: 0.5 },
              { key: 'commercialCompetition',       label: 'Commercial Pressure',      min: 0,    max: 10,   step: 0.5 },
              { key: 'totalSearchVolume',           label: 'Search Volume / Month',    min: 0,    max: 5000, step: 50  },
              { key: 'averageCompetitorRating',     label: 'Avg. Competitor Rating',   min: 0,    max: 5,    step: 0.1 },
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
              <label>Trend Direction</label>
              <select
                value={simInputs.trendDirection}
                onChange={e => updateSim('trendDirection', e.target.value as TrendDirection)}
              >
                <option value="rising">↑ Rising (+100 pts.)</option>
                <option value="stable">→ Stable (+70 pts.)</option>
                <option value="seasonal">◇ Seasonal (+50 pts.)</option>
                <option value="declining">↓ Declining (+20 pts.)</option>
              </select>
            </div>
          </div>

          {simulatedScores && (
            <div className="what-if-result">
              <span className="what-if-result-label">Simulated Total Score</span>
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
