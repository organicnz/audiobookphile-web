'use server'

import type { BookSearchResult, PodcastSearchResult } from '@/types/api'

/**
 * Fetch book metadata from Open Library and Google Books.
 */
export async function fetchBookMetadata(title: string, author: string, _provider: string): Promise<BookSearchResult[]> {
  try {
    const { apiRequest } = await import('@/shared/lib/api/client')
    const data = await apiRequest<{ results: BookSearchResult[] }>('/api/metadata/match-book', {
      method: 'POST',
      body: JSON.stringify({ title, author })
    })
    return data?.results || []
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
  const { createClient } = await import('@/shared/utils/supabase/server')
  const supabase = await createClient()
  const {
    data: { session }
  } = await supabase.auth.getSession()
  return session?.access_token ?? ''
}

export async function checkExistingBook(title: string, author: string, libraryId: string, mediaType: string): Promise<string | undefined> {
  try {
    const { checkExistingBook: apiCheckExistingBook } = await import('@/shared/lib/api/items')
    const { mediaId } = await apiCheckExistingBook(title, author, libraryId, mediaType)
    return mediaId || undefined
  } catch (err) {
    console.error('[upload/actions] checkExistingBook failed:', err)
    return undefined
  }
}
