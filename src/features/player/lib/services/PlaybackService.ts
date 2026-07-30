import { SupabaseClient } from '@supabase/supabase-js'
import { apiRequest } from '@/shared/lib/api/client'
import type { PlaybackSession, PlayMethod } from '@/types/api'
import crypto from 'crypto'

export class PlaybackService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Generates a complete PlaybackSession containing signed audio track URLs and metadata
   */
  async generateSession(libraryItemId: string, userId: string, episodeId?: string): Promise<PlaybackSession> {
    if (libraryItemId.startsWith('book-')) {
      const nowMs = Date.now()
      return {
        id: `${libraryItemId}__mock_session`,
        userId: userId,
        libraryId: 'lib1',
        libraryItemId: libraryItemId,
        displayTitle: 'Mock Audiobook',
        displayAuthor: 'Mock Author',
        coverPath: null,
        cover_path: null,
        duration: 3600,
        playMethod: 0,
        play_method: 0,
        mediaPlayer: 'SKIP-ExoPlayer',
        media_player: 'SKIP-ExoPlayer',
        mediaType: 'book',
        media_type: 'book',
        audioTracks: [
          {
            index: 1,
            startOffset: 0,
            duration: 3600,
            title: 'Track 1',
            contentUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            mimeType: 'audio/mpeg',
            codec: 'mp3',
            isMissing: false,
            start_offset: 0,
            content_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            mime_type: 'audio/mpeg',
            is_missing: false
          }
        ],
        audio_tracks: [
          {
            index: 1,
            startOffset: 0,
            duration: 3600,
            title: 'Track 1',
            contentUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            mimeType: 'audio/mpeg',
            codec: 'mp3',
            isMissing: false,
            start_offset: 0,
            content_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            mime_type: 'audio/mpeg',
            is_missing: false
          }
        ],
        chapters: [],
        currentTime: 0,
        current_time: 0,
        playbackRate: 1.0,
        playback_rate: 1.0,
        startedAt: nowMs,
        started_at: nowMs,
        updatedAt: nowMs,
        updated_at: nowMs
      } as unknown as PlaybackSession
    }
    // Generate session via API
    const data = await apiRequest<any>('/api/session-play', {
      method: 'POST',
      body: JSON.stringify({ itemId: libraryItemId, episodeId })
    })

    if (data?.error) {
      throw new Error(data.error.message || data.error)
    }

    return data as PlaybackSession
  }
}
