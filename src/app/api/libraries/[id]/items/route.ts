import { apiError } from '@/utils/apiResponse'
import { requireApiAuth } from '@/utils/apiAuth'
import { NextResponse } from 'next/server'
import { mapBookForMobile } from '@/utils/mobileMappers'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const libraryId = resolvedParams.id
    
    const { user, supabase } = await requireApiAuth(request)
    if (!user || !supabase) {
      return apiError('Unauthorized', 'UNAUTHORIZED', 401)
    }

    // Fetch library items. Audiobookshelf mobile expects a lot of fields.
    const { data: items, error: itemsError } = await supabase
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
      .eq('library_id', libraryId)

    if (itemsError) throw itemsError

    // Fetch user media progress separately
    const { data: progressList } = await supabase
      .from('media_progress')
      .select('*')
      .eq('user_id', user.id)

    // Map to Audiobookshelf item schema (Fully mapped to match models)
    // Also flag items as is_missing if they have no audio files or if the DB flag is set
    const formattedItems = (items || []).map((item: any) => {
      const progressRecord = (progressList || []).find((p: any) => p.library_item_id === item.id) || null
      const mapped = mapBookForMobile(item, progressRecord)

      // Detect items with missing audio data
      const audioFiles = item.books?.audio_files || []
      const hasAudioFiles = Array.isArray(audioFiles) && audioFiles.length > 0
      const dbIsMissing = item.is_missing === true

      if (dbIsMissing || !hasAudioFiles) {
        mapped.is_missing = true
      }

      return mapped
    })

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
    return apiError('Internal server error', 'API_ERROR', 500)
  }
}
