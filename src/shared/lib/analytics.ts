'use client'

// ---------------------------------------------------------------------------
// Single facade for PostHog product analytics and feature flags.
//
// Every analytics call in the app goes through this module so that event
// names stay in one schema, the tracker can be swapped, and everything is a
// silent no-op when PostHog is not configured (local dev, CI, previews).
//
// Event names follow snake_case per the observability standard and are shared
// across web and mobile: playback_started, playback_paused, book_completed,
// download_completed, search_performed, auth_failed, ...
// ---------------------------------------------------------------------------

import { useEffect, useState } from 'react'
import { usePostHog } from 'posthog-js/react'
import posthog from 'posthog-js'

/** Whether PostHog is configured for this build (evaluated at module load). */
export const posthogEnabled = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_KEY &&
    process.env.NEXT_PUBLIC_POSTHOG_KEY !== 'phc_placeholder' &&
    !process.env.NEXT_PUBLIC_POSTHOG_KEY.includes('placeholder')
)

/**
 * Live re-check of the same condition, used at call time so no-op behavior is
 * deterministic per environment (and testable without module-cache tricks).
 */
function isPostHogEnabled(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_POSTHOG_KEY &&
      process.env.NEXT_PUBLIC_POSTHOG_KEY !== 'phc_placeholder' &&
      !process.env.NEXT_PUBLIC_POSTHOG_KEY.includes('placeholder')
  )
}

/** Emits a product event. No-op when PostHog is disabled. */
export function capture(event: string, properties?: Record<string, unknown>): void {
  if (!isPostHogEnabled() || typeof window === 'undefined') return
  posthog.capture(event, properties)
}

/** Associates the current person with a known user ID. No-op when disabled. */
export function identifyUser(userId: string, traits?: Record<string, unknown>): void {
  if (!isPostHogEnabled() || typeof window === 'undefined') return
  posthog.identify(userId, traits)
}

/** Forgets the current person (logout). No-op when disabled. */
export function resetAnalytics(): void {
  if (!isPostHogEnabled() || typeof window === 'undefined') return
  posthog.reset()
}

/**
 * Synchronous flag read. `fallback` is returned when PostHog is disabled or
 * the flag is unknown — use `fallback = true` for kill-switch flags and
 * `fallback = false` for progressive-rollout flags.
 */
export function getFeatureFlag(key: string, fallback = false): boolean {
  if (!isPostHogEnabled() || typeof window === 'undefined') return fallback
  const raw = posthog.getFeatureFlag(key)
  return raw == null ? fallback : Boolean(raw)
}

/**
 * Reactive flag hook that stays in sync with remote flag reloads.
 * Falls back to `fallback` while unknown.
 */
export function useFeatureFlag(key: string, fallback = false): boolean {
  const posthogClient = usePostHog()
  const [value, setValue] = useState<boolean>(() => getFeatureFlag(key, fallback))

  useEffect(() => {
    if (!isPostHogEnabled()) return
    const read = () => {
      const raw = posthogClient.getFeatureFlag(key)
      return raw == null ? fallback : Boolean(raw)
    }
    setValue(read())
    const unsubscribe = posthogClient.onFeatureFlags(() => setValue(read()))
    return () => unsubscribe?.()
  }, [key, fallback, posthogClient])

  return value
}

/** Emits the standard auth_failed event for a login/verification failure. */
export function captureAuthFailure(method: string, reason: string): void {
  capture('auth_failed', { method, reason })
}

/** Emits the standard auth_succeeded event. */
export function captureAuthSuccess(method: string): void {
  capture('auth_succeeded', { method })
}
