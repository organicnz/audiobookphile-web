import { NextResponse } from 'next/server'
import Mux from '@mux/mux-node'
import { createClient } from '@/shared/lib/supabase/server'

export async function GET(req: Request) {
  const tokenId = process.env.MUX_TOKEN_ID
  const tokenSecret = process.env.MUX_TOKEN_SECRET

  if (!tokenId || !tokenSecret) {
    console.error('Missing MUX_TOKEN_ID or MUX_TOKEN_SECRET')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const { searchParams } = new URL(req.url)
  const playbackId = searchParams.get('playbackId')
  const contentId = searchParams.get('contentId')

  if (!playbackId || !contentId) {
    return NextResponse.json({ error: 'Missing playbackId or contentId' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // RLS enforces subscription check — if no row returns, access is denied
  const { data: content, error } = await supabase
    .from('content')
    .select('id')
    .eq('id', contentId)
    .single()

  if (error || !content) {
    return NextResponse.json({ error: 'Forbidden or not found' }, { status: 403 })
  }

  const mux = new Mux({ tokenId, tokenSecret })

  const token = await mux.jwt.signPlaybackId(playbackId, {
    type: 'video',
    expiration: '6h',
  })

  return NextResponse.json({ token })
}
