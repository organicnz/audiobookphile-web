'use server'

import { fetchBookCover } from '@/lib/coverFetch'
import { uploadCover } from '@/lib/supabase-api'
import type { BookSearchResult, PodcastSearchResult, UpdateLibraryItemMediaPayload, UpdateLibraryItemMediaResponse } from '@/types/api'
import type { Database } from '@/types/supabase'
import { createServiceRoleClient } from '@/utils/supabase/service-role'

/**
 * Search for book metadata using Open Library and Google Books.
 */
export async function searchBooksAction(
  _provider: string,
  title: string,
  author?: string,
  _libraryItemId?: string,
): Promise<BookSearchResult[]> {
  const results: BookSearchResult[] = []

  try {
    // Open Library
    const query = new URLSearchParams({ title, limit: '8' })
    if (author) query.set('author', author)
    const olRes = await fetch(`https://openlibrary.org/search.json?${query}`, {
      signal: AbortSignal.timeout(8000),
    })
    if (olRes.ok) {
      const data = await olRes.json()
      for (const doc of (data?.docs || []).slice(0, 8)) {
        results.push({
          title: doc.title || title,
          author: doc.author_name?.[0] || author || '',
          description: doc.first_sentence?.value || '',
          cover: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : undefined,
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
  } catch (err) {
    console.error('[matchActions] searchBooks OL failed:', err)
  }

  // Google Books fallback / supplement
  if (results.length < 4) {
    try {
      const q = author ? `intitle:${title}+inauthor:${author}` : `intitle:${title}`
      const gbRes = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=8&printType=books`,
        { signal: AbortSignal.timeout(8000) }
      )
      if (gbRes.ok) {
        const data = await gbRes.json()
        for (const item of (data?.items || []).slice(0, 8)) {
          const info = item.volumeInfo || {}
          const thumbnail = info.imageLinks?.thumbnail?.replace('http://', 'https://') || null
          results.push({
            title: info.title || title,
            author: info.authors?.[0] || author || '',
            description: info.description || '',
            cover: thumbnail || undefined,
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
    } catch (err) {
      console.error('[matchActions] searchBooks GB failed:', err)
    }
  }

  return results.slice(0, 12)
}

export async function searchPodcastsAction(_term: string): Promise<PodcastSearchResult[]> {
  return []
}

/**
 * Apply matched metadata to a library item — updates books table and optionally fetches cover.
 */
export async function applyMatchAction(
  libraryItemId: string,
  updatePayload: UpdateLibraryItemMediaPayload,
): Promise<UpdateLibraryItemMediaResponse> {
  const db = createServiceRoleClient()

  try {
    // Get the book ID for this library item
    const { data: item } = await db
      .from('library_items')
      .select('media_id, title')
      .eq('id', libraryItemId)
      .single()

    if (!item?.media_id) throw new Error('Library item has no associated book')

    const bookId = item.media_id
    const metadata = updatePayload.metadata || {}

    // Update books table
    const bookUpdate: Database['public']['Tables']['books']['Update'] = {}
    if (metadata.title) bookUpdate.title = metadata.title
    if (metadata.subtitle) bookUpdate.subtitle = metadata.subtitle
    if (metadata.description) bookUpdate.description = metadata.description
    if (metadata.isbn) bookUpdate.isbn = metadata.isbn
    if (metadata.asin) bookUpdate.asin = metadata.asin
    if (metadata.publisher) bookUpdate.publisher = metadata.publisher
    if (metadata.publishedYear) bookUpdate.published_year = metadata.publishedYear
    if (metadata.language) bookUpdate.language = metadata.language
    if (metadata.explicit !== undefined) bookUpdate.explicit = metadata.explicit
    if (metadata.abridged !== undefined) bookUpdate.abridged = metadata.abridged
    if (metadata.genres?.length) bookUpdate.genres = metadata.genres
    if (metadata.tags?.length) bookUpdate.tags = metadata.tags

    if (Object.keys(bookUpdate).length > 0) {
      await db.from('books').update(bookUpdate).eq('id', bookId)
    }

    // Update library_items title
    if (metadata.title) {
      await db.from('library_items').update({ title: metadata.title }).eq('id', libraryItemId)
    }

    // Handle authors
    if (metadata.authors?.length) {
      // Remove existing book_authors
      await db.from('book_authors').delete().eq('book_id', bookId)

      for (const authorData of metadata.authors) {
        const authorName = (typeof authorData === 'string' ? authorData : authorData.name) || ''
        if (!authorName) continue

        const { data: existing } = await db
          .from('authors')
          .select('id')
          .eq('name', authorName)
          .maybeSingle()

        let authorId = existing?.id
        if (!authorId) {
          authorId = crypto.randomUUID()
          await db.from('authors').insert({ id: authorId, name: authorName })
        }
        await db.from('book_authors').insert({ book_id: bookId, author_id: authorId })
      }

      const authorNames = metadata.authors.map((a: any) => (typeof a === 'string' ? a : a.name)).filter(Boolean).join(', ')
      await db.from('library_items').update({ author_names_first_last: authorNames }).eq('id', libraryItemId)
    }

    // Handle series
    if (metadata.series?.length) {
      await db.from('book_series').delete().eq('book_id', bookId)

      const { data: libItem } = await db.from('library_items').select('library_id').eq('id', libraryItemId).single()
      const libraryId = libItem?.library_id

      for (const s of metadata.series) {
        const seriesName = (typeof s === 'string' ? s : s.name) || ''
        if (!seriesName) continue

        const { data: existing } = await db
          .from('series')
          .select('id')
          .eq('name', seriesName)
          .eq('library_id', libraryId ?? '')
          .maybeSingle()

        let seriesId = existing?.id
        if (!seriesId) {
          seriesId = crypto.randomUUID()
          await db.from('series').insert({ id: seriesId, name: seriesName, library_id: libraryId })
        }
        await db.from('book_series').insert({ book_id: bookId, series_id: seriesId, sequence: s.sequence || null })
      }
    }

    // Fetch and save cover if provided
    if (updatePayload.cover) {
      try {
        const imgRes = await fetch(updatePayload.cover, { signal: AbortSignal.timeout(10000) })
        if (imgRes.ok) {
          const buf = await imgRes.arrayBuffer()
          if (buf.byteLength > 1000) {
            const contentType = imgRes.headers.get('content-type') || 'image/jpeg'
            const extension = contentType.split('/')[1]?.split('+')[0] || 'jpg'
            await uploadCover(libraryItemId, buf, { extension, contentType })
          }
        }
      } catch (err) {
        console.warn('[matchActions] cover fetch failed:', err)
      }
    } else if (metadata.title) {
      // Auto-fetch cover if none provided
      const authorData = metadata.authors?.[0]
      const authorName = (typeof authorData === 'string' ? authorData : authorData?.name) || undefined
      const fetched = await fetchBookCover(metadata.title, authorName)
      if (fetched) await uploadCover(libraryItemId, fetched.buffer, { extension: fetched.extension, contentType: fetched.contentType })
    }

    return { updated: true } as UpdateLibraryItemMediaResponse
  } catch (err) {
    console.error('[matchActions] applyMatch failed:', err)
    throw err
  }
}
