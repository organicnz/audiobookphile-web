import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const itemId = resolvedParams.id

    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const supabase = createSupabaseClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })

    // Validate token and get user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch the single library item with all relations
    const { data: item, error: itemError } = await supabase
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
      .eq('id', itemId)
      .maybeSingle()

    if (itemError || !item) {
      console.error('[API Play Session] Item not found:', itemError?.message)
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Fetch user media progress separately
    const { data: progressRecord } = await supabase
      .from('media_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('library_item_id', item.id)
      .maybeSingle()

    // Sort audio files by index
    const audioFilesList = item.books?.audio_files || []
    const sortedAudioFiles = audioFilesList.map((af: any) => ({
      index: af.track_index !== undefined ? af.track_index : (af.index !== undefined ? af.index : 0),
      filename: af.filename,
      duration: Number(af.duration) || 0,
      size: Number(af.size) || 0,
      mime_type: af.mime_type || af.mimeType || 'audio/mpeg',
      codec: af.codec || 'mp3',
      metadata: af.metadata || {
        filename: af.filename,
        ext: af.filename?.split('.').pop() || '',
        path: af.storage_path || af.path,
        relPath: af.storage_path || af.path,
        size: Number(af.size) || 0,
        mtimeMs: af.metadata?.mtimeMs || new Date().getTime(),
        ctimeMs: af.metadata?.ctimeMs || new Date().getTime(),
        birthtimeMs: af.metadata?.birthtimeMs || new Date().getTime()
      },
      storage_path: af.storage_path || af.path
    })).sort((a: any, b: any) => a.index - b.index) || []

    if (sortedAudioFiles.length === 0) {
      return NextResponse.json({ error: 'No audio files found' }, { status: 404 })
    }

    // Get Authors
    const authors = item.books?.book_authors?.map((ba: any) => ba.authors).filter(Boolean) || []
    const authorNames = authors.map((a: any) => a.name)
    const authorName = authorNames.join(', ') || 'Unknown Author'

    // Get Chapters
    const chaptersList = item.books?.chapters || []
    const chapters = chaptersList.map((ch: any) => ({
      id: ch.chapter_index !== undefined ? ch.chapter_index : ch.id,
      title: ch.title,
      start: Number(ch.start_time !== undefined ? ch.start_time : ch.start) || 0,
      end: Number(ch.end_time !== undefined ? ch.end_time : ch.end) || 0
    })).sort((a: any, b: any) => a.id - b.id) || []

    // Sign audio files and calculate offset — resilient to missing files
    let currentOffset = 0
    const audioTracks = []
    const missingTracks: string[] = []

    for (let i = 0; i < sortedAudioFiles.length; i++) {
      const af = sortedAudioFiles[i]
      const duration = Number(af.duration) || 0
      const storagePath = af.metadata?.path ?? af.storage_path ?? ''

      let finalSignedUrl = ''
      let isMissing = false

      try {
        // Use Supabase storage signed URLs (proxied through Supabase's own B2 credentials)
        // This matches the approach used by the React web app in playbackActions.ts
        const { data: signedData, error: signedError } = await supabase.storage
          .from('audio-files')
          .createSignedUrl(storagePath, 3600)

        if (signedError || !signedData?.signedUrl) {
          throw new Error(signedError?.message ?? 'No signed URL returned')
        }
        finalSignedUrl = signedData.signedUrl
      } catch (signErr: any) {
        console.warn(
          `[API Play Session] Missing storage file at "${storagePath}": ${signErr.message}. Skipping track.`
        )
        missingTracks.push(storagePath)
        isMissing = true
      }

      // Only include tracks that have valid URLs
      if (!isMissing && finalSignedUrl) {
        audioTracks.push({
          index: af.index ?? i,
          start_offset: currentOffset,
          duration: duration,
          title: af.filename,
          content_url: finalSignedUrl,
          mime_type: af.mime_type || 'audio/mpeg',
          codec: af.codec || 'mp3',
          is_missing: false,
        })
        currentOffset += duration
      }
    }

    // If ALL tracks are missing, return a descriptive error
    if (audioTracks.length === 0) {
      return NextResponse.json(
        {
          error: 'All audio files are missing from storage. The book may need to be re-uploaded.',
          missingTracks,
        },
        { status: 404 }
      )
    }

    const currentTime = progressRecord ? Number(progressRecord.current_time_pos) || 0 : 0
    const nowMs = Date.now()

    // Match the Swift PlaybackSession structure with snake_case mapping:
    const playbackSession = {
      id: `${item.id}__${crypto.randomUUID()}`,
      user_id: user.id,
      library_id: item.library_id,
      library_item_id: item.id,
      episode_id: null,
      
      // Display info
      display_title: item.books?.title || item.title || 'Unknown Title',
      display_author: authorName,
      cover_path: item.cover_path || item.books?.cover_path || null,
      
      // Playback info
      duration: Number(item.books?.duration || item.duration) || currentOffset,
      play_method: 0,
      media_player: 'SKIP-ExoPlayer',
      media_type: item.media_type || 'book',
      
      // Audio tracks and chapters
      audio_tracks: audioTracks,
      chapters: chapters,
      
      // State
      current_time: currentTime,
      playback_rate: 1.0,
      started_at: nowMs,
      updated_at: nowMs
    }

    return NextResponse.json(playbackSession)

  } catch (error: any) {
    console.error('[API Play Session] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
