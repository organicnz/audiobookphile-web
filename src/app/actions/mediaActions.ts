'use server'

import * as api from '@/lib/api'
import { RssPodcastEpisode, UpdateLibraryItemMediaPayload } from '@/types/api'

export async function toggleFinishedAction(libraryItemId: string, params: { isFinished: boolean; episodeId?: string }) {
  const result = await api.updateMediaFinished(libraryItemId, params)
  
  // Sync to Supabase
  try {
    const { syncProgressToSupabase } = await import('@/utils/supabase/progress')
    await syncProgressToSupabase({
      library_item_id: libraryItemId,
      episode_id: params.episodeId,
      is_finished: params.isFinished,
      current_time_pos: params.isFinished ? 0 : 0 // Simplified for toggle
    })
  } catch (err) {
    console.error('[mediaActions] Supabase sync failed for toggleFinished', err)
  }

  return result
}

export async function batchUpdateMediaFinishedAction(payload: { libraryItemId: string; episodeId?: string; isFinished: boolean }[]) {
  return api.batchUpdateMediaFinished(payload)
}

export async function updateLibraryItemMediaAction(libraryItemId: string, payload: UpdateLibraryItemMediaPayload) {
  return api.updateLibraryItemMedia(libraryItemId, payload)
}

export async function rescanLibraryItemAction(libraryItemId: string) {
  return api.rescanLibraryItem(libraryItemId)
}

export async function sendEbookToDeviceAction(payload: { libraryItemId: string; deviceName: string }) {
  return api.sendEbookToDevice(payload)
}

export async function removeSeriesFromContinueListeningAction(seriesId: string) {
  return api.removeSeriesFromContinueListening(seriesId)
}

export async function removeFromContinueListeningAction(progressId: string) {
  const result = await api.removeFromContinueListening(progressId)
  
  // Sync to Supabase - we need the user ID and library item ID
  // Since we only have progressId (legacy), we might need to fetch the item ID or just try to match.
  // For now, let's keep it simple and just do legacy.
  // TODO: Implement Supabase-native removal if needed.
  
  return result
}

export async function deleteLibraryItemAction(libraryItemId: string, hardDelete: boolean) {
  return api.deleteLibraryItem(libraryItemId, hardDelete)
}

export async function getExpandedLibraryItemAction(libraryItemId: string) {
  return api.getLibraryItem(libraryItemId, true)
}

export async function deleteLibraryItemMediaEpisodeAction(libraryItemId: string, episodeId: string, hardDelete = false) {
  return api.deleteLibraryItemMediaEpisode(libraryItemId, episodeId, hardDelete)
}

export async function fetchPodcastFeedAction(rssFeed: string) {
  return api.fetchPodcastFeed(rssFeed)
}

export async function downloadPodcastEpisodesAction(libraryItemId: string, episodes: RssPodcastEpisode[]) {
  return api.downloadPodcastEpisodes(libraryItemId, episodes)
}

export async function clearPodcastDownloadQueueAction(libraryItemId: string) {
  return api.clearPodcastDownloadQueue(libraryItemId)
}
