/**
 * Example usage of Sentry integration utilities
 *
 * This file demonstrates how to use the Sentry utilities throughout your application.
 * You can copy these patterns into your actual components and services.
 */

import {
  setSentryUser,
  clearSentryUser,
  trackUserAction,
  trackNavigation,
  trackApiCall,
  captureError,
  trackPerformance,
  measurePerformance,
  withSentryTracking
} from './sentry'

// =============================================================================
// 1. User Authentication Tracking
// =============================================================================

export function exampleUserAuthentication() {
  // After successful login
  setSentryUser({
    id: 'user-123',
    email: 'user@example.com',
    username: 'johndoe'
  })

  // On logout
  clearSentryUser()
}

// =============================================================================
// 2. Track User Actions (Breadcrumbs)
// =============================================================================

export function exampleUserActions() {
  // Track when user plays an audiobook
  trackUserAction('play_audiobook', {
    audiobookId: 'book-123',
    chapterIndex: 0,
    position: 0
  })

  // Track when user creates a bookmark
  trackUserAction('create_bookmark', {
    audiobookId: 'book-123',
    position: 1234567,
    title: 'Important part'
  })

  // Track when user changes settings
  trackUserAction('update_settings', {
    setting: 'playbackSpeed',
    value: 1.5
  })
}

// =============================================================================
// 3. Navigation Tracking
// =============================================================================

export function exampleNavigationTracking() {
  // In your router or navigation handler
  trackNavigation('/library', '/audiobook/book-123')
  trackNavigation('/audiobook/book-123', '/settings')
}

// =============================================================================
// 4. API Call Tracking
// =============================================================================

export async function exampleApiTracking() {
  const startTime = performance.now()

  try {
    const response = await fetch('/api/items/item-123')
    const duration = performance.now() - startTime

    // Track successful API call
    trackApiCall('/api/items/item-123', 'GET', response.status, duration)

    return response.json()
  } catch (error) {
    const duration = performance.now() - startTime

    // Track failed API call
    trackApiCall('/api/items/item-123', 'GET', 0, duration)

    // Capture error with context
    captureError(error as Error, {
      tags: {
        component: 'ItemsList',
        operation: 'fetchItem'
      },
      extra: {
        itemId: 'item-123',
        duration
      },
      fingerprint: ['api-error', 'items-fetch'] // Group similar errors
    })

    throw error
  }
}

// =============================================================================
// 5. Performance Monitoring
// =============================================================================

export async function examplePerformanceTracking() {
  // Method 1: Manual tracking
  const startTime = performance.now()
  await someExpensiveOperation()
  const duration = performance.now() - startTime

  // Track performance metric using trackPerformance
  trackPerformance('expensive_operation', duration, 'millisecond')

  // Method 2: Automatic tracking with wrapper
  const result = await measurePerformance('load_audiobook_metadata', async () => {
    const response = await fetch('/api/metadata/book-123')
    return response.json()
  })

  return result
}

async function someExpensiveOperation() {
  // Simulate expensive operation
  await new Promise((resolve) => setTimeout(resolve, 1000))
}

// =============================================================================
// 6. Error Handling with Context
// =============================================================================

export function exampleErrorHandling() {
  try {
    // Some operation that might fail
    throw new Error('Failed to load audiobook')
  } catch (error) {
    // Capture with rich context
    captureError(error as Error, {
      tags: {
        component: 'AudioPlayer',
        feature: 'playback'
      },
      extra: {
        audiobookId: 'book-123',
        chapterIndex: 5,
        position: 1234567,
        networkStatus: 'online'
      },
      fingerprint: ['playback-error', 'book-123'] // Group by audiobook
    })

    // Still throw or handle the error
    throw error
  }
}

// =============================================================================
// 7. Higher-Order Component for Automatic Error Tracking
// =============================================================================

import React from 'react'

// Example component
const AudiobookPlayer: React.FC<{ bookId: string }> = ({ bookId }) => {
  return (
    <div>
      <h1>Playing Audiobook {bookId}</h1>
      {/* Player controls */}
    </div>
  )
}

// Wrap component with automatic error tracking
export const TrackedAudiobookPlayer = withSentryTracking(AudiobookPlayer, 'AudiobookPlayer')

// Now any error in AudiobookPlayer will automatically be sent to Sentry
// with the component name tagged

// =============================================================================
// 8. Integration in React Hooks
// =============================================================================

import { useEffect } from 'react'

export function useSentryTracking(audiobookId: string) {
  useEffect(() => {
    // Track when component mounts
    trackUserAction('view_audiobook', { audiobookId })

    // Set user context if needed
    // setSentryUser(currentUser)

    return () => {
      // Track when component unmounts
      trackUserAction('leave_audiobook', { audiobookId })
    }
  }, [audiobookId])
}

// Usage in component
export function AudiobookViewer({ bookId }: { bookId: string }) {
  useSentryTracking(bookId)

  return <div>Audiobook Viewer</div>
}

// =============================================================================
// 9. Integration in API Client
// =============================================================================

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  async get<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const startTime = performance.now()

    try {
      const response = await fetch(url)
      const duration = performance.now() - startTime

      trackApiCall(endpoint, 'GET', response.status, duration)

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      return response.json()
    } catch (error) {
      const duration = performance.now() - startTime
      trackApiCall(endpoint, 'GET', 0, duration)

      captureError(error as Error, {
        tags: { component: 'ApiClient', operation: 'GET' },
        extra: { endpoint, duration }
      })

      throw error
    }
  }
}

// =============================================================================
// 10. Integration in Error Boundaries
// =============================================================================

import { ErrorBoundary } from '../ErrorBoundary'

export function AppRoot() {
  return (
    <ErrorBoundary
      componentName="AppRoot"
      context={{ version: '1.0.0', buildNumber: '123' }}
      onError={({ error, resetErrorBoundaries }) => (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <p>{error.message}</p>
          <button onClick={resetErrorBoundaries}>Try again</button>
        </div>
      )}
    >
      {/* Your app components */}
      <div>Your App</div>
    </ErrorBoundary>
  )
}
