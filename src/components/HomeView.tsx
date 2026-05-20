import { useState, useMemo } from 'react'
import type { BusinessIdea } from '../types'

type SortKey = 'date' | 'score' | 'title' | 'region'
type SortDir = 'asc' | 'desc'

interface HomeViewProps {
  ideas: BusinessIdea[]
  activeIdeaId: string | null
  onOpenIdea: (idea: BusinessIdea) => void
  onDeleteIdea: (id: string) => void
}

export default function HomeView({ ideas, activeIdeaId: _activeIdeaId, onOpenIdea, onDeleteIdea }: HomeViewProps) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [filterRegion, setFilterRegion] = useState('')
  const [filterMinScore, setFilterMinScore] = useState(0)

  const regions = useMemo(() => {
    const set = new Set(ideas.map(i => i.region).filter(Boolean))
    return Array.from(set).sort()
  }, [ideas])

  const filtered = useMemo(() => {
    let list = [...ideas]

    // text search
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.region?.toLowerCase().includes(q) ||
        i.targetAudience?.toLowerCase().includes(q)
      )
    }

    // region filter
    if (filterRegion) {
      list = list.filter(i => i.region === filterRegion)
    }

    // min score filter
    if (filterMinScore > 0) {
      list = list.filter(i => (i.marketAnalysis?.scoreAtGeneration ?? 0) >= filterMinScore)
    }

    // sort
    list.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'score':
          cmp = (a.marketAnalysis?.scoreAtGeneration ?? -1) - (b.marketAnalysis?.scoreAtGeneration ?? -1)
          break
        case 'title':
          cmp = a.title.localeCompare(b.title, 'de')
          break
        case 'region':
          cmp = (a.region || '').localeCompare(b.region || '', 'de')
          break
        case 'date':
        default:
          cmp = (a.createdAt ?? 0) - (b.createdAt ?? 0)
      }
      return sortDir === 'desc' ? -cmp : cmp
    })

    return list
  }, [ideas, search, filterRegion, filterMinScore, sortKey, sortDir])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const hasFilters = search || filterRegion || filterMinScore > 0
  const clearFilters = () => {
    setSearch('')
    setFilterRegion('')
    setFilterMinScore(0)
  }

  return (
    <div className="dashboard-grid single-col">
      <section className="panel form-panel">
        <div className="home-header">
          <h2>Gespeicherte Ideen</h2>
          {ideas.length > 0 && (
            <span className="home-count">{filtered.length} / {ideas.length}</span>
          )}
        </div>

        {ideas.length === 0 ? (
          <p className="empty-state-text">Noch keine Ideen gespeichert. Starte mit der Validierung oder Ableitung!</p>
        ) : (
          <>
            {/* Filter & Sort Controls */}
            <div className="home-filters">
              <input
                className="filter-search"
                type="text"
                placeholder="Suchen…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />

              <select
                className="filter-select"
                value={filterRegion}
                onChange={e => setFilterRegion(e.target.value)}
              >
                <option value="">Alle Regionen</option>
                {regions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              <select
                className="filter-select"
                value={filterMinScore}
                onChange={e => setFilterMinScore(Number(e.target.value))}
              >
                <option value={0}>Alle Scores</option>
                <option value={25}>Score ≥ 25</option>
                <option value={50}>Score ≥ 50</option>
                <option value={70}>Score ≥ 70</option>
                <option value={85}>Score ≥ 85</option>
              </select>

              {hasFilters && (
                <button className="btn-ghost filter-clear" onClick={clearFilters}>
                  Filter leeren
                </button>
              )}
            </div>

            {/* Sort Controls */}
            <div className="home-sort-row">
              <span className="sort-label">Sortieren:</span>
              {(['date', 'score', 'title', 'region'] as SortKey[]).map(key => (
                <button
                  key={key}
                  className={`sort-btn${sortKey === key ? ' active' : ''}`}
                  onClick={() => handleSort(key)}
                >
                  {key === 'date' ? 'Datum' : key === 'score' ? 'Score' : key === 'title' ? 'Titel' : 'Region'}
                  {sortKey === key && (
                    <span className="sort-arrow">{sortDir === 'desc' ? '↓' : '↑'}</span>
                  )}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <p className="empty-state-text">Keine Ideen entsprechen den Filtern.</p>
            ) : (
              <div className="ideas-list">
                {filtered.map((idea) => {
                  const score = idea.marketAnalysis?.scoreAtGeneration
                  const scoreClass = score == null ? '' : score >= 70 ? 'good' : score >= 40 ? 'medium' : 'weak'
                  return (
                    <div key={idea.id} className="idea-card">
                      <div className="idea-card-header">
                        <div className="idea-card-meta">
                          <h3>{idea.title}</h3>
                          <span className="idea-region-tag">{idea.region || 'Keine Region'}</span>
                        </div>
                        <div className="flex-row">
                          <button
                            className="btn-outline small"
                            onClick={() => onOpenIdea(idea)}
                          >
                            Öffnen
                          </button>
                          <button
                            className="btn-outline small danger"
                            onClick={() => onDeleteIdea(idea.id)}
                            aria-label={`${idea.title} löschen`}
                          >
                            Löschen
                          </button>
                        </div>
                      </div>
                      <div className="idea-card-body">
                        {score != null ? (
                          <div className="idea-score-row">
                            <span className={`idea-score-badge ${scoreClass}`}>{score}</span>
                            <div className="idea-score-bar-bg">
                              <div
                                className={`idea-score-bar-fill ${scoreClass}`}
                                style={{ width: `${score}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="idea-no-score">Noch nicht analysiert</span>
                        )}
                        <div className="idea-card-details">
                          {idea.targetAudience && idea.targetAudience !== 'Zielgruppe offen' && (
                            <span className="idea-detail-tag">👥 {idea.targetAudience}</span>
                          )}
                          {idea.trendDirection && (
                            <span className="idea-detail-tag">
                              {idea.trendDirection === 'rising' ? '📈' : idea.trendDirection === 'declining' ? '📉' : '➡️'} Trend
                            </span>
                          )}
                          {idea.createdAt && (
                            <span className="idea-detail-date">
                              {new Date(idea.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
