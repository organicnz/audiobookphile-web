import { createClient } from '@/shared/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CreatorProfileClient } from './CreatorProfileClient'

export default async function CreatorProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  // Fetch creator profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, bio, avatar_url, user_type')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  // Fetch active subscriber count
  const { count: subscriberCount } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('creator_id', profile.id)
    .eq('status', 'active')

  // Fetch public content
  const { data: contentItems } = await supabase
    .from('content')
    .select('id, mux_playback_id, title, description, visibility')
    .eq('author_id', profile.id)
    .eq('moderation_status', 'approved')
    .in('visibility', ['public', 'subscriber'])
    .order('created_at', { ascending: false })
    .limit(12)

  return (
    <CreatorProfileClient
      profile={profile}
      subscriberCount={subscriberCount ?? 0}
      contentItems={contentItems ?? []}
    />
  )
}
