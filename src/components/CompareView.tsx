import type { BusinessIdea } from '../types'

interface CompareViewProps {
  ideas: BusinessIdea[]
  onOpenIdea: (idea: BusinessIdea) => void
}

export default function CompareView({ ideas, onOpenIdea }: CompareViewProps) {
  const validatedIdeas = ideas
    .filter(i => i.marketAnalysis)
    .sort((a, b) => b.marketAnalysis!.scoreAtGeneration - a.marketAnalysis!.scoreAtGeneration)

  const maxScore = validatedIdeas[0]?.marketAnalysis?.scoreAtGeneration ?? 0
  const minScore = validatedIdeas[validatedIdeas.length - 1]?.marketAnalysis?.scoreAtGeneration ?? 0

  return (
    <div className="dashboard-grid single-col">
      <section className="panel results-panel fade-in">
        <div className="panel-header">
          <h2>Idea Comparison</h2>
          {validatedIdeas.length >= 2 && (
            <span className="compare-count">{validatedIdeas.length} validated ideas</span>
          )}
        </div>

        {validatedIdeas.length < 2 ? (
          <div className="compare-empty">
            <p>
              {ideas.length === 0
                ? '📝 No ideas saved. Start with validation!'
                : ideas.length === 1
                ? '➕ Only 1 idea found. Validate another one to compare.'
                : `🔍 ${ideas.length} ideas saved, but only ${ideas.filter(i => i.marketAnalysis).length} validated. Validate at least 2 to compare.`}
            </p>
          </div>
        ) : (
          <>
            <div className="compare-cards-row">
              {validatedIdeas.map((idea, idx) => {
                const score = idea.marketAnalysis!.scoreAtGeneration
                const isWinner = score === maxScore
                const isLowest = score === minScore && validatedIdeas.length > 1 && !isWinner
                return (
                  <div
                    key={idea.id}
                    className={`compare-verdict-card${isWinner ? ' winner' : ''}${isLowest ? ' lowest' : ''}`}
                  >
                    <div className="compare-rank">#{idx + 1}</div>
                    <div className="compare-score-display">
                      <strong>{score}</strong>
                      <span>Score</span>
                    </div>
                    <div className="compare-score-bar-bg">
                      <div
                        className={`compare-score-bar-fill${isWinner ? ' winner' : ''}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <h4 className="compare-idea-title">{idea.title}</h4>
                    <p className="compare-idea-region">{idea.region || 'No Region'}</p>
                    {isWinner && (
                      <span className="compare-winner-badge">Best Idea</span>
                    )}
                    <button
                      className="btn-outline small compare-open-btn"
                      onClick={() => onOpenIdea(idea)}
                    >
                      Open
                    </button>
                  </div>
                )
              })}
            </div>

            <div className="compare-table-wrapper">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th className="compare-metric-col">Metric</th>
                    {validatedIdeas.map((idea, idx) => (
                      <th
                        key={idea.id}
                        className={idea.marketAnalysis!.scoreAtGeneration === maxScore ? 'winner' : ''}
                      >
                        <span className="compare-th-rank">#{idx + 1}</span>
                        {idea.title}
                        <br />
                        <small>{idea.region || '—'}</small>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="compare-metric-col">Total Score</td>
                    {validatedIdeas.map(idea => {
                      const score = idea.marketAnalysis!.scoreAtGeneration
                      return (
                        <td key={idea.id} className={score === maxScore ? 'compare-cell-best' : ''}>
                          <strong className="compare-score-value">{score}</strong>
                        </td>
                      )
                    })}
                  </tr>
                  <tr>
                    <td className="compare-metric-col">Search Volume</td>
                    {validatedIdeas.map(idea => (
                      <td key={idea.id}>{idea.marketAnalysis!.metrics.searchVolume}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="compare-metric-col">Competition</td>
                    {validatedIdeas.map(idea => (
                      <td key={idea.id}>{idea.marketAnalysis!.metrics.competition}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="compare-metric-col">Trend</td>
                    {validatedIdeas.map(idea => (
                      <td key={idea.id}>{idea.marketAnalysis!.metrics.trend}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="compare-metric-col">CPC</td>
                    {validatedIdeas.map(idea => (
                      <td key={idea.id}>{idea.marketAnalysis!.metrics.cpc}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="compare-metric-col">Data Quality</td>
                    {validatedIdeas.map(idea => (
                      <td key={idea.id}>
                        <span className={`quality-badge ${idea.marketAnalysis!.evidenceQuality ?? 'incomplete'}`}>
                          {idea.marketAnalysis!.evidencePercent ?? '?'}%
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="compare-metric-col">Summary</td>
                    {validatedIdeas.map(idea => (
                      <td key={idea.id} className="compare-verdict-cell">
                        {idea.marketAnalysis!.verdict}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="compare-metric-col"></td>
                    {validatedIdeas.map(idea => (
                      <td key={idea.id}>
                        <button
                          className="btn-outline small"
                          onClick={() => onOpenIdea(idea)}
                        >
                          Open
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
