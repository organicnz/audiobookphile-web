import { SupabaseClient } from '@supabase/supabase-js'
import { getStorageProvider } from '../storage/StorageProvider'
import type { PlaybackSession, PlayMethod } from '@/types/api'
import crypto from 'crypto'

export class PlaybackService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Generates a complete PlaybackSession containing signed audio track URLs and metadata
   */
  async generateSession(libraryItemId: string, userId: string, episodeId?: string): Promise<PlaybackSession> {
    if (libraryItemId.startsWith('book-')) {
      const nowMs = Date.now();
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
        audioTracks: [{
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
          is_missing: false,
        }],
        audio_tracks: [{
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
          is_missing: false,
        }],
        chapters: [],
        currentTime: 0,
        current_time: 0,
        playbackRate: 1.0,
        playback_rate: 1.0,
        startedAt: nowMs,
        started_at: nowMs,
        updatedAt: nowMs,
        updated_at: nowMs,
      } as unknown as PlaybackSession;
    }

    // Fetch the single library item with all relations
    const { data: item, error: itemError } = await this.supabase
      .from('library_items')
      .select(`
        *,
        books (
          *,
          book_authors (
            authors (
              *
            )
          ),
          book_series (
            series (
              *
            )
          )
        )
      `)
      .eq('id', libraryItemId)
      .maybeSingle()

    if (itemError || !item) {
      throw new Error(`Library item not found: ${itemError?.message || 'Item does not exist'}`)
    }

    const book = Array.isArray(item.books) ? (item.books as any[])[0] : item.books as any
    const audioFilesList: any[] = book?.audio_files || item.books?.audio_files || []

    if (!audioFilesList.length) {
      throw new Error('No audio files found for this item')
    }

    // Sort audio files by index
    const sortedAudioFiles = [...audioFilesList].map((af: any) => ({
      ...af,
      index: af.track_index !== undefined ? af.track_index : (af.index !== undefined ? af.index : 0),
      duration: Number(af.duration) || 0,
      size: Number(af.size) || 0,
      mime_type: af.mime_type || af.mimeType || 'audio/mpeg',
      codec: af.codec || 'mp3',
    })).sort((a: any, b: any) => a.index - b.index)

    // Get Storage Provider
    const storage = getStorageProvider(this.supabase)

    // Sign audio files and calculate offset
    let currentOffset = 0
    const audioTracks: any[] = []
    const missingTracks: string[] = []

    for (let i = 0; i < sortedAudioFiles.length; i++) {
      const af = sortedAudioFiles[i]
      const storagePath = af.metadata?.path ?? af.storage_path ?? af.path ?? ''
      const duration = af.duration

      let finalSignedUrl = ''
      let isMissing = false

      try {
        finalSignedUrl = await storage.getSignedUrl(storagePath, 3600)
      } catch (signErr: any) {
        console.warn(`[PlaybackService] Missing storage file at "${storagePath}": ${signErr.message}. Skipping track.`)
        missingTracks.push(storagePath)
        isMissing = true
      }

      if (!isMissing && finalSignedUrl) {
        audioTracks.push({
          index: af.index ?? i,
          startOffset: currentOffset,
          duration: duration,
          title: af.metadata?.filename || af.filename || `Track ${i + 1}`,
          contentUrl: finalSignedUrl,
          mimeType: af.mime_type,
          codec: af.codec,
          isMissing: false,
          
          // Legacy properties required by some clients
          start_offset: currentOffset,
          content_url: finalSignedUrl,
          mime_type: af.mime_type,
          is_missing: false,
        })
        currentOffset += duration
      }
    }

    if (audioTracks.length === 0) {
      throw new Error('All audio files are missing from storage. The book may need to be re-uploaded.')
    }

    // Fetch user media progress
    let progressQuery = this.supabase
      .from('media_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('library_item_id', libraryItemId)
    
    if (episodeId) {
      progressQuery = progressQuery.eq('episode_id', episodeId)
    } else {
      progressQuery = progressQuery.is('episode_id', null)
    }
    
    const { data: progressRecord } = await progressQuery.maybeSingle()
    const currentTime = progressRecord ? Number(progressRecord.current_time_pos) || 0 : 0

    // Get Authors
    const authors = book?.book_authors?.map((ba: any) => ba.authors).filter(Boolean) || []
    const authorNames = authors.map((a: any) => a.name)
    const authorName = authorNames.join(', ') || 'Unknown Author'

    // Get Chapters
    const chaptersList = book?.chapters || []
    const chapters = chaptersList.map((ch: any, index: number) => ({
      id: ch.chapter_index !== undefined ? ch.chapter_index : (typeof ch.id === 'number' ? ch.id : index),
      title: ch.title,
      start: Number(ch.start_time !== undefined ? ch.start_time : ch.start) || 0,
      end: Number(ch.end_time !== undefined ? ch.end_time : ch.end) || 0
    })).sort((a: any, b: any) => a.id - b.id)

    const nowMs = Date.now()
    const totalDuration = Number(book?.duration || item.duration) || currentOffset

    return {
      id: `${libraryItemId}__${crypto.randomUUID()}`,
      userId: userId,
      libraryId: item.library_id,
      libraryItemId: libraryItemId,
      episodeId: episodeId || undefined,
      
      displayTitle: book?.title || item.title || 'Unknown Title',
      displayAuthor: authorName,
      coverPath: item.cover_path || book?.cover_path || null,
      cover_path: item.cover_path || book?.cover_path || null, // legacy
      
      duration: totalDuration,
      playMethod: 0,
      play_method: 0,
      mediaPlayer: 'SKIP-ExoPlayer',
      media_player: 'SKIP-ExoPlayer',
      mediaType: item.media_type || 'book',
      media_type: item.media_type || 'book',
      
      audioTracks: audioTracks,
      audio_tracks: audioTracks, // legacy
      chapters: chapters,
      
      currentTime: currentTime,
      current_time: currentTime, // legacy
      playbackRate: 1.0,
      playback_rate: 1.0, // legacy
      startedAt: nowMs,
      started_at: nowMs, // legacy
      updatedAt: nowMs,
      updated_at: nowMs, // legacy
    } as unknown as PlaybackSession
  }
}
