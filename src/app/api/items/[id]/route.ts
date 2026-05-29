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
    const itemId = resolvedParams.id

    const { user, supabase } = await requireApiAuth(request)
    if (!user || !supabase) {
      return apiError('Unauthorized', 'UNAUTHORIZED', 401)
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
      console.error('[API Get Item] Item not found:', itemError?.message)
      return apiError('Item not found', 'API_ERROR', 404)
    }

    // Fetch user media progress separately
    const { data: progressRecord } = await supabase
      .from('media_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('library_item_id', item.id)
      .maybeSingle()

    const formattedBook = mapBookForMobile(item, progressRecord)
    return NextResponse.json(formattedBook)
  } catch (error) {
    console.error('[API Get Item] Error:', error)
    return apiError('Internal server error', 'API_ERROR', 500)
  }
}
