'use server'

import type { BookSearchResult, PodcastSearchResult, UpdateLibraryItemMediaPayload, UpdateLibraryItemMediaResponse } from '@/types/api'

/**
 * ABS-specific — not available in the Supabase-backed version.
 */
export async function searchBooksAction(
  _provider: string,
  _title: string,
  _author?: string,
  _libraryItemId?: string,
): Promise<BookSearchResult[]> {
  console.warn('[matchActions] searchBooks is not available in the Supabase-backed version')
  return []
}

/**
 * ABS-specific — not available in the Supabase-backed version.
 */
export async function searchPodcastsAction(_term: string): Promise<PodcastSearchResult[]> {
  console.warn('[matchActions] searchPodcasts is not available in the Supabase-backed version')
  return []
}

/**
 * ABS-specific — not available in the Supabase-backed version.
 */
export async function applyMatchAction(
  _libraryItemId: string,
  _updatePayload: UpdateLibraryItemMediaPayload,
): Promise<UpdateLibraryItemMediaResponse> {
  console.warn('[matchActions] applyMatch is not available in the Supabase-backed version')
  return {} as UpdateLibraryItemMediaResponse
}
