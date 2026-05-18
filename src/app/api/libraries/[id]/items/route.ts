import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const libraryId = resolvedParams.id
    
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

    // Validate token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch library items. Audiobookshelf mobile expects a lot of fields.
    const { data: items, error: itemsError } = await supabase
      .from('library_items')
      .select('*, books(*), authors(*)') // Assumes standard relation, we might need to adjust based on schema
      .eq('library_id', libraryId)

    if (itemsError) throw itemsError

    // Map to Audiobookshelf item schema (Simplified version to prevent crashes)
    const formattedItems = items.map((item: any) => ({
      id: item.id,
      ino: item.ino || item.id,
      libraryId: item.library_id,
      folderId: 'default',
      path: item.path || '',
      relPath: item.rel_path || '',
      isFile: item.is_file || false,
      mtimeMs: new Date(item.mtime || item.created_at).getTime(),
      ctimeMs: new Date(item.ctime || item.created_at).getTime(),
      birthtimeMs: new Date(item.birthtime || item.created_at).getTime(),
      addedAt: new Date(item.created_at).getTime(),
      updatedAt: new Date(item.updated_at).getTime(),
      isMissing: item.is_missing || false,
      isInvalid: item.is_invalid || false,
      mediaType: item.media_type || 'book',
      media: {
        metadata: {
          title: item.title || 'Unknown Title',
          titleIgnorePrefix: item.title_ignore_prefix || item.title,
          subtitle: item.books?.subtitle || null,
          authorName: item.author_names_first_last || 'Unknown Author',
          authorNameLF: item.author_names_last_first || 'Unknown Author',
          narratorName: item.books?.narrators?.join(', ') || '',
          seriesName: '',
          genres: item.books?.genres || [],
          publishedYear: item.books?.published_year || null,
          publishedDate: item.books?.published_date || null,
          publisher: item.books?.publisher || null,
          description: item.books?.description || null,
          isbn: item.books?.isbn || null,
          asin: item.books?.asin || null,
          language: item.books?.language || null,
          explicit: item.books?.explicit || false,
          abridged: item.books?.abridged || false
        },
        coverPath: item.cover_path || null,
        tags: item.books?.tags || [],
        numTracks: item.books?.audio_files?.length || 0,
        numAudioFiles: item.books?.audio_files?.length || 0,
        numChapters: item.books?.chapters?.length || 0,
        numMissingParts: 0,
        numInvalidAudioFiles: 0,
        duration: item.books?.duration || 0,
        size: item.size || 0,
        ebookFormat: null,
        ebookFile: null,
        tracks: item.books?.audio_files || [],
        chapters: item.books?.chapters || []
      }
    }))

    return NextResponse.json({
      results: formattedItems,
      total: formattedItems.length,
      limit: 0,
      page: 0,
      sortBy: 'addedAt',
      sortDesc: true,
      filterBy: 'all',
      mediaType: 'book',
      minified: false,
      collapseseries: false,
      include: ''
    })

  } catch (error) {
    console.error('[API Library Items] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
