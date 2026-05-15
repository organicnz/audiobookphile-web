'use server'

import type { BookSearchResult, PodcastSearchResult } from '@/types/api'

/**
 * Fetch book metadata from Open Library and Google Books.
 */
export async function fetchBookMetadata(title: string, author: string, _provider: string): Promise<BookSearchResult[]> {
  try {
    const results: BookSearchResult[] = []

    // Open Library search
    const query = new URLSearchParams({ title, limit: '5' })
    if (author) query.set('author', author)
    const olRes = await fetch(`https://openlibrary.org/search.json?${query.toString()}`, {
      signal: AbortSignal.timeout(8000),
    })
    if (olRes.ok) {
      const data = await olRes.json()
      const docs = (data?.docs as any[]) || []
      for (const doc of docs.slice(0, 5)) {
        const authorNames: string[] = doc.author_name || []
        results.push({
          title: doc.title || title,
          author: authorNames[0] || author || '',
          description: doc.first_sentence?.value || '',
          cover: doc.cover_i
            ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
            : undefined,
          series: [],
          genres: doc.subject?.slice(0, 3) || [],
          tags: [],
          isbn: doc.isbn?.[0] || undefined,
          asin: undefined,
          language: doc.language?.[0] || undefined,
          publisher: doc.publisher?.[0] || undefined,
          publishedYear: doc.first_publish_year ? String(doc.first_publish_year) : undefined,
          narrator: undefined,
          explicit: false,
          abridged: false,
        })
      }
    }

    // Google Books search (if Open Library returned nothing)
    if (results.length === 0) {
      const q = author ? `intitle:${title}+inauthor:${author}` : `intitle:${title}`
      const gbRes = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=5&printType=books`,
        { signal: AbortSignal.timeout(8000) }
      )
      if (gbRes.ok) {
        const data = await gbRes.json()
        const items = (data?.items as any[]) || []
        for (const item of items.slice(0, 5)) {
          const info = item.volumeInfo || {}
          const thumbnail = info.imageLinks?.thumbnail?.replace('http://', 'https://') || undefined
          results.push({
            title: info.title || title,
            author: info.authors?.[0] || author || '',
            description: info.description || '',
            cover: thumbnail,
            series: [],
            genres: info.categories?.slice(0, 3) || [],
            tags: [],
            isbn: info.industryIdentifiers?.find((i: any) => i.type === 'ISBN_13')?.identifier || undefined,
            asin: undefined,
            language: info.language || undefined,
            publisher: info.publisher || undefined,
            publishedYear: info.publishedDate?.slice(0, 4) || undefined,
            narrator: undefined,
            explicit: false,
            abridged: false,
          })
        }
      }
    }

    return results
  } catch (err) {
    console.error('[upload/actions] fetchBookMetadata failed:', err)
    return []
  }
}

export async function fetchPodcastMetadata(_title: string): Promise<PodcastSearchResult[]> {
  // Podcast metadata fetching not implemented yet
  return []
}

export async function getCookie(): Promise<string> {
  // Returns the Supabase session access token for authenticating upload requests
  const { createClient } = await import('@/utils/supabase/server')
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ?? ''
}
