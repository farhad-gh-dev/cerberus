import { Component, type ReactNode } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-400">
        <AlertTriangle size={48} className="text-yellow-500 mb-4" />
        <h2 className="text-lg font-semibold text-white">Something went wrong</h2>
        <p className="text-sm mt-2 max-w-md text-center text-zinc-500">
          {this.state.error?.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={this.handleReset}
          className="flex items-center gap-2 mt-6 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <RotateCcw size={16} />
          Try Again
        </button>
      </div>
    )
  }
}
