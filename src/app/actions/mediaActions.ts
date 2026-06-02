'use server'

import { getLibraryItem } from '@/lib/api'
import type { UpdateLibraryItemMediaPayload } from '@/types/api'
import { apiRequest } from '@/lib/api'
import { revalidatePath } from 'next/cache'

export async function toggleFinishedAction(
  libraryItemId: string,
  params: { isFinished: boolean; episodeId?: string },
) {
  return await apiRequest(`/api/me/progress/${libraryItemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ isFinished: params.isFinished, episodeId: params.episodeId })
  })
}

export async function batchUpdateMediaFinishedAction(
  payload: { libraryItemId: string; episodeId?: string; isFinished: boolean }[],
) {
  return await apiRequest('/api/me/progress-batch', {
    method: 'PATCH',
    body: JSON.stringify({ items: payload })
  })
}

/**
 * Update library item metadata (title, author, description, etc.)
 * Delegates to applyMatchAction logic.
 */
export async function updateLibraryItemMediaAction(
  libraryItemId: string,
  payload: UpdateLibraryItemMediaPayload,
) {
  const { applyMatchAction } = await import('@/app/actions/matchActions')
  return applyMatchAction(libraryItemId, payload)
}

/**
 * Rescan a library item — re-fetches metadata and cover from providers.
 */
export async function rescanLibraryItemAction(libraryItemId: string) {
  // This is a complex DB/Storage flow that we can migrate to an Edge Function
  // For now, let's just trigger a re-fetch and cover update
  const { fetchBookCover } = await import('@/lib/coverFetch')
  const { autoFetchCoverAction } = await import('@/app/actions/coverActions')
  
  // We'd need to fetch the item title first.
  const item = await getLibraryItem(libraryItemId)
  if (!item?.media?.metadata?.title) return { result: 'UPTODATE' }
  
  const title = item.media.metadata.title
  const author = (item.media.metadata as any).authorName || (item.media.metadata as any).author

  await autoFetchCoverAction(libraryItemId, title, author)
  return { result: 'UPDATED' }
}

export async function sendEbookToDeviceAction(_payload: { libraryItemId: string; deviceName: string }) {
  // Not applicable in Supabase-backed version (no local filesystem)
  return null
}

/**
 * Remove a series from the Continue Listening shelf by marking all
 * in-progress items in that series as finished.
 */
export async function removeSeriesFromContinueListeningAction(seriesId: string) {
  return await apiRequest(`/api/me/progress/series/${seriesId}`, {
    method: 'DELETE'
  })
}

/**
 * Remove a single item from Continue Listening by marking it finished.
 */
export async function removeFromContinueListeningAction(progressId: string) {
  return await apiRequest(`/api/me/progress/id/${progressId}`, {
    method: 'PATCH',
    body: JSON.stringify({ isFinished: true })
  })
}

/**
 * Delete a library item and its associated book, audio files from storage.
 */
export async function deleteLibraryItemAction(libraryItemId: string, _hardDelete: boolean) {
  await apiRequest(`/api/items/${libraryItemId}`, { method: 'DELETE' })
  revalidatePath('/library')
  return null
}

export async function getExpandedLibraryItemAction(libraryItemId: string) {
  return getLibraryItem(libraryItemId)
}

export async function deleteLibraryItemMediaEpisodeAction(
  _libraryItemId: string,
  _episodeId: string,
  _hardDelete = false,
) {
  // Podcast episodes not yet supported
  return null
}

export async function fetchPodcastFeedAction(_rssFeed: string) {
  return null
}

export async function downloadPodcastEpisodesAction(_libraryItemId: string, _episodes: unknown[]) {
  return null
}

export async function clearPodcastDownloadQueueAction(_libraryItemId: string) {
  return null
}
