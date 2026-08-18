/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, expect, Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const adminEmail = process.env.PLAYWRIGHT_ADMIN_EMAIL
const adminPassword = process.env.PLAYWRIGHT_ADMIN_PASSWORD
const memberEmail = process.env.PLAYWRIGHT_MEMBER_EMAIL
const memberPassword = process.env.PLAYWRIGHT_MEMBER_PASSWORD

type MyFixtures = {
  adminPage: Page
  memberPage: Page
  makeAxeBuilder: () => AxeBuilder
  autoAxe: void
}

async function performLogin(page: Page, email?: string, password?: string) {
  if (!email || !password) {
    throw new Error('PLAYWRIGHT_*_EMAIL/PASSWORD env not set')
  }
  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 30_000 })
}

export const test = base.extend<MyFixtures>({
  adminPage: async ({ page }, use) => {
    if (!adminEmail || !adminPassword) {
      base.skip(!adminEmail || !adminPassword, 'PLAYWRIGHT_ADMIN_EMAIL/PASSWORD env not set')
    }
    await performLogin(page, adminEmail, adminPassword)
    await use(page)
  },
  memberPage: async ({ page }, use) => {
    if (!memberEmail || !memberPassword) {
      base.skip(!memberEmail || !memberPassword, 'PLAYWRIGHT_MEMBER_EMAIL/PASSWORD env not set')
    }
    await performLogin(page, memberEmail, memberPassword)
    await use(page)
  },
  makeAxeBuilder: async ({ page }, use) => {
    const makeAxeBuilder = () =>
      new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .disableRules(['meta-viewport', 'document-title', 'html-has-lang'])
        .exclude('iframe')
    await use(makeAxeBuilder)
  },
  autoAxe: [
    async ({ page, makeAxeBuilder }, use) => {
      await use()
      if (page.url() === 'about:blank') return
      const accessibilityScanResults = await makeAxeBuilder().analyze()
      expect(accessibilityScanResults.violations).toEqual([])
    },
    { auto: true }
  ] // auto: true means it runs for every test that requires it, or we can just make it auto for all?
})

export { expect }
