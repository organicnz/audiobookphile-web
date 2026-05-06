'use client'

import { useEffect } from 'react'
import Btn from '@/components/ui/Btn'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-6 text-center">
      <div className="mb-8">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-error/10 mb-4">
          <svg className="h-10 w-10 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold mb-2">Something went wrong</h1>
        <p className="text-foreground-muted max-w-md mx-auto">
          An unexpected error occurred. We&apos;ve been notified and are looking into it.
        </p>
      </div>

      <div className="flex gap-4">
        <Btn onClick={() => reset()} className="px-8 py-2">
          Try Again
        </Btn>
        <Btn onClick={() => { window.location.href = '/' }} color="bg-black-400" className="px-8 py-2">
          Go Home
        </Btn>
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-12 p-4 bg-black/20 rounded-lg text-left max-w-2xl overflow-auto text-xs font-mono">
          <p className="text-error font-bold mb-2">Debug Info:</p>
          <pre>{error.stack}</pre>
        </div>
      )}
    </div>
  )
}
