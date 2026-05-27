import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(
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

    // Fetch progress for this user and item
    const { data: progressRecord, error: progressError } = await supabase
      .from('media_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('library_item_id', itemId)
      .maybeSingle()

    if (progressError) {
      console.error('[API Get Progress] DB query failed:', progressError.message)
      return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
    }

    if (!progressRecord) {
      // Audiobookshelf mobile API returns 404 if no progress exists yet,
      // and the app correctly catches 404 to return nil progress.
      return NextResponse.json({ error: 'No progress found' }, { status: 404 })
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
