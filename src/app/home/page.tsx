import { FanFeed, type Video } from '@/features/feed/ui/FanFeed'
import { type Drop } from '@/features/feed/ui/DropZoneCarousel'
import { createClient } from '@/shared/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch approved content with creator username
  const { data: contentData } = await supabase
    .from('content')
    .select('id, mux_playback_id, description, moderation_status, profiles!inner(username)')
    .eq('moderation_status', 'approved')
    .not('mux_playback_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(20)

  const videos: Video[] = (contentData ?? []).map((c) => {
    const profile = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles
    return {
      id: c.id as string,
      creator: (profile as { username?: string })?.username ?? 'unknown',
      description: (c.description as string) ?? '',
      playbackId: (c.mux_playback_id as string) ?? '',
      likes: '0',
      comments: '0',
      isSubscribed: false,
      moderationStatus: (c.moderation_status as string) ?? 'approved',
    }
  })

  // Fetch recent posts as drops
  const { data: postsData } = await supabase
    .from('posts')
    .select('id, content, created_at, profiles!inner(username, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(10)

  const drops: Drop[] = (postsData ?? []).map((p) => {
    const profile = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles
    const username = (profile as { username?: string; avatar_url?: string })?.username ?? 'unknown'
    const avatarUrl = (profile as { username?: string; avatar_url?: string })?.avatar_url ?? ''
    return {
      id: p.id as string,
      creator: username,
      avatar: avatarUrl,
      hasUnread: false,
      content: (p.content as string) ?? '',
    }
  })

  return (
    <div className="h-[100dvh] w-full bg-black">
      <FanFeed videos={videos} drops={drops} />
    </div>
  )
}
