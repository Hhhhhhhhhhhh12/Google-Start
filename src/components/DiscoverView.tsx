import type { DerivedIdea } from '../lib/aiMock'

interface DiscoverViewProps {
  deriveSearchTerms: string
  setDeriveSearchTerms: (v: string) => void
  deriveRegion: string
  setDeriveRegion: (v: string) => void
  deriveInterests: string
  setDeriveInterests: (v: string) => void
  isDeriving: boolean
  derivedIdeas: DerivedIdea[] | null
  onDerive: () => void
  onAutoPopulate: (idea: DerivedIdea) => void
}

export default function DiscoverView({
  deriveSearchTerms,
  setDeriveSearchTerms,
  deriveRegion,
  setDeriveRegion,
  deriveInterests,
  setDeriveInterests,
  isDeriving,
  derivedIdeas,
  onDerive,
  onAutoPopulate,
}: DiscoverViewProps) {
  return (
    <div className="dashboard-grid single-col">
      <section className="panel form-panel">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="searchTerms">Suchtrends / Keywords</label>
            <input
              id="searchTerms"
              value={deriveSearchTerms}
              onChange={e => setDeriveSearchTerms(e.target.value)}
              placeholder="z.B. Photovoltaik Reinigung"
            />
          </div>
          <div className="form-group">
            <label htmlFor="deriveRegion">Ziel-Region</label>
            <input
              id="deriveRegion"
              value={deriveRegion}
              onChange={e => setDeriveRegion(e.target.value)}
              placeholder="z.B. Hamburg"
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="interests">Interessen / Branchen</label>
          <textarea
            id="interests"
            rows={2}
            value={deriveInterests}
            onChange={e => setDeriveInterests(e.target.value)}
            placeholder="z.B. Handwerk, Nachhaltigkeit, Senioren..."
          />
        </div>
        <button
          className="btn-primary large"
          onClick={onDerive}
          disabled={isDeriving || (!deriveSearchTerms && !deriveInterests)}
        >
          {isDeriving ? 'Generiere Ideen...' : 'Ideen ableiten'}
        </button>
      </section>

      {derivedIdeas && (
        <section className="panel results-panel fade-in">
          <div className="panel-header">
            <h2>Abgeleitete Geschäftsideen</h2>
            <span className="badge-hypothesis">Hypothesen-Modus</span>
          </div>
          <div className="ideas-list">
            {derivedIdeas.map((idea, idx) => (
              <div key={idx} className="idea-card">
                <div className="idea-card-header">
                  <h3>{idea.title}</h3>
                  <button
                    className="btn-outline small"
                    onClick={() => onAutoPopulate(idea)}
                  >
                    Validieren
                  </button>
                </div>
                <p>
                  <strong>Warum:</strong> {idea.reason}
                </p>
                <p>
                  <strong>Potenzial:</strong> {idea.potential}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
