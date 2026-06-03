import { useState, useMemo } from 'react'

interface FinancialInputs {
  pricePerService: number
  monthlyNewCustomers: number
  variableCostPerService: number
  monthlyFixedCosts: number
  customerAcquisitionCost: number
  customerLifetimeMonths: number
}

const DEFAULT_INPUTS: FinancialInputs = {
  pricePerService: 120,
  monthlyNewCustomers: 10,
  variableCostPerService: 25,
  monthlyFixedCosts: 400,
  customerAcquisitionCost: 60,
  customerLifetimeMonths: 12,
}

export default function FinancialView() {
  const [inputs, setInputs] = useState<FinancialInputs>(DEFAULT_INPUTS)

  const update = (key: keyof FinancialInputs, raw: string) => {
    const val = Math.max(0, parseFloat(raw) || 0)
    setInputs(prev => ({ ...prev, [key]: val }))
  }

  const results = useMemo(() => {
    const { pricePerService, monthlyNewCustomers, variableCostPerService,
      monthlyFixedCosts, customerAcquisitionCost, customerLifetimeMonths } = inputs

    const monthlyRevenue = pricePerService * monthlyNewCustomers
    const monthlyVariableCosts = variableCostPerService * monthlyNewCustomers
    const monthlyGrossProfit = monthlyRevenue - monthlyVariableCosts
    const monthlyNetProfit = monthlyGrossProfit - monthlyFixedCosts

    const contributionMargin = pricePerService - variableCostPerService
    const breakEvenCustomers = contributionMargin > 0
      ? Math.ceil(monthlyFixedCosts / contributionMargin)
      : Infinity

    const ltv = pricePerService * customerLifetimeMonths
    const ltvCacRatio = customerAcquisitionCost > 0 ? ltv / customerAcquisitionCost : Infinity
    const cacPaybackMonths = contributionMargin > 0
      ? customerAcquisitionCost / contributionMargin
      : Infinity

    return { monthlyRevenue, monthlyVariableCosts, monthlyGrossProfit,
      monthlyNetProfit, breakEvenCustomers, ltv, ltvCacRatio, cacPaybackMonths,
      contributionMargin }
  }, [inputs])

  const verdict = useMemo(() => {
    if (results.ltvCacRatio >= 3 && results.monthlyNetProfit > 0)
      return { label: 'Financially Viable', cls: 'good', icon: '✓' }
    if (results.ltvCacRatio >= 1.5 || results.monthlyNetProfit >= 0)
      return { label: 'Marginal', cls: 'medium', icon: '≈' }
    return { label: 'Needs Adjustment', cls: 'weak', icon: '✗' }
  }, [results])

  const fmt = (n: number) =>
    isFinite(n) ? n.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '∞'
  const fmtDec = (n: number, d = 1) =>
    isFinite(n) ? n.toFixed(d) : '∞'

  return (
    <div className="dashboard-grid single-col">
      <section className="panel form-panel">
        <h2>Financial Feasibility</h2>
        <p className="helper-text">
          Estimate revenue, break-even, and unit economics. Adjust the inputs to model different scenarios.
        </p>

        <div className="form-row">
          <div className="form-group">
            <label>Price per Service (€)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={inputs.pricePerService}
              onChange={e => update('pricePerService', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Monthly New Customers</label>
            <input
              type="number"
              min="0"
              step="1"
              value={inputs.monthlyNewCustomers}
              onChange={e => update('monthlyNewCustomers', e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Variable Cost per Service (€)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={inputs.variableCostPerService}
              onChange={e => update('variableCostPerService', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Monthly Fixed Costs (€)</label>
            <input
              type="number"
              min="0"
              step="10"
              value={inputs.monthlyFixedCosts}
              onChange={e => update('monthlyFixedCosts', e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Customer Acquisition Cost — CAC (€)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={inputs.customerAcquisitionCost}
              onChange={e => update('customerAcquisitionCost', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Avg. Customer Lifetime (months)</label>
            <input
              type="number"
              min="1"
              step="1"
              value={inputs.customerLifetimeMonths}
              onChange={e => update('customerLifetimeMonths', e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="panel results-panel fade-in">
        <div className="report-header">
          <div className="score-badge">
            <strong>{verdict.icon}</strong>
            <span>Verdict</span>
          </div>
          <div className="report-intro">
            <div className="flex-row">
              <h2>Financial Summary</h2>
              <span className={`idea-score-badge ${verdict.cls}`}>{verdict.label}</span>
            </div>
            <p className="summary-text">
              Contribution margin €{fmt(results.contributionMargin)} / service.
              Break-even at <strong>{isFinite(results.breakEvenCustomers) ? results.breakEvenCustomers : '∞'}</strong> customers/month
              (currently targeting <strong>{inputs.monthlyNewCustomers}</strong>).
            </p>
          </div>
        </div>

        <div className="metrics-grid">
          <div className="metric-card">
            <span className="metric-label">Monthly Revenue</span>
            <span className="metric-value">€{fmt(results.monthlyRevenue)}</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Variable Costs</span>
            <span className="metric-value">€{fmt(results.monthlyVariableCosts)}</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Gross Profit</span>
            <span className="metric-value">€{fmt(results.monthlyGrossProfit)}</span>
          </div>
          <div className={`metric-card${results.monthlyNetProfit >= 0 ? ' highlight' : ''}`}>
            <span className="metric-label">Net Profit / Month</span>
            <span className="metric-value">
              {results.monthlyNetProfit >= 0 ? '' : '−'}€{fmt(Math.abs(results.monthlyNetProfit))}
            </span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Break-Even</span>
            <span className="metric-value">
              {isFinite(results.breakEvenCustomers) ? results.breakEvenCustomers : '∞'} customers/mo
            </span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Customer LTV</span>
            <span className="metric-value">€{fmt(results.ltv)}</span>
          </div>
          <div className={`metric-card${results.ltvCacRatio >= 3 ? ' highlight' : ''}`}>
            <span className="metric-label">LTV : CAC</span>
            <span className="metric-value">{fmtDec(results.ltvCacRatio)} : 1</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">CAC Payback</span>
            <span className="metric-value">{fmtDec(results.cacPaybackMonths)} months</span>
          </div>
        </div>

        <div className="strategy-box">
          <h3>Benchmarks</h3>
          <div className="steps-list">
            <div className={`step-item${results.ltvCacRatio >= 3 ? '' : ''}`}>
              <span className={`step-number${results.ltvCacRatio >= 3 ? '' : ''}`}>
                {results.ltvCacRatio >= 3 ? '✓' : results.ltvCacRatio >= 1 ? '≈' : '✗'}
              </span>
              <p><strong>LTV:CAC ≥ 3:1</strong> — healthy service business benchmark
                (yours: {fmtDec(results.ltvCacRatio)}:1)</p>
            </div>
            <div className="step-item">
              <span className="step-number">
                {results.cacPaybackMonths <= 12 ? '✓' : results.cacPaybackMonths <= 24 ? '≈' : '✗'}
              </span>
              <p><strong>CAC Payback &lt; 12 months</strong> — good cash flow signal
                (yours: {fmtDec(results.cacPaybackMonths)} mo)</p>
            </div>
            <div className="step-item">
              <span className="step-number">
                {results.monthlyNetProfit > 0 ? '✓' : results.monthlyNetProfit === 0 ? '≈' : '✗'}
              </span>
              <p><strong>Positive net profit</strong> at target customer count
                (yours: {results.monthlyNetProfit >= 0 ? '+' : ''}€{fmt(results.monthlyNetProfit)})</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
