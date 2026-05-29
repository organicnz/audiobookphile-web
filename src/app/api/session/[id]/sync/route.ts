import { apiError } from '@/utils/apiResponse'
import { requireApiAuth } from '@/utils/apiAuth'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const sessionId = resolvedParams.id

    const { user, supabase } = await requireApiAuth(request)
    if (!user || !supabase) {
      return apiError('Unauthorized', 'UNAUTHORIZED', 401)
    }

    // Extract libraryItemId from stateless sessionId
    const [libraryItemId] = sessionId.split('__')
    if (!libraryItemId) {
      return apiError('Invalid session ID', 'API_ERROR', 400)
    }

    // Parse body parameters (sent in camelCase by the Swift app)
    const body = await request.json()
    const { currentTime, duration, progress } = body as {
      currentTime?: number
      duration?: number
      progress?: number
    }

    if (typeof currentTime !== 'number') {
      return apiError('currentTime must be a number', 'API_ERROR', 400)
    }

    const finalDuration = duration || 0
    const finalProgress = progress ?? (finalDuration > 0 ? currentTime / finalDuration : 0)
    const isFinished = finalDuration > 0 && currentTime >= finalDuration - 5

    // Upsert progress
    const { error: upsertError } = await supabase
      .from('media_progress')
      .upsert(
        {
          user_id: user.id,
          library_item_id: libraryItemId,
          episode_id: null,
          current_time_pos: currentTime,
          duration: finalDuration,
          progress: finalProgress,
          is_finished: isFinished,
          last_update: new Date().toISOString()
        },
        { onConflict: 'user_id,library_item_id,episode_id' }
      )

    if (upsertError) {
      console.error('[API Session Sync] DB upsert failed:', upsertError.message)
      return apiError('Failed to sync progress', 'API_ERROR', 500)
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('[API Session Sync] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
