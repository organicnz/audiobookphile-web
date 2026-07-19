'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { InnerCircleView } from '@/features/circles/ui/InnerCircleView'
import { ArrowLeft, Grip, Lock, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'

interface Profile {
  id: string
  username: string
  bio?: string
  avatar_url?: string
  user_type?: string
}

interface ContentItem {
  id: string
  mux_playback_id?: string
  title: string
  description?: string
  visibility: string
}

interface Props {
  profile: Profile
  subscriberCount: number
  contentItems: ContentItem[]
}

export function CreatorProfileClient({ profile, subscriberCount, contentItems }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'feed' | 'circle'>('feed')

  const formattedCount = subscriberCount >= 1000
    ? `${(subscriberCount / 1000).toFixed(1)}K`
    : subscriberCount.toString()

  return (
    <div className="min-h-[100dvh] bg-black text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {profile.avatar_url && (
            <Image
              src={profile.avatar_url}
              alt={profile.username}
              width={36}
              height={36}
              className="rounded-full object-cover flex-shrink-0"
            />
          )}
          <div className="min-w-0">
            <h1 className="text-base font-bold truncate">@{profile.username}</h1>
            <p className="text-xs text-muted-foreground">
              {formattedCount} Subscriber{subscriberCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </header>

      {/* Bio */}
      {profile.bio && (
        <div className="px-4 py-3 border-b border-white/10">
          <p className="text-sm text-muted-foreground">{profile.bio}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab('feed')}
          className={cn(
            'flex-1 py-4 text-sm font-bold uppercase tracking-wider relative transition-colors',
            activeTab === 'feed' ? 'text-white' : 'text-white/40 hover:text-white/60'
          )}
        >
          <div className="flex items-center justify-center gap-2">
            <Grip className="w-4 h-4" /> Public Feed
          </div>
          {activeTab === 'feed' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('circle')}
          className={cn(
            'flex-1 py-4 text-sm font-bold uppercase tracking-wider relative transition-colors',
            activeTab === 'circle' ? 'text-amber-500' : 'text-amber-500/40 hover:text-amber-500/60'
          )}
        >
          <div className="flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" /> Inner Circle
          </div>
          {activeTab === 'circle' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 relative">
        {activeTab === 'feed' ? (
          contentItems.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
              No content yet.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-0.5 p-0.5">
              {contentItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/content/${item.id}`}
                  className="aspect-[9/16] bg-white/5 relative overflow-hidden group cursor-pointer"
                >
                  {item.mux_playback_id ? (
                    <img
                      src={`https://image.mux.com/${item.mux_playback_id}/thumbnail.jpg?width=400`}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/5" />
                  )}
                  {item.visibility === 'subscriber' && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-amber-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : (
          <InnerCircleView username={profile.username} />
        )}
      </div>
    </div>
  )
}
