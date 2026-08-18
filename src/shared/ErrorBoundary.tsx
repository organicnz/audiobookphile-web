'use client'

import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  fallback?: ReactNode
  onError?: (props: { error: Error; resetErrorBoundaries: () => void }) => ReactNode
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, info)
  }

  resetErrorBoundaries = () => {
    this.setState({ error: null })
  }

  render() {
    if (this.state.error && this.props.fallback) {
      return this.props.fallback
    }
    if (this.state.error) {
      return this.props.onError?.({ error: this.state.error, resetErrorBoundaries: this.resetErrorBoundaries })
    }
    return this.props.children
  }
}
