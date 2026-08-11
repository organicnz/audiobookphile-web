import { test, expect } from '@playwright/test'

/**
 * P3.2 — full admin flow smoke.
 *
 * Runs against the live environment (NEXT_PUBLIC_SITE_URL, default localhost
 * port 3000). Requires seeded test credentials in env:
 *   PLAYWRIGHT_ADMIN_EMAIL / PLAYWRIGHT_ADMIN_PASSWORD
 *   PLAYWRIGHT_MEMBER_EMAIL / PLAYWRIGHT_MEMBER_PASSWORD
 * Skipped (soft) when credentials are absent so CI without seeds stays green.
 */

const adminEmail = process.env.PLAYWRIGHT_ADMIN_EMAIL
const adminPassword = process.env.PLAYWRIGHT_ADMIN_PASSWORD
const memberEmail = process.env.PLAYWRIGHT_MEMBER_EMAIL
const memberPassword = process.env.PLAYWRIGHT_MEMBER_PASSWORD

async function login(page: import('@playwright/test').Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  // Login redirects via window.location; wait until we leave the login page.
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 30_000 })
}

test.describe('admin flow (seeded credentials required)', () => {
  test.skip(!adminEmail || !adminPassword || !memberEmail || !memberPassword, 'PLAYWRIGHT_*_EMAIL/PASSWORD env not set')

  test('admin logs in and sees analytics grid + invite panel on /admin', async ({ page }) => {
    await login(page, adminEmail!, adminPassword!)

    await page.goto('/admin')
    await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'System Analytics' })).toBeVisible()
    // Telemetry grid renders (real values or "—", never fabricated numbers).
    await expect(page.getByRole('heading', { name: 'Total Users' })).toBeVisible()
    // Invite panel is present for admins.
    await expect(page.locator('#invite-email')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Invite User' })).toBeVisible()
  })

  test('member is redirected away from /admin and /settings/analytics', async ({ page }) => {
    await login(page, memberEmail!, memberPassword!)

    await page.goto('/admin')
    await page.waitForURL((url) => !url.pathname.startsWith('/admin'))

    await page.goto('/settings/analytics')
    await page.waitForURL((url) => !url.pathname.startsWith('/settings/analytics'))

    // Member can never reach the invite panel.
    await expect(page.locator('#invite-email')).toHaveCount(0)
  })
})
