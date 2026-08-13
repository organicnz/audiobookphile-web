// Feature-flag/analytics tests with PostHog enabled (real key set before the
// module loads, posthog-js mocked out so nothing touches the network).
process.env.NEXT_PUBLIC_POSTHOG_KEY = 'phc_test_key_123'

import { describe, expect, it, mock } from 'bun:test'

// Simulate a browser so the client-only guards in the lib pass through.
;(globalThis as Record<string, unknown>).window = {}

const mockPosthog = {
  getFeatureFlag: (key: string) => {
    if (key === 'passkey_2fa') return false
    return true
  },
  capture: mock((event: string, properties?: Record<string, unknown>) => ({ event, properties })),
  identify: mock((id: string) => id),
  reset: mock(() => {})
}

mock.module('posthog-js', () => ({
  default: mockPosthog,
  __esModule: true
}))

mock.module('posthog-js/react', () => ({
  usePostHog: () => mockPosthog,
  PostHogProvider: ({ children }: { children: unknown }) => children,
  __esModule: true
}))

describe('analytics with PostHog enabled', () => {
  it('reads kill-switch flags from posthog', async () => {
    const { getFeatureFlag } = await import('../shared/lib/analytics')
    expect(getFeatureFlag('passkey_2fa', true)).toBe(false)
    expect(getFeatureFlag('brand_new_flag', false)).toBe(true)
  })

  it('forwards capture/identify/reset to posthog', async () => {
    const { capture, identifyUser, resetAnalytics } = await import('../shared/lib/analytics')
    capture('playback_started', { libraryId: 'lib_1' })
    expect(mockPosthog.capture).toHaveBeenCalledWith('playback_started', { libraryId: 'lib_1' })

    identifyUser('user_123', { username: 'listener' })
    expect(mockPosthog.identify).toHaveBeenCalledWith('user_123', { username: 'listener' })

    resetAnalytics()
    expect(mockPosthog.reset).toHaveBeenCalled()
  })
})
