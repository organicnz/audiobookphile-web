/**
 * POST /api/playback/start
 *
 * Starts a playback session for a library item (book or podcast episode).
 * Returns signed audio URLs, chapters, current progress, and total duration.
 *
 * Requirements: 9.1, 9.2, 9.3, 9.5, 9.6, 9.7
 */

import type { Chapter } from '@/types/api'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface PlaybackTrack {
  index: number
  audioFileId: string
  contentUrl: string
  duration: number
  mimeType: string
}

interface PlaybackStartResponse {
  tracks: PlaybackTrack[]
  chapters: Chapter[]
  currentTime: number
  duration: number
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Requirement 9.7: Return 401 if unauthenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { itemId, episodeId } = body as { itemId: string; episodeId?: string }

  // Requirement 9.1: Query library item to get book/media metadata
  const { data: item, error: itemError } = await supabase
    .from('library_items')
    .select('*, books(audio_files, chapters)')
    .eq('id', itemId)
    .single()

  if (itemError || !item) {
    return NextResponse.json({ error: 'Library item not found' }, { status: 404 })
  }

  const book = item.books as any
  let audioFiles = (book?.audio_files as any[]) || []

  // Requirement 9.5: Filter by episode_id when provided (for podcasts)
  if (episodeId) {
    // If it's a podcast, we might need to join podcast_episodes
    // For now, let's assume books are the primary focus as per schema
    audioFiles = audioFiles.filter((f: any) => f.episodeId === episodeId)
  }

  // Requirement 9.6: Return 404 if no audio files found
  if (!audioFiles || audioFiles.length === 0) {
    return NextResponse.json({ error: 'No audio files found' }, { status: 404 })
  }

  // Requirement 9.2: Generate signed URLs (3600s expiry) for each audio file
  const tracksWithUrls = await Promise.all(
    audioFiles.map(async (audioFile, idx) => {
      const { data: signedData, error: signedError } = await supabase.storage
        .from('audio')
        .createSignedUrl(audioFile.storage_path, 3600)

      if (signedError || !signedData?.signedUrl) {
        throw new Error(
          `Failed to generate signed URL for audio file ${audioFile.id}: ${signedError?.message ?? 'unknown error'}`
        )
      }

      return {
        index: (audioFile as any).index ?? idx,
        audioFileId: (audioFile as any).ino || (audioFile as any).id,
        contentUrl: signedData.signedUrl,
        duration: (audioFile as any).duration,
        mimeType: (audioFile as any).mimeType || (audioFile as any).mime_type,
      } satisfies PlaybackTrack
    })
  )

  // Requirement 9.3: Fetch chapters for this library item
  const chapters = (book?.chapters as any[]) || []

  // Requirement 9.3 / 9.5: Fetch current media_progress for this user and item/episode
  let progressQuery = supabase
    .from('media_progress')
    .select('current_time_pos')
    .eq('user_id', user.id)
    .eq('library_item_id', itemId)

  if (episodeId) {
    progressQuery = progressQuery.eq('episode_id', episodeId)
  } else {
    progressQuery = progressQuery.is('episode_id', null)
  }

  const { data: progressData } = await progressQuery.maybeSingle()

  const currentTime = progressData?.current_time_pos ?? 0

  // Requirement 9.3: Total duration = sum of all audio file durations
  const totalDuration = audioFiles.reduce((sum, f) => sum + (f.duration ?? 0), 0)

  const response: PlaybackStartResponse = {
    tracks: tracksWithUrls,
    chapters: chapters as any[],
    currentTime,
    duration: totalDuration,
  }

  return NextResponse.json(response, { status: 200 })
}
