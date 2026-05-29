import { apiError } from '@/utils/apiResponse'
import { requireApiAuth } from '@/utils/apiAuth'
import { NextResponse } from 'next/server'

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

    // Fetch progress for this user and item
    const { data: progressRecord, error: progressError } = await supabase
      .from('media_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('library_item_id', itemId)
      .maybeSingle()

    if (progressError) {
      console.error('[API Get Progress] DB query failed:', progressError.message)
      return apiError('Failed to fetch progress', 'API_ERROR', 500)
    }

    if (!progressRecord) {
      // Audiobookshelf mobile API returns 404 if no progress exists yet,
      // and the app correctly catches 404 to return nil progress.
      return apiError('No progress found', 'API_ERROR', 404)
    }

    // Map to the Swift MediaProgress decoder:
    // (Notice that current_time_pos maps to current_time in snake_case)
    const formattedProgress = {
      id: progressRecord.id,
      library_item_id: progressRecord.library_item_id,
      episode_id: progressRecord.episode_id || null,
      duration: Number(progressRecord.duration) || 0,
      progress: Number(progressRecord.progress) || 0,
      current_time: Number(progressRecord.current_time_pos) || 0,
      is_finished: progressRecord.is_finished || false,
      hide_from_continue_listening: false,
      last_update: new Date(progressRecord.last_update).getTime(),
      started_at: new Date(progressRecord.last_update).getTime(),
      finished_at: progressRecord.is_finished ? new Date(progressRecord.last_update).getTime() : null
    }

    return NextResponse.json(formattedProgress)

  } catch (error: any) {
    console.error('[API Get Progress] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
