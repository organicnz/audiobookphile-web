'use server'

import { updateMediaProgress } from '@/lib/supabase-api'
import type { PlaybackSession, StartSessionPayload } from '@/types/api'
import { PlayMethod } from '@/types/api'
import { createClient } from '@/utils/supabase/server'

interface SessionSyncData {
  currentTime: number
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
): Promise<PlaybackSession> {
  const supabase = await createClient()

  // Fetch library item with book audio_files
  const { data: item, error: itemError } = await supabase
    .from('library_items')
    .select('*, books!media_id(audio_files, chapters)')
    .eq('id', libraryItemId)
    .single()

  if (itemError || !item) {
    throw new Error(`Library item not found: ${itemError?.message}`)
  }

  const book = Array.isArray(item.books) ? (item.books as any[])[0] : item.books as any
  const audioFiles: any[] = book?.audio_files || []

  if (!audioFiles.length) {
    throw new Error('No audio files found for this item')
  }

  console.log('[startPlaybackSession] Found', audioFiles.length, 'audio files for item', libraryItemId)

  // Sort audio files by index to ensure correct startOffset accumulation
  const sortedAudioFiles = [...audioFiles].sort((a, b) => (a.index ?? 0) - (b.index ?? 0))

  // Generate signed URLs for each audio file
  let cumulativeOffset = 0
  const audioTracks: any[] = []
  for (const [idx, af] of sortedAudioFiles.entries()) {
    const storagePath = af.metadata?.path ?? af.storage_path ?? ''
    const { data: signed, error: signedError } = await supabase.storage
      .from('audio-files')
      .createSignedUrl(storagePath, 3600)

    if (signedError || !signed?.signedUrl) {
      console.error('[startPlaybackSession] signedUrl failed for path:', storagePath, 'error:', signedError?.message)
      throw new Error(`Failed to sign URL for ${storagePath}: ${signedError?.message}`)
    }

    console.log('[startPlaybackSession] signed URL ok for:', storagePath.slice(0, 50))

    const trackDuration = af.duration ?? 0
    const startOffset = cumulativeOffset
    cumulativeOffset += trackDuration

    audioTracks.push({
      index: af.index ?? idx,
      startOffset,
      duration: trackDuration,
      title: af.metadata?.filename ?? `Track ${idx + 1}`,
      contentUrl: signed.signedUrl,
      mimeType: af.mimeType ?? 'audio/mpeg',
      codec: af.codec ?? '',
      timeBase: af.timeBase ?? '1/1000',
      channels: af.channels ?? 2,
      channelLayout: af.channelLayout ?? 'stereo',
      chapters: af.chapters ?? [],
      embeddedCoverArt: af.embeddedCoverArt ?? null,
      metaTags: af.metaTags ?? {},
      isDirectPlaySupported: true,
    })
  }

  // Fetch current progress
  const { data: { user } } = await supabase.auth.getUser()
  let currentTime = 0
  if (user) {
    let progressQuery = supabase
      .from('media_progress')
      .select('current_time_pos')
      .eq('user_id', user.id)
      .eq('library_item_id', libraryItemId)
    if (episodeId) {
      progressQuery = progressQuery.eq('episode_id', episodeId)
    } else {
      progressQuery = progressQuery.is('episode_id', null)
    }
    const { data: progress } = await progressQuery.maybeSingle()
    currentTime = progress?.current_time_pos ?? 0
  }

  const chapters = (book?.chapters as any[]) || []
  const totalDuration = audioFiles.reduce((sum: number, f: any) => sum + (f.duration ?? 0), 0)

  return {
    id: `local-${libraryItemId}-${Date.now()}`,
    userId: user?.id ?? '',
    libraryId: item.library_id ?? '',
    libraryItemId,
    episodeId: episodeId ?? undefined,
    mediaType: (item.media_type as 'book' | 'podcast') ?? 'book',
    mediaMetadata: {},
    audioTracks,
    chapters,
    currentTime,
    duration: totalDuration,
    playMethod: PlayMethod.DIRECT_PLAY,
    displayTitle: item.title ?? '',
    displayAuthor: '',
    mediaPlayer: 'html5',
    deviceInfo: null,
    serverVersion: '0.0.0',
    date: new Date().toISOString().slice(0, 10),
    dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
    timeListening: 0,
    startTime: currentTime,
    startedAt: Date.now(),
    updatedAt: Date.now(),
    libraryItem: null,
  } as PlaybackSession
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
