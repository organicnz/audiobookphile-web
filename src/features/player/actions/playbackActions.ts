'use server'

import { apiRequest } from '@/shared/lib/api'
import type { PlaybackSession, StartSessionPayload } from '@/types/api'

interface SessionSyncData {
  currentTime: number
  duration?: number
  timeListened: number
  libraryItemId?: string
  episodeId?: string | null
}

/**
 * Start a playback session — queries the Supabase Edge Function directly
 * and returns signed audio URLs for the requested library item.
 */
export async function startPlaybackSession(libraryItemId: string, _payload: StartSessionPayload, episodeId?: string) {
  let url = `/api/items/${libraryItemId}/play`
  if (episodeId) {
    url = `/api/items/${libraryItemId}/play/${episodeId}`
  }
  return await apiRequest<PlaybackSession>(url, {
    method: 'POST',
    body: JSON.stringify({
      deviceInfo: { clientName: 'Audiobookphile Web' },
      mediaPlayer: 'web',
      forceDirectPlay: true
    })
  })
}

/**
 * Sync playback progress to Supabase via Edge Function.
 */
export async function syncPlaybackSession(sessionId: string, syncData: SessionSyncData): Promise<void> {
  try {
    await apiRequest(`/api/session/${sessionId}/sync`, {
      method: 'POST',
      body: JSON.stringify({
        currentTime: syncData.currentTime,
        duration: syncData.duration,
        progress: syncData.duration && syncData.duration > 0 ? syncData.currentTime / syncData.duration : 0,
        timeListened: syncData.timeListened,
        episodeId: syncData.episodeId || undefined
      })
    })
  } catch (err) {
    console.error('[playbackActions] syncPlaybackSession failed:', err)
  }
}

/**
 * Close a playback session — persists final progress to Supabase via Edge Function.
 */
export async function closePlaybackSession(sessionId: string, syncData: SessionSyncData | null): Promise<void> {
  if (!syncData) return
  try {
    await apiRequest(`/api/session/${sessionId}/close`, {
      method: 'POST',
      body: JSON.stringify({
        currentTime: syncData.currentTime,
        duration: syncData.duration,
        timeListened: syncData.timeListened,
        episodeId: syncData.episodeId || undefined
      })
    })
  } catch (err) {
    console.error('[playbackActions] closePlaybackSession failed:', err)
  }
}
