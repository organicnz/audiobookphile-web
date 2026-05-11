'use server'

import { updateMediaProgress } from '@/lib/supabase-api'
import type { PlaybackSession, StartSessionPayload } from '@/types/api'

interface SessionSyncData {
  currentTime: number
  timeListened: number
  libraryItemId?: string
  episodeId?: string | null
}

/**
 * Start a playback session — ABS-specific, not available in Supabase-backed version.
 * Returns a minimal stub so call sites don't crash.
 */
export async function startPlaybackSession(
  _libraryItemId: string,
  _payload: StartSessionPayload,
  _episodeId?: string,
): Promise<PlaybackSession> {
  console.warn('[playbackActions] startPlaybackSession is not available in the Supabase-backed version')
  return {} as PlaybackSession
}

/**
 * Sync playback progress to Supabase.
 */
export async function syncPlaybackSession(_sessionId: string, syncData: SessionSyncData): Promise<void> {
  if (syncData.libraryItemId) {
    try {
      await updateMediaProgress(syncData.libraryItemId, {
        currentTime: syncData.currentTime,
        episodeId: syncData.episodeId ?? undefined,
      })
    } catch (err) {
      console.error('[playbackActions] syncPlaybackSession failed:', err)
    }
  }
}

/**
 * Close a playback session — persists final progress to Supabase.
 */
export async function closePlaybackSession(_sessionId: string, syncData: SessionSyncData | null): Promise<void> {
  if (syncData?.libraryItemId) {
    try {
      await updateMediaProgress(syncData.libraryItemId, {
        currentTime: syncData.currentTime,
        episodeId: syncData.episodeId ?? undefined,
      })
    } catch (err) {
      console.error('[playbackActions] closePlaybackSession failed:', err)
    }
  }
}
