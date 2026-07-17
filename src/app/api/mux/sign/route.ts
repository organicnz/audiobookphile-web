import { NextResponse } from 'next/server'
import Mux from '@mux/mux-node'
import { createClient } from '@/shared/lib/supabase/server'

export async function GET(req: Request) {
  const mux = new Mux({
    tokenId: process.env.MUX_TOKEN_ID || 'dummy_id',
    tokenSecret: process.env.MUX_TOKEN_SECRET || 'dummy_secret',
  })

  const { searchParams } = new URL(req.url)
  const playbackId = searchParams.get('playbackId')
  const contentId = searchParams.get('contentId')

  if (!playbackId || !contentId) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // RLS enforces access — if no row returns, user has no access
  const { data: content, error } = await supabase
    .from('content')
    .select('id')
    .eq('id', contentId)
    .single()

  if (error || !content) {
    return NextResponse.json({ error: 'Forbidden or Not Found' }, { status: 403 })
  }

  // Generate a signed JWT token for Mux playback (valid 6 hours)
  const token = await mux.jwt.signPlaybackId(playbackId, {
    type: 'video',
    expiration: '6h',
  })

  return NextResponse.json({ token })
}
