import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const sessionId = resolvedParams.id

    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Extract libraryItemId from stateless sessionId
    const [libraryItemId] = sessionId.split('__')
    if (!libraryItemId) {
      return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 })
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

    // Parse body parameters (sent in camelCase by the Swift app)
    const body = await request.json()
    const { currentTime, duration, progress } = body as {
      currentTime?: number
      duration?: number
      progress?: number
    }

    if (typeof currentTime !== 'number') {
      return NextResponse.json({ error: 'currentTime must be a number' }, { status: 400 })
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
      return NextResponse.json({ error: 'Failed to sync progress' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('[API Session Sync] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
