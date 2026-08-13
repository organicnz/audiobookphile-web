'use client'
import posthog from 'posthog-js'
import { PostHogProvider as CSPostHogProvider } from 'posthog-js/react'
import { posthogEnabled } from '@/shared/lib/analytics'

if (typeof window !== 'undefined' && posthogEnabled) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'identified_only'
  })
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  if (!posthogEnabled) {
    return <>{children}</>
  }
  return <CSPostHogProvider client={posthog}>{children}</CSPostHogProvider>
}
