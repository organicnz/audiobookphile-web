import { apiError } from '@/utils/apiResponse'
import { requireApiAuth } from '@/utils/apiAuth'
import { NextResponse } from 'next/server'
import { PlaybackService } from '@/lib/services/PlaybackService'

export async function POST(
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

    // Call shared service
    const playbackService = new PlaybackService(supabase)
    const playbackSession = await playbackService.generateSession(itemId, user.id)

    return NextResponse.json(playbackSession)

  } catch (error: any) {
    console.error('[API Play Session] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: error.message.includes('not found') ? 404 : 500 })
  }
}
