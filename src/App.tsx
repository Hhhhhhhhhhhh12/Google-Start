import { useState, useMemo, type ChangeEvent } from 'react'
import './App.css'
import { calculateIdeaScore } from './lib/scoring'
import { buildResearchQueries } from './lib/queryBuilder'
import type { BusinessIdea } from './types'

const INITIAL_IDEA: BusinessIdea = {
  id: 'idea-1',
  title: 'Google-Bewertungsmanagement für lokale Unternehmen',
  region: 'Müllheim / Freiburg',
  targetAudience: 'Arztpraxen, Restaurants, lokale Dienstleister',
  keywords: [
    'google bewertung löschen lassen',
    'negative google bewertung entfernen',
    'reputationsmanagement freiburg',
  ],
  competitorCount: 4,
  professionalCompetitorCount: 1,
  complaintDensity: 7,
  urgency: 8,
  willingnessToPay: 8,
  commercialCompetition: 6,
  notes: 'Viele Anbieter reagieren schlecht auf Bewertungen.',
  painPoints: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

function App() {
  const [idea, setIdea] = useState<BusinessIdea>(INITIAL_IDEA)
  const [keywordText, setKeywordText] = useState(INITIAL_IDEA.keywords.join('\n'))

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    
    if (type === 'range' || type === 'number') {
      setIdea((prev) => ({ ...prev, [name]: Number(value) }))
    } else {
      setIdea((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleKeywordChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setKeywordText(text)
    const keywords = text
      .split('\n')
      .map((k) => k.trim())
      .filter(Boolean)
    setIdea((prev) => ({ ...prev, keywords }))
  }

  const score = useMemo(() => calculateIdeaScore(idea), [idea])
  const researchQueries = useMemo(
    () => buildResearchQueries(idea).slice(0, 8),
    [idea]
  )

  return (
    <main className="app-shell">
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
              Diese Angaben beeinflussen vor allem die Recherchelinks und den Report, nicht direkt den Score.
            </span>
            
            <div className="form-group">
              <label htmlFor="title">Titel der Idee</label>
              <input
                id="title"
                name="title"
                value={idea.title}
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
                  value={idea.region}
                  onChange={handleInputChange}
                  placeholder="z.B. Freiburg"
                />
              </div>
              <div className="form-group">
                <label htmlFor="targetAudience">Zielgruppe</label>
                <input
                  id="targetAudience"
                  name="targetAudience"
                  value={idea.targetAudience}
                  onChange={handleInputChange}
                  placeholder="z.B. Senioren"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notizen</label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={idea.notes}
                onChange={handleInputChange}
                placeholder="Besondere Beobachtungen..."
              />
            </div>
          </div>

          <div className="form-section">
            <span className="section-label score-influencer">
              Diese Angaben beeinflussen den Preliminary Demand Score.
            </span>

            <div className="form-group">
              <label htmlFor="keywords">Keywords (pro Zeile eins)</label>
              <textarea
                id="keywords"
                rows={4}
                value={keywordText}
                onChange={handleKeywordChange}
                placeholder="Gartenpflege&#10;Rasen mähen"
              />
              <p className="helper-text">
                Mehr relevante Suchbegriffe erhöhen die Keyword-Breite. Qualität ist wichtiger als reine Anzahl.
              </p>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="competitorCount">Lokale Anbieter</label>
                <input
                  id="competitorCount"
                  name="competitorCount"
                  type="number"
                  min="0"
                  value={idea.competitorCount}
                  onChange={handleInputChange}
                />
                <p className="helper-text">
                  Wie viele lokale Anbieter findest du bei Google Maps oder in der Google-Suche?
                </p>
              </div>
              <div className="form-group">
                <label htmlFor="professionalCompetitorCount">Starke Anbieter</label>
                <input
                  id="professionalCompetitorCount"
                  name="professionalCompetitorCount"
                  type="number"
                  min="0"
                  max={idea.competitorCount}
                  value={idea.professionalCompetitorCount}
                  onChange={handleInputChange}
                />
                <p className="helper-text">
                  Wie viele dieser Anbieter wirken stark: gute Website, klare Positionierung, viele Bewertungen?
                </p>
              </div>
            </div>

            {[
              { 
                id: 'complaintDensity', 
                label: 'Beschwerdedichte', 
                value: idea.complaintDensity,
                help: 'Wie häufig findest du wiederkehrende Beschwerden in Rezensionen? 1 = kaum, 10 = sehr viele.'
              },
              { 
                id: 'urgency', 
                label: 'Dringlichkeit', 
                value: idea.urgency,
                help: 'Wie dringend ist das Problem? Notfälle, Fristen oder akute Schäden erhöhen diesen Wert.'
              },
              { 
                id: 'willingnessToPay', 
                label: 'Zahlungsbereitschaft', 
                value: idea.willingnessToPay,
                help: 'Wie wahrscheinlich ist eine Bezahlung? B2B oder rechtliche Risiken erhöhen diesen Wert.'
              },
              { 
                id: 'commercialCompetition', 
                label: 'Kommerzieller Druck', 
                value: idea.commercialCompetition,
                help: 'Wie stark wirkt der Wettbewerb? Hinweise: Google Ads, professionelle Landingpages.'
              },
            ].map((field) => (
              <div className="form-group" key={field.id}>
                <label htmlFor={field.id}>{field.label}</label>
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
                <p className="helper-text">{field.help}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="results-column">
          <article className="panel score-display">
            <h2>Preliminary Demand Score</h2>
            <strong>{score.finalScore}</strong>
            <p className="muted">von 100 Punkten</p>

            <div className="score-explanation">
              Der Score ist ein vorläufiger Entscheidungsfilter. Er ist erst belastbar, wenn die Werte aus Google Keyword Planner, Google Trends, Google Maps und Rezensionen manuell geprüft wurden.
            </div>
            
            <div className="score-grid">
              <div className="score-item">
                Konkurrenzlücke
                <span>{score.competitionGap}%</span>
              </div>
              <div className="score-item">
                Pain Score
                <span>{score.painScore}%</span>
              </div>
              <div className="score-item">
                Kommerziell
                <span>{score.commercialScore}%</span>
              </div>
              <div className="score-item">
                Dringlichkeit
                <span>{score.urgencyScore}%</span>
              </div>
            </div>

            <div className="why-score">
              <h4>Warum dieser Score?</h4>
              <div className="why-list">
                <div className="why-list-item">
                  <strong>{score.competitionGap}% Konkurrenzlücke:</strong> Basierend auf {idea.competitorCount} Anbietern ({idea.professionalCompetitorCount} Profis).
                </div>
                <div className="why-list-item">
                  <strong>{score.painScore}% Pain Score:</strong> Basierend auf der Beschwerdedichte von {idea.complaintDensity}/10.
                </div>
                <div className="why-list-item">
                  <strong>{score.commercialScore}% Kommerziell:</strong> Zahlungsbereitschaft und Werbedruck.
                </div>
                <div className="why-list-item">
                  <strong>{score.urgencyScore}% Dringlichkeit:</strong> Akutheit des Problems ({idea.urgency}/10).
                </div>
                <div className="why-list-item">
                  <strong>{score.keywordBreadthScore}% Keyword-Breite:</strong> Basierend auf {idea.keywords.length} Suchbegriffen.
                </div>
              </div>
            </div>
          </article>

          <article className="panel">
            <h2>Recherche-Links</h2>
            <ul className="query-list">
              {researchQueries.map((query, idx) => (
                <li key={`${idx}-${query.query}`}>
                  <a href={query.url} target="_blank" rel="noreferrer">
                    {query.label}
                  </a>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </div>
    </main>
  )
}

export default App