import { readFileSync, existsSync } from 'node:fs'
import { chromium } from '@playwright/test'

function loadEnvFile(filePath) {
  const env = {}
  if (!existsSync(filePath)) return env
  for (const line of readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    let value = trimmed.slice(idx + 1)
    if (value.length >= 2 && ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))) {
      value = value.slice(1, -1)
    }
    env[trimmed.slice(0, idx)] = value
  }
  return env
}

const env = loadEnvFile('/Users/organic/dev/work/audiobookphile/audiobookphile-web/.env.local')
const url = env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_SERVICE_KEY
const site = 'https://audiobookphile.vercel.app'
const login = 'abp' + Date.now().toString()
const domain = '1secmail.com'
const email = `${login}@${domain}`
const password = 'ResetTest123!'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' }
async function api(path, opts = {}) {
  const res = await fetch(path, opts)
  const text = await res.text()
  let body
  try { body = JSON.parse(text) } catch { body = text }
  return { status: res.status, body }
}

const created = await api(`${url}/auth/v1/admin/users`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { username: 'mailprobe' } })
})
const userId = created.body?.id
if (!userId) { console.log('CREATE FAILED:', created.status, JSON.stringify(created.body)); process.exit(1) }
console.log('user:', email, userId)

for (const [name, endpoint, body] of [
  ['forgot-password', '/api/auth/forgot-password', { email }],
  ['magic-link', '/api/auth/magic-link', { email, redirectTo: `${site}/auth/callback?next=/library` }]
]) {
  const res = await api(`${site}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  console.log(name, '=>', res.status, JSON.stringify(res.body))
}

let messages = []
for (let i = 0; i < 14; i++) {
  await sleep(12000)
  try {
    const inbox = await api(`https://www.1secmail.com/api/v1/?action=getMessages&login=${login}&domain=${domain}`)
    const msgs = Array.isArray(inbox.body) ? inbox.body : []
    for (const msg of msgs) {
      if (messages.some((m) => m.id === msg.id)) continue
      const full = await api(`https://www.1secmail.com/api/v1/?action=readMessage&login=${login}&domain=${domain}&id=${msg.id}`)
      const html = full.body?.htmlBody ? Buffer.from(full.body.htmlBody, 'base64').toString() : ''
      const text = full.body?.textBody ? Buffer.from(full.body.textBody, 'base64').toString() : ''
      const links = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1])
      messages.push({ id: msg.id, subject: full.body?.subject, links })
      console.log('EMAIL:', msg.id, full.body?.subject)
      console.log('LINKS:', JSON.stringify(links))
    }
    if (messages.length >= 2) break
  } catch (e) { /* transient */ }
}

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext()

for (const msg of messages) {
  const href = msg.links[0]
  if (!href) continue
  console.log('\nREPLAY:', href.slice(0, 170))
  const page = await context.newPage()
  const resp = await page.goto(href, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch((e) => String(e).slice(0, 100))
  if (typeof resp !== 'string') {
    console.log('FINAL URL:', page.url())
    const cookies = (await context.cookies()).filter((c) => c.name.includes('sb-')).map((c) => c.name)
    console.log('sb cookies:', cookies.length > 0 ? 'PRESENT' : 'NONE')
    if (page.url().includes('/reset-password')) console.log('>>> RECOVERY OK: reset-password page reached')
    if (page.url().includes('/library')) console.log('>>> MAGIC LINK OK: /library reached')
    if (page.url().includes('auth-code-error')) console.log('>>> ERROR PAGE (auth-code-error)')
  } else {
    console.log('goto error:', resp)
  }
  await page.close()
}

await browser.close()
await api(`${url}/auth/v1/admin/users/${userId}`, { method: 'DELETE', headers }).catch(() => {})
console.log('CLEANUP DONE')
