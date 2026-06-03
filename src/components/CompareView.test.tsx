import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CompareView from './CompareView'
import type { BusinessIdea, MarketAnalysis } from '../types'

const noop = () => {}

function makeIdea(overrides: Partial<BusinessIdea> = {}): BusinessIdea {
  return {
    id: 'idea-1',
    title: 'Test Idea',
    region: 'Berlin',
    targetAudience: 'General',
    keywords: [],
    keywordData: [],
    competitorCount: 3,
    professionalCompetitorCount: 1,
    competitors: [],
    complaintDensity: 5,
    urgency: 7,
    willingnessToPay: 6,
    commercialCompetition: 4,
    notes: '',
    painPoints: [],
    painPointEntries: [],
    trendDirection: 'stable',
    trendNotes: '',
    checklist: {
      keywordPlannerChecked: false,
      googleTrendsChecked: false,
      googleMapsChecked: false,
      reviewsChecked: false,
      cpcChecked: false,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  }
}

function makeAnalysis(score: number): MarketAnalysis {
  return {
    verdict: 'Good potential.',
    demandAnalysis: 'Strong demand.',
    competitionAnalysis: 'Low competition.',
    strategyRecommendation: 'Go fast.',
    nextSteps: ['Step 1'],
    metrics: { competition: 'Low', searchVolume: '500/mo', trend: 'Stable', cpc: '---' },
    sources: ['Google Search (Live)'],
    swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
    persona: { name: 'Pragmatist', painPoints: [], willingnessToPay: 'Medium' },
    revenueModels: ['Service fee'],
    generatedAt: Date.now(),
    scoreAtGeneration: score,
  }
}

describe('CompareView', () => {
  it('shows empty state when no ideas', () => {
    render(<CompareView ideas={[]} onOpenIdea={noop} />)
    expect(screen.getByText(/No ideas saved/i)).toBeInTheDocument()
  })

  it('prompts to validate more when only 1 unvalidated idea', () => {
    render(<CompareView ideas={[makeIdea()]} onOpenIdea={noop} />)
    expect(screen.getByText(/Only 1 idea found/i)).toBeInTheDocument()
  })

  it('prompts when ideas exist but fewer than 2 validated', () => {
    const ideas = [makeIdea({ id: '1' }), makeIdea({ id: '2', title: 'Idea B' })]
    render(<CompareView ideas={ideas} onOpenIdea={noop} />)
    expect(screen.getByText(/Validate at least 2/i)).toBeInTheDocument()
  })

  it('renders comparison cards when 2 validated ideas exist', () => {
    const ideas = [
      makeIdea({ id: '1', title: 'Idea A', marketAnalysis: makeAnalysis(75) }),
      makeIdea({ id: '2', title: 'Idea B', marketAnalysis: makeAnalysis(55) }),
    ]
    render(<CompareView ideas={ideas} onOpenIdea={noop} />)
    // titles appear in both the card header and comparison table header
    expect(screen.getAllByText('Idea A').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Idea B').length).toBeGreaterThan(0)
    expect(screen.getByText('Best Idea')).toBeInTheDocument()
  })

  it('shows validated idea count', () => {
    const ideas = [
      makeIdea({ id: '1', title: 'Idea A', marketAnalysis: makeAnalysis(70) }),
      makeIdea({ id: '2', title: 'Idea B', marketAnalysis: makeAnalysis(50) }),
    ]
    render(<CompareView ideas={ideas} onOpenIdea={noop} />)
    expect(screen.getByText('2 validated ideas')).toBeInTheDocument()
  })

  it('calls onOpenIdea when Open button is clicked', async () => {
    const onOpen = vi.fn()
    const ideas = [
      makeIdea({ id: '1', title: 'Idea A', marketAnalysis: makeAnalysis(70) }),
      makeIdea({ id: '2', title: 'Idea B', marketAnalysis: makeAnalysis(50) }),
    ]
    render(<CompareView ideas={ideas} onOpenIdea={onOpen} />)
    await userEvent.click(screen.getAllByRole('button', { name: /Open/i })[0])
    expect(onOpen).toHaveBeenCalled()
  })
})
