'use client'

import MuxPlayer from '@mux/mux-player-react'
import { SubscribeButton } from './SubscribeButton'
import { Lock, Heart, MessageCircle, DollarSign } from 'lucide-react'
import { Card, CardContent } from '@/shared/ui/core/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/core/avatar'
import { UserCircle2 } from 'lucide-react'
import type { ContentWithProfile } from '@/shared/types/database'

interface PostCardProps {
  post: ContentWithProfile
  index: number
}

export function PostCard({ post, index }: PostCardProps) {
  // If visibility is subscriber-only but we didn't get a playback ID,
  // RLS blocked access — user is not subscribed
  const isLocked = post.visibility === 'subscriber' && !post.mux_playback_id

  return (
    <Card
      className="liquid-glass-hover border-white/10 rounded-2xl animate-fade-in-up opacity-0 overflow-hidden"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
    >
      {/* Header (Author Info) */}
      <div className="p-4 flex items-center gap-3">
        <Avatar className="w-10 h-10 border border-white/10">
          <AvatarImage src={post.profiles?.avatar_url || ''} alt="Avatar" />
          <AvatarFallback className="bg-white/10">
            <UserCircle2 className="w-6 h-6 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-off-white">
            @{post.profiles?.username || 'creator'}
          </h3>
          <p className="text-xs text-muted-foreground">
            {new Date(post.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Content Area (Media or Paywall) */}
      <div className="relative bg-black w-full aspect-square md:aspect-video flex items-center justify-center">
        {isLocked ? (
          /* ── PAYWALL ── */
          <div className="absolute inset-0 backdrop-blur-md bg-black/60 flex flex-col items-center justify-center p-6 text-center">
            <Lock className="w-12 h-12 text-muted-foreground mb-4" />
            <h4 className="text-xl font-bold text-white mb-2">Exclusive Content</h4>
            <p className="text-sm text-white/70 mb-6 max-w-sm">
              Subscribe to @{post.profiles?.username || 'this creator'} to unlock this video and all other exclusive posts.
            </p>
            <SubscribeButton creatorId={post.author_id} priceId="price_YOUR_STRIPE_ID" />
          </div>
        ) : (
          /* ── UNLOCKED MEDIA ── */
          post.mux_playback_id ? (
            <MuxPlayer
              playbackId={post.mux_playback_id}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="p-8 text-muted-foreground text-center">
              Media is processing...
            </div>
          )
        )}
      </div>

      {/* Footer (Actions & Description) */}
      <CardContent className="p-4">
        <div className="flex items-center gap-4 mb-3">
          <button className="text-muted-foreground hover:text-rose-500 transition">
            <Heart className="w-6 h-6" />
          </button>
          <button className="text-muted-foreground hover:text-primary transition">
            <MessageCircle className="w-6 h-6" />
          </button>
          <button className="text-muted-foreground hover:text-emerald-500 transition ml-auto flex items-center gap-1">
            <DollarSign className="w-6 h-6" /> Tip
          </button>
        </div>
        <h2 className="font-bold text-off-white mb-1">{post.title}</h2>
        {post.description && (
          <p className="text-muted-foreground text-sm line-clamp-2">{post.description}</p>
        )}
      </CardContent>
    </Card>
  )
}
