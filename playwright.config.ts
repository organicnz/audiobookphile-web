import { defineConfig, devices } from '@playwright/test'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000', // dev-only fallback
    trace: 'on-first-retry'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],

  webServer: {
    command: 'bun run dev',
    // When testing a deployed preview (CI), wait on the remote URL instead of
    // booting a local dev server; reuseExistingServer skips the launch since
    // the remote site answers.
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000', // dev-only fallback
    reuseExistingServer: true,
    timeout: 120_000
  }
})
