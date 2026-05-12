/**
 * Batch cover fetch script
 * Run: node scripts/batch-fetch-covers.mjs
 *
 * Fetches cover art for all library items missing cover_path
 * from Open Library and Google Books, uploads to Supabase Storage.
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://iambzzclljayqdxkeepy.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhbWJ6emNsbGpheXFkeGtlZXB5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY3MjQyNywiZXhwIjoyMDkzMjQ4NDI3fQ.Pf4J6FPQqPRt6CqsxKNtjJuuWU58Fd-zQ4bwDQ-EOII'

const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
})

async function fetchFromOpenLibrary(title, author) {
  try {
    const query = new URLSearchParams({ title, limit: '5' })
    if (author) query.set('author', author)
    const res = await fetch(`https://openlibrary.org/search.json?${query}`, {
      signal: AbortSignal.timeout(8000)
    })
    if (!res.ok) return null
    const data = await res.json()
    const withCover = (data?.docs || []).find(d => d.cover_i)
    if (!withCover?.cover_i) return null

    const imgRes = await fetch(`https://covers.openlibrary.org/b/id/${withCover.cover_i}-L.jpg`, {
      signal: AbortSignal.timeout(10000)
    })
    if (!imgRes.ok) return null
    const ct = imgRes.headers.get('content-type') ?? ''
    if (!ct.includes('jpeg') && !ct.includes('jpg')) return null
    const buf = await imgRes.arrayBuffer()
    return buf.byteLength > 5000 ? buf : null
  } catch { return null }
}

async function fetchFromGoogleBooks(title, author) {
  try {
    const q = author ? `intitle:${title}+inauthor:${author}` : `intitle:${title}`
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=5&printType=books`,
      { signal: AbortSignal.timeout(8000) }
    )
    if (!res.ok) return null
    const data = await res.json()
    const withImg = (data?.items || []).find(i => i.volumeInfo?.imageLinks?.thumbnail)
    if (!withImg) return null
    let url = withImg.volumeInfo.imageLinks.extraLarge ||
              withImg.volumeInfo.imageLinks.large ||
              withImg.volumeInfo.imageLinks.thumbnail
    url = url.replace('http://', 'https://').replace('&edge=curl', '')
    const imgRes = await fetch(url, { signal: AbortSignal.timeout(10000) })
    if (!imgRes.ok) return null
    const buf = await imgRes.arrayBuffer()
    return buf.byteLength > 5000 ? buf : null
  } catch { return null }
}

async function fetchCover(title, author) {
  const ol = await fetchFromOpenLibrary(title, author)
  if (ol) return ol
  return fetchFromGoogleBooks(title, author)
}

async function main() {
  // Get all items missing cover_path
  const { data: items, error } = await db
    .from('library_items')
    .select('id, title, author_names_first_last')
    .is('cover_path', null)
    .not('title', 'is', null)

  if (error) { console.error('Failed to fetch items:', error.message); process.exit(1) }
  console.log(`Found ${items.length} items missing covers`)

  let success = 0, failed = 0, skipped = 0

  for (const item of items) {
    const title = item.title?.trim()
    if (!title || title.length < 3) { skipped++; continue }

    // Skip items that look like folder names or non-book titles
    if (/^Book \d+$/.test(title) || /^\[AB\]/.test(title)) { skipped++; continue }

    const author = item.author_names_first_last?.split('/')[0]?.trim() || undefined
    process.stdout.write(`  Fetching: "${title.slice(0, 50)}"... `)

    const buf = await fetchCover(title, author)
    if (!buf) {
      console.log('not found')
      failed++
      continue
    }

    const storagePath = `${item.id}/cover.jpg`
    const { error: uploadErr } = await db.storage
      .from('covers')
      .upload(storagePath, buf, { upsert: true, contentType: 'image/jpeg' })

    if (uploadErr) {
      console.log(`upload failed: ${uploadErr.message}`)
      failed++
      continue
    }

    const { error: updateErr } = await db
      .from('library_items')
      .update({ cover_path: storagePath })
      .eq('id', item.id)

    if (updateErr) {
      console.log(`db update failed: ${updateErr.message}`)
      failed++
    } else {
      console.log('✓')
      success++
    }

    // Rate limit: 1 request per 500ms to be polite to APIs
    await new Promise(r => setTimeout(r, 500))
  }

  console.log(`\nDone: ${success} covers saved, ${failed} failed, ${skipped} skipped`)
}

main().catch(console.error)
