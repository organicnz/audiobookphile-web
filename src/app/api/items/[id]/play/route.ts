import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { PlaybackService } from '@/lib/services/PlaybackService'

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

    // Call shared service
    const playbackService = new PlaybackService(supabase)
    const playbackSession = await playbackService.generateSession(itemId, user.id)

    return NextResponse.json(playbackSession)

  } catch (error: any) {
    console.error('[API Play Session] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: error.message.includes('not found') ? 404 : 500 })
  }
}
