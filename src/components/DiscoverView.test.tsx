import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DiscoverView from './DiscoverView'
import type { DerivedIdea } from '../lib/aiMock'

const baseProps = {
  deriveSearchTerms: '',
  setDeriveSearchTerms: vi.fn(),
  deriveRegion: '',
  setDeriveRegion: vi.fn(),
  deriveInterests: '',
  setDeriveInterests: vi.fn(),
  isDeriving: false,
  derivedIdeas: null,
  onDerive: vi.fn(),
  onAutoPopulate: vi.fn(),
}

describe('DiscoverView', () => {
  it('renders keyword and region input fields', () => {
    render(<DiscoverView {...baseProps} />)
    expect(screen.getByLabelText(/Search Trends/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Target Region/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Interests/i)).toBeInTheDocument()
  })

  it('disables Derive button when both inputs are empty', () => {
    render(<DiscoverView {...baseProps} />)
    expect(screen.getByRole('button', { name: /Derive Ideas/i })).toBeDisabled()
  })

  it('enables Derive button when searchTerms are provided', () => {
    render(<DiscoverView {...baseProps} deriveSearchTerms="solar panels" />)
    expect(screen.getByRole('button', { name: /Derive Ideas/i })).toBeEnabled()
  })

  it('enables Derive button when interests are provided', () => {
    render(<DiscoverView {...baseProps} deriveInterests="sustainability" />)
    expect(screen.getByRole('button', { name: /Derive Ideas/i })).toBeEnabled()
  })

  it('shows "Generating Ideas..." when isDeriving is true', () => {
    render(<DiscoverView {...baseProps} deriveSearchTerms="solar" isDeriving={true} />)
    expect(screen.getByRole('button', { name: /Generating Ideas/i })).toBeInTheDocument()
  })

  it('calls onDerive when button is clicked', async () => {
    const onDerive = vi.fn()
    render(<DiscoverView {...baseProps} deriveSearchTerms="solar" onDerive={onDerive} />)
    await userEvent.click(screen.getByRole('button', { name: /Derive Ideas/i }))
    expect(onDerive).toHaveBeenCalled()
  })

  it('renders derived ideas when provided', () => {
    const ideas: DerivedIdea[] = [
      { title: 'Solar Panel Cleaning', reason: 'High demand trend', potential: 'High' },
      { title: 'EV Charging Setup', reason: 'Growing EV market', potential: 'Medium' },
    ]
    render(<DiscoverView {...baseProps} derivedIdeas={ideas} />)
    expect(screen.getByText('Solar Panel Cleaning')).toBeInTheDocument()
    expect(screen.getByText('EV Charging Setup')).toBeInTheDocument()
  })

  it('calls onAutoPopulate when Validate is clicked', async () => {
    const onAutoPopulate = vi.fn()
    const ideas: DerivedIdea[] = [
      { title: 'Solar Panel Cleaning', reason: 'Trend', potential: 'High' },
    ]
    render(<DiscoverView {...baseProps} derivedIdeas={ideas} onAutoPopulate={onAutoPopulate} />)
    await userEvent.click(screen.getByRole('button', { name: /Validate/i }))
    expect(onAutoPopulate).toHaveBeenCalledWith(ideas[0])
  })
})
