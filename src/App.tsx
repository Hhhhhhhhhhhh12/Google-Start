import { useState, useMemo, useEffect, type ChangeEvent } from 'react'
import './App.css'
import { calculateIdeaScore } from './lib/scoring'
import { buildResearchQueries } from './lib/queryBuilder'
import { loadIdeas, saveIdeas } from './lib/storage'
import type { BusinessIdea } from './types'

const createNewIdea = (): BusinessIdea => ({
  id: crypto.randomUUID(),
  title: 'Neue Geschäftsidee',
  region: '',
  targetAudience: '',
  keywords: [],
  competitorCount: 0,
  professionalCompetitorCount: 0,
  complaintDensity: 5,
  urgency: 5,
  willingnessToPay: 5,
  commercialCompetition: 5,
  notes: '',
  painPoints: [],
  checklist: {
    keywordPlannerChecked: false,
    googleTrendsChecked: false,
    googleMapsChecked: false,
    reviewsChecked: false,
    cpcChecked: false,
  },
  createdAt: Date.now(),
  updatedAt: Date.now(),
})

function App() {
  const [ideas, setIdeas] = useState<BusinessIdea[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [keywordText, setKeywordText] = useState('')

  // Initial Load
  useEffect(() => {
    const stored = loadIdeas()
    if (stored.length > 0) {
      setIdeas(stored)
      setActiveId(stored[0].id)
      setKeywordText(stored[0].keywords.join('\n'))
    } else {
      const firstIdea = createNewIdea()
      setIdeas([firstIdea])
      setActiveId(firstIdea.id)
      setKeywordText('')
    }
  }, [])

  // Auto-Save
  useEffect(() => {
    if (ideas.length > 0) {
      saveIdeas(ideas)
    }
  }, [ideas])

  const parsedKeywords = useMemo(() => {
    return keywordText
      .split(/\r?\n/)
      .map((k) => k.trim())
      .filter((k) => k.length > 0)
  }, [keywordText])

  // Sync keywords to ideas state
  useEffect(() => {
    if (!activeId) return
    setIdeas((prev) => {
      const currentIdea = prev.find(i => i.id === activeId)
      if (currentIdea && JSON.stringify(currentIdea.keywords) === JSON.stringify(parsedKeywords)) {
        return prev
      }
      return prev.map((i) =>
        i.id === activeId ? { ...i, keywords: parsedKeywords, updatedAt: Date.now() } : i
      )
    })
  }, [parsedKeywords, activeId])

  const activeIdea = useMemo(
    () => ideas.find((i) => i.id === activeId) || null,
    [ideas, activeId]
  )

  const handleSelectIdea = (id: string) => {
    setActiveId(id)
    const idea = ideas.find((i) => i.id === id)
    if (idea) {
      setKeywordText(idea.keywords?.join('\n') || '')
    }
  }

  const handleAddIdea = () => {
    const newIdea = createNewIdea()
    setIdeas((prev) => [newIdea, ...prev])
    setActiveId(newIdea.id)
    setKeywordText('')
  }

  const handleDeleteIdea = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (confirm('Diese Idee wirklich löschen?')) {
      const remaining = ideas.filter((i) => i.id !== id)
      setIdeas(remaining)
      if (activeId === id) {
        const nextId = remaining.length > 0 ? remaining[0].id : null
        setActiveId(nextId)
        if (nextId) {
          const nextIdea = remaining.find(i => i.id === nextId)
          setKeywordText(nextIdea?.keywords.join('\n') || '')
        } else {
          setKeywordText('')
        }
      }
    }
  }

  const handleDuplicateIdea = (e: React.MouseEvent, idea: BusinessIdea) => {
    e.stopPropagation()
    const duplicate = {
      ...idea,
      id: crypto.randomUUID(),
      title: `${idea.title} (Kopie)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setIdeas((prev) => [duplicate, ...prev])
    setActiveId(duplicate.id)
    setKeywordText(duplicate.keywords.join('\n'))
  }

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!activeId) return
    const { name, value, type } = e.target
    const val = type === 'range' || type === 'number' ? Number(value) : value

    setIdeas((prev) =>
      prev.map((i) =>
        i.id === activeId ? { ...i, [name]: val, updatedAt: Date.now() } : i
      )
    )
  }

  const handleChecklistChange = (key: keyof BusinessIdea['checklist']) => {
    if (!activeId) return
    setIdeas((prev) =>
      prev.map((i) =>
        i.id === activeId
          ? {
              ...i,
              checklist: { ...i.checklist, [key]: !i.checklist[key] },
              updatedAt: Date.now(),
            }
          : i
      )
    )
  }

  const handleKeywordTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setKeywordText(e.target.value)
  }

  const score = useMemo(
    () => (activeIdea ? calculateIdeaScore(activeIdea) : null),
    [activeIdea]
  )

  const groupedQueries = useMemo(() => {
    if (!activeIdea) return {}
    const queries = buildResearchQueries(activeIdea)
    return {
      'Google Search': queries.filter(q => q.label.includes('Suche') || q.label.includes('Check')),
      'Google Maps': queries.filter(q => q.label.includes('Maps')),
      'Google Trends': queries.filter(q => q.label.includes('Trends')),
      'Pain Point Research': queries.filter(q => q.label.includes('Problem') || q.label.includes('Beschwerde') || q.label.includes('Reddit')),
    }
  }, [activeIdea])

  return (
    <div className="app-container">
      <aside className="sidebar">
        <header className="sidebar-header">
          <h2 style={{ marginBottom: 0 }}>Scanner</h2>
        </header>
        
        <div className="sidebar-content">
          <div className="idea-list">
            {ideas.map((i) => (
              <button
                key={i.id}
                className={`idea-item ${activeId === i.id ? 'active' : ''}`}
                onClick={() => handleSelectIdea(i.id)}
              >
                <span className="idea-item-title">{i.title || 'Ohne Titel'}</span>
                <div className="idea-item-meta">
                  <span>{i.region || 'Region offen'}</span>
                  <span>{calculateIdeaScore(i).finalScore} pts</span>
                </div>
                <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                   <span 
                    style={{ fontSize: '0.7rem', textDecoration: 'underline' }} 
                    onClick={(e) => handleDuplicateIdea(e, i)}
                   >
                     Kopieren
                   </span>
                   <span 
                    style={{ fontSize: '0.7rem', textDecoration: 'underline', color: '#ef4444' }} 
                    onClick={(e) => handleDeleteIdea(e, i.id)}
                   >
                     Löschen
                   </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <footer className="sidebar-footer">
          <button className="btn-primary" onClick={handleAddIdea}>
            + Neue Idee
          </button>
        </footer>
      </aside>

      <main className="main-content">
        {!activeIdea ? (
          <div style={{ textAlign: 'center', marginTop: '100px' }}>
             <h3>Wähle eine Idee aus oder erstelle eine neue.</h3>
          </div>
        ) : (
          <>
            <section className="hero-card">
              <p className="eyebrow">Local-first Research Tool</p>
              <h1>Local Demand Scanner</h1>
              <p className="intro">
                Validiere deine Business-Idee anhand von Marktsignalen.
              </p>
            </section>

            <div className="dashboard-grid">
              <section className="panel form-panel">
                <div className="form-section">
                  <span className="section-label">
                    1. Idee & Kontext
                  </span>
                  
                  <div className="form-group">
                    <label htmlFor="title">Titel der Idee</label>
                    <input
                      id="title"
                      name="title"
                      value={activeIdea.title}
                      onChange={handleInputChange}
                      placeholder="z.B. Gartenhilfe Müllheim"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="region">Region</label>
                      <input
                        id="region"
                        name="region"
                        value={activeIdea.region}
                        onChange={handleInputChange}
                        placeholder="z.B. Freiburg"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="targetAudience">Zielgruppe</label>
                      <input
                        id="targetAudience"
                        name="targetAudience"
                        value={activeIdea.targetAudience}
                        onChange={handleInputChange}
                        placeholder="z.B. Senioren"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="keywords">Keywords (pro Zeile eins)</label>
                    <textarea
                      id="keywords"
                      rows={4}
                      value={keywordText}
                      onChange={handleKeywordTextChange}
                      placeholder="Gartenpflege&#10;Rasen mähen"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <span className="section-label score-influencer">
                    2. Google Signal Validation (Evidence)
                  </span>

                  <div className="form-group">
                    <label>Quellen-Checkliste</label>
                    <p className="helper-text">Markiere, welche Quellen du bereits geprüft hast.</p>
                    <div className="checklist-group">
                      {[
                        { key: 'keywordPlannerChecked', label: 'Keyword Planner (Volumen)' },
                        { key: 'googleTrendsChecked', label: 'Google Trends (Interesse)' },
                        { key: 'googleMapsChecked', label: 'Google Maps (Konkurrenz)' },
                        { key: 'reviewsChecked', label: 'Bewertungen/Rezensionen (Pains)' },
                        { key: 'cpcChecked', label: 'Google Ads CPC (Kommerziell)' },
                      ].map((item) => (
                        <label key={item.key} className="checklist-item">
                          <input
                            type="checkbox"
                            checked={activeIdea.checklist[item.key as keyof BusinessIdea['checklist']]}
                            onChange={() => handleChecklistChange(item.key as keyof BusinessIdea['checklist'])}
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="competitorCount">Lokale Anbieter (Maps)</label>
                      <input
                        id="competitorCount"
                        name="competitorCount"
                        type="number"
                        min="0"
                        value={activeIdea.competitorCount}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="professionalCompetitorCount">Starke Profis</label>
                      <input
                        id="professionalCompetitorCount"
                        name="professionalCompetitorCount"
                        type="number"
                        min="0"
                        max={activeIdea.competitorCount}
                        value={activeIdea.professionalCompetitorCount}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {[
                    { id: 'complaintDensity', label: 'Beschwerdedichte', value: activeIdea.complaintDensity, help: 'Wie viele negative Rezensionen/Pains hast du gefunden?' },
                    { id: 'urgency', label: 'Dringlichkeit', value: activeIdea.urgency, help: 'Wie akut ist das Problem für den Kunden?' },
                    { id: 'willingnessToPay', label: 'Zahlungsbereitschaft', value: activeIdea.willingnessToPay, help: 'Wie hoch ist der geschätzte Ticketpreis?' },
                    { id: 'commercialCompetition', label: 'Werbedruck (CPC)', value: activeIdea.commercialCompetition, help: 'Wie viele Ads laufen auf die Keywords?' },
                  ].map((field) => (
                    <div className="form-group" key={field.id}>
                      <label htmlFor={field.id}>{field.label}</label>
                      <p className="helper-text">{field.help}</p>
                      <div className="slider-group">
                        <input
                          id={field.id}
                          name={field.id}
                          type="range"
                          min="1"
                          max="10"
                          value={field.value}
                          onChange={handleInputChange}
                        />
                        <span>{field.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="results-column">
                <article className="panel score-display">
                  <h2>Demand Score</h2>
                  <strong>{score?.finalScore}</strong>
                  <p className="muted">von 100 Punkten</p>
                  
                  <div className={`quality-badge ${score?.evidenceQuality}`}>
                    Evidence: {score?.evidenceQuality}
                  </div>

                  <div className="score-explanation">
                    <strong>Wichtig:</strong> Der Score ist nur so belastbar wie deine Recherche. Nutze die Checkliste links, um die Datenqualität zu erhöhen.
                  </div>
                  
                  <div className="score-grid">
                    <div className="score-item">Lücke<span>{score?.competitionGap}%</span></div>
                    <div className="score-item">Pain<span>{score?.painScore}%</span></div>
                    <div className="score-item">Komm.<span>{score?.commercialScore}%</span></div>
                    <div className="score-item">Dringl.<span>{score?.urgencyScore}%</span></div>
                  </div>

                  <div className="why-score">
                    <h4>Warum dieser Score?</h4>
                    <div className="breakdown-list">
                      <div className="breakdown-row">
                        <div className="breakdown-header">
                          <span className="breakdown-label">Konkurrenzlücke</span>
                          <span className="breakdown-value">{score?.competitionGap}%</span>
                        </div>
                        <p className="breakdown-desc">
                          {activeIdea.competitorCount} Anbieter / {activeIdea.professionalCompetitorCount} Profis.
                        </p>
                      </div>

                      <div className="breakdown-row">
                        <div className="breakdown-header">
                          <span className="breakdown-label">Keyword-Breite</span>
                          <span className="breakdown-value">{score?.keywordBreadthScore}%</span>
                        </div>
                        <p className="breakdown-desc">
                          {activeIdea.keywords.length} Begriffe validiert.
                        </p>
                      </div>
                    </div>
                  </div>
                </article>

                <article className="panel">
                  <h2>Recherche-Links</h2>
                  {Object.entries(groupedQueries).map(([group, queries]) => (
                    queries.length > 0 && (
                      <div key={group} className="query-group">
                        <h3>{group}</h3>
                        <ul className="query-list">
                          {queries.map((query: { url: string; label: string; query: string }, idx: number) => (
                            <li key={`${idx}-${query.query}`}>
                              <a href={query.url} target="_blank" rel="noreferrer">
                                {query.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  ))}
                </article>
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default App