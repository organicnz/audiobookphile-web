'use client'
import posthog from 'posthog-js'
import { PostHogProvider as CSPostHogProvider } from 'posthog-js/react'

const isValidPostHogKey = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_KEY &&
    process.env.NEXT_PUBLIC_POSTHOG_KEY !== 'phc_placeholder' &&
    !process.env.NEXT_PUBLIC_POSTHOG_KEY.includes('placeholder')
)

if (typeof window !== 'undefined' && isValidPostHogKey) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'identified_only'
  })
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  if (!isValidPostHogKey) {
    return <>{children}</>
  }
  return <CSPostHogProvider client={posthog}>{children}</CSPostHogProvider>
}
