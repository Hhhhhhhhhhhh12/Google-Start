import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught error:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="panel form-panel" role="alert" style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Something went wrong</h2>
          <p className="helper-text">{this.state.error.message}</p>
          <button
            className="btn-primary"
            onClick={() => this.setState({ error: null })}
          >
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
