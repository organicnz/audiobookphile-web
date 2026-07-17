import { createClient } from '@/shared/lib/supabase/server'
import { notFound } from 'next/navigation'
import MuxPlayer from '@mux/mux-player-react'
import type { Content, ContentVisibility } from '@/shared/types/database'

async function getContent(id: string): Promise<Content | null> {
  const supabase = await createClient()

  // RLS automatically blocks access if not subscribed or grace period expired
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('id', id)
    .single<Content>()

  if (error || !data) return null
  return data
}

async function getMuxToken(playbackId: string, contentId: string): Promise<string | undefined> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/mux/sign?playbackId=${playbackId}&contentId=${contentId}`,
    { cache: 'no-store' }
  )
  if (!res.ok) return undefined
  const data = await res.json()
  return data.token
}

export default async function ContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const content = await getContent(id)

  if (!content) {
    notFound()
  }

  // If content is subscriber-only, get a signed JWT token for Mux playback
  let muxToken: string | undefined
  if (content.visibility === ('subscriber' satisfies ContentVisibility) && content.mux_playback_id) {
    muxToken = await getMuxToken(content.mux_playback_id, content.id)
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4 text-off-white">{content.title}</h1>

      {content.description && (
        <p className="text-muted-foreground text-sm mb-6">{content.description}</p>
      )}

      <div className="aspect-video bg-black rounded-xl overflow-hidden">
        {content.mux_playback_id ? (
          <MuxPlayer
            playbackId={content.mux_playback_id}
            tokens={muxToken ? { playback: muxToken } : undefined}
            metadata={{
              video_title: content.title,
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Media is processing...
          </div>
        )}
      </div>
    </div>
  )
}
