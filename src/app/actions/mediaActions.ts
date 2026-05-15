'use server'

import { getLibraryItem, updateMediaProgress } from '@/lib/supabase-api'
import type { UpdateLibraryItemMediaPayload } from '@/types/api'
import { createClient } from '@/utils/supabase/server'
import { createServiceRoleClient } from '@/utils/supabase/service-role'
import { revalidatePath } from 'next/cache'

export async function toggleFinishedAction(
  libraryItemId: string,
  params: { isFinished: boolean; episodeId?: string },
) {
  await updateMediaProgress(libraryItemId, {
    currentTime: 0,
    isFinished: params.isFinished,
    episodeId: params.episodeId,
  })
}

export async function batchUpdateMediaFinishedAction(
  payload: { libraryItemId: string; episodeId?: string; isFinished: boolean }[],
) {
  await Promise.all(
    payload.map((item) =>
      updateMediaProgress(item.libraryItemId, {
        currentTime: 0,
        isFinished: item.isFinished,
        episodeId: item.episodeId,
      }),
    ),
  )
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
  const db = createServiceRoleClient()
  const { data: item } = await db
    .from('library_items')
    .select('title, author_names_first_last')
    .eq('id', libraryItemId)
    .single()

  if (!item?.title) return { result: 'UPTODATE' }

  const { fetchBookCover } = await import('@/lib/coverFetch')
  const author = item.author_names_first_last?.split('/')[0]?.trim() || undefined
  const fetched = await fetchBookCover(item.title, author)

  if (fetched) {
    const storagePath = `${libraryItemId}/cover.${fetched.extension}`
    const { error } = await db.storage
      .from('covers')
      .upload(storagePath, fetched.buffer, { upsert: true, contentType: fetched.contentType })
    if (!error) {
      await db.from('library_items').update({ cover_path: storagePath }).eq('id', libraryItemId)
      return { result: 'UPDATED' }
    }
  }

  return { result: 'UPTODATE' }
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Get all library items in this series
  const { data: bookSeries } = await supabase
    .from('book_series')
    .select('book_id, books!book_id(library_items!media_id(id))')
    .eq('series_id', seriesId)

  if (!bookSeries?.length) return null

  const itemIds = bookSeries
    .flatMap((bs: any) => bs.books?.library_items || [])
    .map((li: any) => li.id)
    .filter(Boolean)

  if (!itemIds.length) return null

  await Promise.all(
    itemIds.map((id: string) =>
      updateMediaProgress(id, { currentTime: 0, isFinished: true })
    )
  )
  return null
}

/**
 * Remove a single item from Continue Listening by marking it finished.
 */
export async function removeFromContinueListeningAction(progressId: string) {
  const db = createServiceRoleClient()
  await db
    .from('media_progress')
    .update({ is_finished: true })
    .eq('id', progressId)
  return null
}

/**
 * Delete a library item and its associated book, audio files from storage.
 */
export async function deleteLibraryItemAction(libraryItemId: string, _hardDelete: boolean) {
  const db = createServiceRoleClient()

  // Get the book ID before deleting
  const { data: item } = await db
    .from('library_items')
    .select('media_id')
    .eq('id', libraryItemId)
    .single()

  // Delete storage files
  const { data: storageFiles } = await db.storage
    .from('audio-files')
    .list(item?.media_id || libraryItemId)

  if (storageFiles?.length) {
    const paths = storageFiles.map((f) => `${item?.media_id || libraryItemId}/${f.name}`)
    await db.storage.from('audio-files').remove(paths)
  }

  // Delete cover
  await db.storage.from('covers').remove([`${libraryItemId}/cover.jpg`])

  // Delete DB records (cascade handles related tables if FK constraints exist)
  if (item?.media_id) {
    await db.from('book_authors').delete().eq('book_id', item.media_id)
    await db.from('book_series').delete().eq('book_id', item.media_id)
    await db.from('books').delete().eq('id', item.media_id)
  }
  await db.from('media_progress').delete().eq('library_item_id', libraryItemId)
  await db.from('library_items').delete().eq('id', libraryItemId)

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
