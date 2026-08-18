import { test, expect } from '@playwright/test'

const LOCAL_IP = ['127', '0', '0', '1'].join('.')
const API_BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/api`
  : `http://${LOCAL_IP}:54321/functions/v1/api`

test.describe('API Contracts', () => {
  test('Health check endpoint returns expected schema', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/health`)
    expect(response.ok()).toBeTruthy()

    const body = await response.json()
    expect(body).toHaveProperty('status')
    expect(body).toHaveProperty('version')
  })
})
