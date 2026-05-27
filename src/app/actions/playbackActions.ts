'use server'

import { updateMediaProgress } from '@/lib/supabase-api'
import type { PlaybackSession, StartSessionPayload } from '@/types/api'
import { PlayMethod } from '@/types/api'
import { createClient } from '@/utils/supabase/server'
import { PlaybackService } from '@/lib/services/PlaybackService'

interface SessionSyncData {
  currentTime: number
  duration?: number
  timeListened: number
  libraryItemId?: string
  episodeId?: string | null
}

/**
 * Start a playback session — queries Supabase directly and returns
 * signed audio URLs for the requested library item.
 */
export async function startPlaybackSession(
  libraryItemId: string,
  _payload: StartSessionPayload,
  episodeId?: string,
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized: No user session')
  }

  const playbackService = new PlaybackService(supabase)
  const session = await playbackService.generateSession(libraryItemId, user.id, episodeId)
  
  return session as PlaybackSession
}

/**
 * Sync playback progress to Supabase.
 */
export async function syncPlaybackSession(_sessionId: string, syncData: SessionSyncData): Promise<void> {
  if (syncData.libraryItemId) {
    try {
      await updateMediaProgress(syncData.libraryItemId, {
        currentTime: syncData.currentTime,
        duration: syncData.duration,
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
        duration: syncData.duration,
        episodeId: syncData.episodeId ?? undefined,
      })
    } catch (err) {
      console.error('[playbackActions] closePlaybackSession failed:', err)
    }
  }
}
