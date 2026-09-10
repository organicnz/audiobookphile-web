/**
 * Sentry integration utilities for React components.
 *
 * This module provides:
 * - Easy error capturing with context
 * - User identification
 * - Breadcrumb tracking
 * - Performance monitoring helpers
 */

import * as Sentry from '@sentry/nextjs'

import { ErrorBoundary } from '../ErrorBoundary'

/**
 * Set the current user context in Sentry.
 * Call this after authentication.
 */
export function setSentryUser(user: { id: string; email?: string; username?: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username
  })
}

/**
 * Clear user context (call on logout).
 */
export function clearSentryUser() {
  Sentry.setUser(null)
}

/**
 * Add a breadcrumb for user action tracking.
 */
export function addBreadcrumb(message: string, category: string, data?: Record<string, string | number | boolean>) {
  Sentry.addBreadcrumb({
    category,
    message,
    level: 'info',
    data,
    timestamp: Date.now() / 1000
  })
}

/**
 * Track a user action (convenience wrapper).
 */
export function trackUserAction(action: string, details?: Record<string, string | number | boolean>) {
  addBreadcrumb(`User action: ${action}`, 'user', details)
}

/**
 * Track a navigation event.
 */
export function trackNavigation(from: string, to: string) {
  addBreadcrumb(`Navigated from ${from} to ${to}`, 'navigation', { from, to })
}

/**
 * Track an API call.
 */
export function trackApiCall(endpoint: string, method: string, status: number, duration: number) {
  addBreadcrumb(`API call: ${method} ${endpoint}`, 'http', {
    endpoint,
    method,
    status,
    duration
  })
}

/**
 * Capture an error with additional context.
 */
export function captureError(
  error: Error,
  context?: {
    tags?: Record<string, string>
    extra?: Record<string, string | number | boolean | null>
    fingerprint?: string[]
  }
) {
  Sentry.withScope((scope) => {
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value)
      })
    }

    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value)
      })
    }

    if (context?.fingerprint) {
      scope.setFingerprint(context.fingerprint)
    }

    Sentry.captureException(error)
  })
}

/**
 * Track a custom performance metric.
 */
export function trackPerformance(name: string, value: number, unit: 'millisecond' | 'second' | 'minute' = 'millisecond') {
  Sentry.metrics.distribution(name, value, { unit })
}

/**
 * Measure performance of an async operation.
 */
export async function measurePerformance<T>(name: string, operation: () => Promise<T>): Promise<T> {
  const startTime = performance.now()

  try {
    const result = await operation()
    const duration = performance.now() - startTime
    trackPerformance(name, duration, 'millisecond')
    return result
  } catch (error) {
    const duration = performance.now() - startTime
    trackPerformance(`${name}.error`, duration, 'millisecond')
    throw error
  }
}

/**
 * Higher-order component for automatic error tracking.
 */
export function withSentryTracking<P extends object>(Component: React.ComponentType<P>, componentName: string): React.FC<P> {
  const TrackedComponent = (props: P) => {
    return (
      <ErrorBoundary componentName={componentName} context={{ componentName }}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }

  TrackedComponent.displayName = `withSentryTracking(${componentName})`
  return TrackedComponent
}
