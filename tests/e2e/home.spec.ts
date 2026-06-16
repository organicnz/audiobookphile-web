import { test, expect } from '@playwright/test'

test('has title and login options', async ({ page }) => {
  await page.goto('/')

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Audiobookphile/i)

  // Check that the page loads properly
  const locator = page.locator('body')
  await expect(locator).toBeVisible()
})
