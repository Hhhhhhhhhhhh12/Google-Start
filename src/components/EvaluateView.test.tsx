import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EvaluateView from './EvaluateView'

const baseProps = {
  ideaTitle: '',
  setIdeaTitle: vi.fn(),
  ideaRegion: '',
  setIdeaRegion: vi.fn(),
  targetAudience: '',
  setTargetAudience: vi.fn(),
  isEvaluating: false,
  report: null,
  serperApiKey: '',
  showAdvanced: false,
  setShowAdvanced: vi.fn(),
  weights: { demand: 25, competition: 30, urgency: 20, profitability: 25 },
  setWeights: vi.fn(),
  onEvaluate: vi.fn(),
  onExport: vi.fn(),
  ideas: [],
  evaluationError: null,
  onClearError: vi.fn(),
}

describe('EvaluateView', () => {
  it('renders the idea input field', () => {
    render(<EvaluateView {...baseProps} />)
    expect(screen.getByLabelText(/Your Business Idea/i)).toBeInTheDocument()
  })

  it('renders optional region and target audience fields', () => {
    render(<EvaluateView {...baseProps} />)
    expect(screen.getByLabelText(/Region/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Target Audience/i)).toBeInTheDocument()
  })

  it('disables the Fetch button when ideaTitle is empty', () => {
    render(<EvaluateView {...baseProps} ideaTitle="" />)
    expect(screen.getByRole('button', { name: /Fetch Data/i })).toBeDisabled()
  })

  it('enables the Fetch button when ideaTitle is provided', () => {
    render(<EvaluateView {...baseProps} ideaTitle="Bike Repair" />)
    expect(screen.getByRole('button', { name: /Fetch Data/i })).toBeEnabled()
  })

  it('shows "Analyzing data..." when isEvaluating is true', () => {
    render(<EvaluateView {...baseProps} ideaTitle="Bike Repair" isEvaluating={true} />)
    expect(screen.getByRole('button', { name: /Analyzing data/i })).toBeInTheDocument()
  })

  it('shows error banner when evaluationError is set', () => {
    render(<EvaluateView {...baseProps} evaluationError="Something went wrong" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('calls onClearError when close button in error banner is clicked', async () => {
    const onClearError = vi.fn()
    render(<EvaluateView {...baseProps} evaluationError="Error" onClearError={onClearError} />)
    await userEvent.click(screen.getByRole('button', { name: /Close error/i }))
    expect(onClearError).toHaveBeenCalled()
  })

  it('calls onEvaluate when Fetch button is clicked', async () => {
    const onEvaluate = vi.fn()
    render(<EvaluateView {...baseProps} ideaTitle="Bike Repair" onEvaluate={onEvaluate} />)
    await userEvent.click(screen.getByRole('button', { name: /Fetch Data/i }))
    expect(onEvaluate).toHaveBeenCalled()
  })

  it('toggles advanced panel when Advanced Weighting is clicked', async () => {
    render(<EvaluateView {...baseProps} />)
    expect(screen.queryByText('Market Demand')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Advanced Weighting/i }))
    expect(baseProps.setShowAdvanced).toHaveBeenCalled()
  })
})
