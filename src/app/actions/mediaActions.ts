'use server'

import { getLibraryItem, updateMediaProgress } from '@/lib/supabase-api';
import type { UpdateLibraryItemMediaPayload } from '@/types/api';

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

export async function updateLibraryItemMediaAction(
  _libraryItemId: string,
  _payload: UpdateLibraryItemMediaPayload,
) {
  console.warn('[mediaActions] updateLibraryItemMedia is not available in the Supabase-backed version')
  return null
}

export async function rescanLibraryItemAction(_libraryItemId: string) {
  console.warn('[mediaActions] rescanLibraryItem is not available in the Supabase-backed version')
  return null
}

export async function sendEbookToDeviceAction(_payload: { libraryItemId: string; deviceName: string }) {
  console.warn('[mediaActions] sendEbookToDevice is not available in the Supabase-backed version')
  return null
}

export async function removeSeriesFromContinueListeningAction(_seriesId: string) {
  console.warn('[mediaActions] removeSeriesFromContinueListening is not available in the Supabase-backed version')
  return null
}

export async function removeFromContinueListeningAction(_progressId: string) {
  console.warn('[mediaActions] removeFromContinueListening is not available in the Supabase-backed version')
  return null
}

export async function deleteLibraryItemAction(_libraryItemId: string, _hardDelete: boolean) {
  console.warn('[mediaActions] deleteLibraryItem is not available in the Supabase-backed version')
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
  console.warn('[mediaActions] deleteLibraryItemMediaEpisode is not available in the Supabase-backed version')
  return null
}

export async function fetchPodcastFeedAction(_rssFeed: string) {
  console.warn('[mediaActions] fetchPodcastFeed is not available in the Supabase-backed version')
  return null
}

export async function downloadPodcastEpisodesAction(_libraryItemId: string, _episodes: unknown[]) {
  console.warn('[mediaActions] downloadPodcastEpisodes is not available in the Supabase-backed version')
  return null
}

export async function clearPodcastDownloadQueueAction(_libraryItemId: string) {
  console.warn('[mediaActions] clearPodcastDownloadQueue is not available in the Supabase-backed version')
  return null
}
