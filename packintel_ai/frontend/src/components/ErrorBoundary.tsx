import React, { ReactNode } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import NeonButton from './ui/NeonButton'
import GlassCard from './ui/GlassCard'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-background">
          <GlassCard className="max-w-md p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-neon-red/40 mx-auto mb-4" />
            <h2 className="font-display font-bold text-xl text-text-primary mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-text-secondary mb-6">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <NeonButton
              variant="cyan"
              onClick={() => window.location.reload()}
              className="w-full"
            >
              <RotateCcw className="w-4 h-4" />
              Reload Page
            </NeonButton>
            <button
              onClick={() => window.location.href = '/'}
              className="mt-3 text-xs text-neon-cyan hover:text-neon-cyan/70 transition-colors"
            >
              ← Return to Home
            </button>
          </GlassCard>
        </div>
      )
    }

    return this.props.children
  }
}
