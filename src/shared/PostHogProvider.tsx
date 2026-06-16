'use client'
import posthog from 'posthog-js'
import { PostHogProvider as CSPostHogProvider } from 'posthog-js/react'

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || 'phc_placeholder', {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'identified_only'
  })
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return <CSPostHogProvider client={posthog}>{children}</CSPostHogProvider>
}
