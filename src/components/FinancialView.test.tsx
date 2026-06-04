import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FinancialView from './FinancialView'

// Default inputs: price=120, customers=10, varCost=25, fixed=400, CAC=60, lifetime=12
// monthlyRevenue = 120*10 = 1,200 | netProfit = 950-400 = 550 | LTV:CAC = 1440/60 = 24

describe('FinancialView', () => {
  it('renders default monthly revenue', () => {
    render(<FinancialView />)
    expect(screen.getByText('€1,200')).toBeInTheDocument()
  })

  it('shows Financially Viable verdict with default inputs', () => {
    render(<FinancialView />)
    expect(screen.getByText('Financially Viable')).toBeInTheDocument()
  })

  it('shows correct break-even customer count', () => {
    render(<FinancialView />)
    // breakEven = ceil(400 / (120-25)) = ceil(4.21) = 5
    expect(screen.getByText('5 customers/mo')).toBeInTheDocument()
  })

  it('shows LTV:CAC ratio', () => {
    render(<FinancialView />)
    // LTV = 120*12 = 1440, CAC = 60, ratio = 24.0
    expect(screen.getByText('24.0 : 1')).toBeInTheDocument()
  })

  it('recalculates revenue when price changes', async () => {
    render(<FinancialView />)
    const priceInput = screen.getByLabelText(/Price per Service/i)
    await userEvent.clear(priceInput)
    await userEvent.type(priceInput, '200')
    // revenue = 200*10 = 2,000
    expect(screen.getByText('€2,000')).toBeInTheDocument()
  })

  it('shows Marginal when variable cost exceeds price', async () => {
    render(<FinancialView />)
    const varCostInput = screen.getByLabelText(/Variable Cost per Service/i)
    await userEvent.clear(varCostInput)
    await userEvent.type(varCostInput, '150')
    // profit < 0 but LTV:CAC = 1440/60 = 24 (≥ 1.5) → Marginal, not Needs Adjustment
    expect(screen.getByText('Marginal')).toBeInTheDocument()
  })

  it('shows Needs Adjustment when price is too low to cover costs', async () => {
    render(<FinancialView />)
    const priceInput = screen.getByLabelText(/Price per Service/i)
    await userEvent.clear(priceInput)
    await userEvent.type(priceInput, '1')
    // LTV = 1*12 = 12, LTV:CAC = 0.2 < 1.5 AND profit = (1-25)*10 - 400 = -640 → Needs Adjustment
    expect(screen.getByText('Needs Adjustment')).toBeInTheDocument()
  })
})
