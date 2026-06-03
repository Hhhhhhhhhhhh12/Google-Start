import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HomeView from './HomeView'
import type { BusinessIdea } from '../types'

const noop = () => {}

function makeIdea(overrides: Partial<BusinessIdea> = {}): BusinessIdea {
  return {
    id: 'idea-1',
    title: 'Mobile Bike Repair',
    region: 'Berlin',
    targetAudience: 'Commuters',
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

describe('HomeView', () => {
  it('shows empty state when no ideas', () => {
    render(
      <HomeView ideas={[]} activeIdeaId={null} onOpenIdea={noop} onDeleteIdea={noop} onImportJson={noop} />
    )
    expect(screen.getByText(/No ideas saved yet/i)).toBeInTheDocument()
  })

  it('renders idea title and region', () => {
    const idea = makeIdea()
    render(
      <HomeView ideas={[idea]} activeIdeaId={null} onOpenIdea={noop} onDeleteIdea={noop} onImportJson={noop} />
    )
    expect(screen.getByText('Mobile Bike Repair')).toBeInTheDocument()
    // 'Berlin' appears in both the card and the region filter dropdown
    expect(screen.getAllByText('Berlin').length).toBeGreaterThan(0)
  })

  it('shows "Not yet analyzed" when idea has no score', () => {
    const idea = makeIdea()
    render(
      <HomeView ideas={[idea]} activeIdeaId={null} onOpenIdea={noop} onDeleteIdea={noop} onImportJson={noop} />
    )
    expect(screen.getByText('Not yet analyzed')).toBeInTheDocument()
  })

  it('calls onDeleteIdea with correct id when Delete is clicked', async () => {
    const onDelete = vi.fn()
    const idea = makeIdea()
    render(
      <HomeView ideas={[idea]} activeIdeaId={null} onOpenIdea={noop} onDeleteIdea={onDelete} onImportJson={noop} />
    )
    await userEvent.click(screen.getByRole('button', { name: /delete mobile bike repair/i }))
    expect(onDelete).toHaveBeenCalledWith('idea-1')
  })

  it('calls onOpenIdea when Open is clicked', async () => {
    const onOpen = vi.fn()
    const idea = makeIdea()
    render(
      <HomeView ideas={[idea]} activeIdeaId={null} onOpenIdea={onOpen} onDeleteIdea={noop} onImportJson={noop} />
    )
    await userEvent.click(screen.getByRole('button', { name: /open/i }))
    expect(onOpen).toHaveBeenCalledWith(idea)
  })

  it('filters ideas by search term', async () => {
    const ideas = [makeIdea({ id: '1', title: 'Bike Repair' }), makeIdea({ id: '2', title: 'Dog Walking' })]
    render(
      <HomeView ideas={ideas} activeIdeaId={null} onOpenIdea={noop} onDeleteIdea={noop} onImportJson={noop} />
    )
    await userEvent.type(screen.getByPlaceholderText(/search/i), 'bike')
    // wait for debounce (300ms) to apply the filter
    await waitFor(() => expect(screen.queryByText('Dog Walking')).not.toBeInTheDocument())
    expect(screen.getByText('Bike Repair')).toBeInTheDocument()
  })

  it('shows count badge when ideas exist', () => {
    const ideas = [makeIdea({ id: '1' }), makeIdea({ id: '2', title: 'Other Idea' })]
    render(
      <HomeView ideas={ideas} activeIdeaId={null} onOpenIdea={noop} onDeleteIdea={noop} onImportJson={noop} />
    )
    expect(screen.getByText('2 / 2')).toBeInTheDocument()
  })
})
