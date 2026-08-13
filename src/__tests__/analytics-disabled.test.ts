// Feature-flag/analytics tests with PostHog disabled (no key) — everything
// must be a silent no-op with the configured fallback values.
process.env.NEXT_PUBLIC_POSTHOG_KEY = ''
process.env.NEXT_PUBLIC_POSTHOG_HOST = ''

import { describe, expect, it, mock } from 'bun:test'

mock.module('posthog-js', () => ({
  default: {
    getFeatureFlag: () => {
      throw new Error('posthog should not be called when disabled')
    },
    capture: () => {
      throw new Error('posthog should not be called when disabled')
    },
    identify: () => {
      throw new Error('posthog should not be called when disabled')
    },
    reset: () => {
      throw new Error('posthog should not be called when disabled')
    }
  },
  __esModule: true
}))

mock.module('posthog-js/react', () => ({
  usePostHog: () => null,
  PostHogProvider: ({ children }: { children: unknown }) => children,
  __esModule: true
}))

describe('analytics with PostHog disabled', () => {
  it('returns fallback for kill-switch and rollout flags', async () => {
    const { getFeatureFlag } = await import('../shared/lib/analytics')
    expect(getFeatureFlag('passkey_2fa', true)).toBe(true)
    expect(getFeatureFlag('brand_new_flag', false)).toBe(false)
  })

  it('never touches posthog for capture/identify/reset', async () => {
    const { capture, identifyUser, resetAnalytics } = await import('../shared/lib/analytics')
    expect(() => {
      capture('playback_started', {})
      identifyUser('user_123')
      resetAnalytics()
    }).not.toThrow()
  })
})
