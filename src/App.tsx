import './App.css'
import { calculateIdeaScore } from './lib/scoring'
import { buildResearchQueries } from './lib/queryBuilder'
import type { BusinessIdea } from './types'

const exampleIdea: BusinessIdea = {
  id: 'idea-1',
  title: 'Google-Bewertungsmanagement für lokale Unternehmen',
  region: 'Müllheim / Markgräflerland / Freiburg',
  targetAudience: 'Arztpraxen, Handwerksbetriebe, Restaurants, lokale Dienstleister',
  keywords: [
    'google bewertung löschen lassen',
    'negative google bewertung entfernen',
    'reputationsmanagement freiburg',
    'google maps bewertung melden',
    'apple maps bewertung löschen',
    '1 sterne bewertung entfernen',
  ],
  competitorCount: 4,
  professionalCompetitorCount: 1,
  complaintDensity: 7,
  urgency: 8,
  willingnessToPay: 8,
  commercialCompetition: 6,
  notes:
    'Viele Anbieter reagieren schlecht oder gar nicht auf Rezensionen. Ein seriöses Angebot sollte Prüfung, Antwortstrategie und Aufbau neuer Bewertungen kombinieren.',
  painPoints: ['keine Rückmeldung', 'schlechte Kommunikation'],
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

const score = calculateIdeaScore(exampleIdea)
const researchQueries = buildResearchQueries(exampleIdea).slice(0, 5)

function App() {
  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">Local-first Research Tool</p>
        <h1>Local Demand Scanner</h1>
        <p className="intro">
          Prüfe lokale Business-Ideen anhand von Suchbegriffen, Konkurrenzsignalen,
          Pain Points, Dringlichkeit und Zahlungsbereitschaft.
        </p>
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <h2>Beispielidee</h2>
          <h3>{exampleIdea.title}</h3>
          <p>{exampleIdea.region}</p>
          <p className="muted">{exampleIdea.targetAudience}</p>
        </article>

        <article className="panel score-panel">
          <h2>Nachfrage-Score</h2>
          <strong>{score.finalScore}</strong>
          <p className="muted">von 100 Punkten</p>
        </article>

        <article className="panel">
          <h2>Score-Bausteine</h2>
          <ul className="score-list">
            <li>Konkurrenzlücke: {score.competitionGap}</li>
            <li>Pain Score: {score.painScore}</li>
            <li>Kommerzieller Druck: {score.commercialScore}</li>
            <li>Dringlichkeit: {score.urgencyScore}</li>
            <li>Keyword-Breite: {score.keywordBreadthScore}</li>
          </ul>
        </article>

        <article className="panel">
          <h2>Erste Recherche-Abfragen</h2>
          <ul className="query-list">
            {researchQueries.map((query) => (
              <li key={`${query.category}-${query.query}`}>
                <a href={query.url} target="_blank" rel="noreferrer">
                  {query.label}
                </a>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  )
}

export default App