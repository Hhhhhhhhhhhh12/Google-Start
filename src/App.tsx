import { useState, useEffect } from 'react'
import './App.css'
import { generateMarketAnalysis } from './lib/marketAnalysis'
import { deriveIdeasMock, type DerivedIdea } from './lib/aiMock'
import { scrapeGoogleMaps, scrapeSearchMetadata } from './lib/scraper'
import { generateReportMarkdown } from './lib/exportUtils'
import { calculateEvidencePercent, calculateEvidenceQuality } from './lib/scoring'
import type { BusinessIdea, MarketAnalysis } from './types'
import { loadIdeas, saveIdeas } from './lib/storage'

import HomeView from './components/HomeView'
import EvaluateView from './components/EvaluateView'
import DiscoverView from './components/DiscoverView'
import CompareView from './components/CompareView'

type AppMode = 'home' | 'evaluate' | 'discover' | 'compare'
type ReportType = (MarketAnalysis & { evidencePercent?: number; evidenceQuality?: string }) | null

function App() {
  const [mode, setMode] = useState<AppMode>('home')
  const [ideas, setIdeas] = useState<BusinessIdea[]>([])
  const [activeIdeaId, setActiveIdeaId] = useState<string | null>(null)

  // Load ideas on mount
  useEffect(() => {
    const loaded = loadIdeas()
    setIdeas(loaded)
  }, [])

  // Save ideas when they change
  useEffect(() => {
    if (ideas.length > 0) {
      saveIdeas(ideas)
    }
  }, [ideas])

  const [serperApiKey, setSerperApiKey] = useState(
    localStorage.getItem('serper_api_key') || ''
  )

  const handleSaveApiKey = (val: string) => {
    setSerperApiKey(val)
    localStorage.setItem('serper_api_key', val)
  }

  // Evaluate State
  const [ideaTitle, setIdeaTitle] = useState('')
  const [ideaRegion, setIdeaRegion] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [report, setReport] = useState<ReportType>(null)

  // Discover State
  const [deriveSearchTerms, setDeriveSearchTerms] = useState('')
  const [deriveRegion, setDeriveRegion] = useState('')
  const [deriveInterests, setDeriveInterests] = useState('')
  const [isDeriving, setIsDeriving] = useState(false)
  const [derivedIdeas, setDerivedIdeas] = useState<DerivedIdea[] | null>(null)

  // Configuration State
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [weights, setWeights] = useState({
    demand: 25,
    competition: 30,
    urgency: 20,
    profitability: 25,
  })

  const buildBaseIdea = (): BusinessIdea => ({
    id: crypto.randomUUID(),
    title: ideaTitle,
    region: ideaRegion,
    targetAudience: targetAudience || 'Zielgruppe offen',
    keywords: [ideaTitle],
    keywordData: [],
    competitorCount: serperApiKey ? 0 : 5,
    professionalCompetitorCount: serperApiKey ? 0 : 2,
    competitors: [],
    complaintDensity: 6,
    urgency: 7,
    willingnessToPay: 6,
    commercialCompetition: 5,
    notes: '',
    painPoints: [],
    painPointEntries: [],
    trendDirection: 'stable',
    trendNotes: '',
    checklist: {
      keywordPlannerChecked: !serperApiKey,
      googleTrendsChecked: false,
      googleMapsChecked: !serperApiKey,
      reviewsChecked: false,
      cpcChecked: false,
    },
    weights,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  })

  const handleEvaluate = async () => {
    if (!ideaTitle) return
    setIsEvaluating(true)
    setReport(null)

    let idea = buildBaseIdea()

    try {
      if (serperApiKey) {
        const query = `${ideaTitle} ${ideaRegion}`.trim()
        const [mapsResults, searchMeta] = await Promise.all([
          scrapeGoogleMaps(query, serperApiKey).catch(e => {
            console.error('Maps Error:', e)
            return []
          }),
          scrapeSearchMetadata(ideaTitle, serperApiKey).catch(e => {
            console.error('Search Error:', e)
            return { adCount: 0, resultCount: 0, organic: [], peopleAlsoAsk: [], relatedSearches: [] }
          }),
        ])

        const estimatedVolume = Math.min(
          1500,
          Math.floor(searchMeta.resultCount / 10000)
        )
        const adBonus = searchMeta.adCount > 0 ? 500 : 0

        idea = {
          ...idea,
          competitors: mapsResults.slice(0, 10),
          competitorCount: mapsResults.length,
          professionalCompetitorCount: Math.round(mapsResults.length * 0.4),
          commercialCompetition: Math.min(10, Math.max(1, searchMeta.adCount * 2)),
          keywordData: [
            { term: ideaTitle, monthlyVolume: estimatedVolume + adBonus },
          ],
          organicResults: searchMeta.organic,
          peopleAlsoAsk: searchMeta.peopleAlsoAsk,
          relatedSearches: searchMeta.relatedSearches,
          checklist: {
            ...idea.checklist,
            googleMapsChecked: mapsResults.length > 0,
            cpcChecked: searchMeta.adCount > 0,
            keywordPlannerChecked: searchMeta.resultCount > 0,
          },
        }

        const analysis = generateMarketAnalysis(idea)
        const evidencePercent = calculateEvidencePercent(idea)
        const evidenceQuality = calculateEvidenceQuality(idea)

        const finalReport: ReportType = {
          ...analysis,
          metrics: {
            ...analysis.metrics,
            totalResults: searchMeta.resultCount,
          },
          evidencePercent,
          evidenceQuality,
        }

        setReport(finalReport)
        idea.marketAnalysis = finalReport ?? undefined
        setIdeas(prev => {
          const existing = prev.find(i => i.title === idea.title && i.region === idea.region)
          if (existing) {
            return prev.map(i => i.id === existing.id ? { ...idea, id: existing.id } : i)
          }
          return [idea, ...prev]
        })
      } else {
        await new Promise(r => setTimeout(r, 1500))
        const analysis = generateMarketAnalysis(idea)
        setReport(analysis)
        idea.marketAnalysis = analysis
        setIdeas(prev => {
          const existing = prev.find(i => i.title === idea.title && i.region === idea.region)
          if (existing) {
            return prev.map(i => i.id === existing.id ? { ...idea, id: existing.id } : i)
          }
          return [idea, ...prev]
        })
      }
    } catch (err) {
      console.error(err)
      alert('Es gab ein Problem beim Abrufen der Daten.')
    } finally {
      setIsEvaluating(false)
    }
  }

  const handleDerive = async () => {
    if (!deriveSearchTerms && !deriveInterests) return
    setIsDeriving(true)
    setDerivedIdeas(null)
    try {
      const combinedInput = `${deriveSearchTerms} ${deriveInterests}`.trim()
      const results = await deriveIdeasMock(combinedInput)
      setDerivedIdeas(results)
    } finally {
      setIsDeriving(false)
    }
  }

  const handleAutoPopulate = (idea: DerivedIdea) => {
    setIdeaTitle(idea.title)
    setIdeaRegion(deriveRegion || 'Lokal')
    setMode('evaluate')
    setReport(null)
  }

  const handleExport = () => {
    if (!report) return
    const md = generateReportMarkdown(ideaTitle, ideaRegion, report)
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Analyse_${ideaTitle.replace(/\s+/g, '_')}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleOpenIdea = (idea: BusinessIdea) => {
    setActiveIdeaId(idea.id)
    setIdeaTitle(idea.title)
    setIdeaRegion(idea.region)
    setTargetAudience(idea.targetAudience)
    setReport(idea.marketAnalysis ?? null)
    setMode('evaluate')
  }

  const handleDeleteIdea = (id: string) => {
    setIdeas(ideas.filter(i => i.id !== id))
    if (activeIdeaId === id) setActiveIdeaId(null)
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="api-config">
          <input
            type="password"
            placeholder="Serper API Key..."
            value={serperApiKey}
            onChange={e => handleSaveApiKey(e.target.value)}
          />
        </div>
      </header>

      <main className="main-content">
        {!serperApiKey && (
          <div className="simulation-banner">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>
              <strong>Simulations-Modus:</strong> Trage oben einen Serper API
              Key ein für echte Live-Daten aus Google Maps &amp; Suche.
            </span>
          </div>
        )}

        <section className="hero-card">
          <p className="eyebrow">AI Business Validator</p>
          <h1>Ideen Scout</h1>
          <p className="intro">
            Gib deine Geschäftsidee ein und erhalte datenbasierte Fakten, oder
            finde neue Ideen aus aktuellen Suchanfragen.
          </p>
          <div className="tab-navigation">
            <button
              className={`tab-button ${mode === 'home' ? 'active' : ''}`}
              onClick={() => setMode('home')}
            >
              Übersicht
            </button>
            <button
              className={`tab-button ${mode === 'evaluate' ? 'active' : ''}`}
              onClick={() => setMode('evaluate')}
            >
              1. Idee validieren
            </button>
            <button
              className={`tab-button ${mode === 'discover' ? 'active' : ''}`}
              onClick={() => setMode('discover')}
            >
              2. Ideen ableiten
            </button>
            <button
              className={`tab-button ${mode === 'compare' ? 'active' : ''}`}
              onClick={() => setMode('compare')}
            >
              Vergleich
            </button>
          </div>
        </section>

        {mode === 'home' && (
          <HomeView
            ideas={ideas}
            activeIdeaId={activeIdeaId}
            onOpenIdea={handleOpenIdea}
            onDeleteIdea={handleDeleteIdea}
          />
        )}

        {mode === 'evaluate' && (
          <EvaluateView
            ideaTitle={ideaTitle}
            setIdeaTitle={setIdeaTitle}
            ideaRegion={ideaRegion}
            setIdeaRegion={setIdeaRegion}
            targetAudience={targetAudience}
            setTargetAudience={setTargetAudience}
            isEvaluating={isEvaluating}
            report={report}
            serperApiKey={serperApiKey}
            showAdvanced={showAdvanced}
            setShowAdvanced={setShowAdvanced}
            weights={weights}
            setWeights={setWeights}
            onEvaluate={handleEvaluate}
            onExport={handleExport}
            ideas={ideas}
          />
        )}

        {mode === 'discover' && (
          <DiscoverView
            deriveSearchTerms={deriveSearchTerms}
            setDeriveSearchTerms={setDeriveSearchTerms}
            deriveRegion={deriveRegion}
            setDeriveRegion={setDeriveRegion}
            deriveInterests={deriveInterests}
            setDeriveInterests={setDeriveInterests}
            isDeriving={isDeriving}
            derivedIdeas={derivedIdeas}
            onDerive={handleDerive}
            onAutoPopulate={handleAutoPopulate}
          />
        )}

        {mode === 'compare' && (
          <CompareView
            ideas={ideas}
            onOpenIdea={handleOpenIdea}
          />
        )}
      </main>
    </div>
  )
}

export default App
