import type { BusinessIdea } from '../types'

interface HomeViewProps {
  ideas: BusinessIdea[]
  activeIdeaId: string | null
  onOpenIdea: (idea: BusinessIdea) => void
  onDeleteIdea: (id: string) => void
}

export default function HomeView({ ideas, activeIdeaId: _activeIdeaId, onOpenIdea, onDeleteIdea }: HomeViewProps) {
  return (
    <div className="dashboard-grid single-col">
      <section className="panel form-panel">
        <h2>Gespeicherte Ideen</h2>
        {ideas.length === 0 ? (
          <p>Noch keine Ideen gespeichert. Starte mit der Validierung oder Ableitung!</p>
        ) : (
          <div className="ideas-list">
            {ideas.map((idea) => (
              <div key={idea.id} className="idea-card">
                <div className="idea-card-header">
                  <h3>{idea.title}</h3>
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
                <p>
                  <strong>Score:</strong>{' '}
                  {idea.marketAnalysis?.scoreAtGeneration ?? '---'} |{' '}
                  <strong>Region:</strong> {idea.region || 'Keine'}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
