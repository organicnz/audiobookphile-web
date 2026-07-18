'use client'

import React, { useState } from 'react'
import MuxPlayer from '@mux/mux-player-react'
import { Heart, MessageCircle, Share2, DollarSign, Star, MoreVertical } from 'lucide-react'

// Mock Data
const MOCK_VIDEOS = [
  {
    id: '1',
    creator: 'alexa_streams',
    description: 'Welcome to my new premium setup! ✨',
    playbackId: 'DS00Spx1CV902MCtPj5WknGlR102V5HFkDe',
    likes: '12.4K',
    comments: '342',
    isSubscribed: false,
  },
  {
    id: '2',
    creator: 'fitness_guru',
    description: 'Quick morning routine for subscribers 💪',
    playbackId: 'qxb01i6T202008AyaVKtKKGQq5OQ00U88s1c',
    likes: '8.1K',
    comments: '128',
    isSubscribed: true,
  },
  {
    id: '3',
    creator: 'gamer_pro',
    description: 'Insane clutch moment! 🎮🔥',
    playbackId: 'Fu6G0099Qn3u7CebH5e00300QjO2D99zGvN',
    likes: '45K',
    comments: '1.2K',
    isSubscribed: false,
  }
]

import { DropZoneCarousel } from './DropZoneCarousel'

export function FanFeed() {
  const [activeVideo, setActiveVideo] = useState(0)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    const index = Math.round(container.scrollTop / container.clientHeight)
    if (index !== activeVideo) {
      setActiveVideo(index)
    }
  }

  return (
    <div className="h-full w-full max-w-md mx-auto relative bg-black">
      {/* Absolute top Drop Zone Carousel */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent pt-2">
        <DropZoneCarousel />
      </div>

      {/* Main scrolling video feed */}
      <div 
        className="h-full w-full relative snap-y snap-mandatory overflow-y-scroll hide-scrollbar"
        onScroll={handleScroll}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
      {MOCK_VIDEOS.map((video, idx) => (
        <div key={video.id} className="h-full w-full snap-start relative bg-black flex justify-center items-center">
          {/* Video Player */}
          <MuxPlayer
            playbackId={video.playbackId}
            className="h-full w-full object-cover"
            loop
            muted={false}
            autoPlay={idx === activeVideo ? "any" : false}
            streamType="on-demand"
            style={{ '--controls': 'none' } as React.CSSProperties}
          />

          {/* Overlay UI (Liquid Glass) */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/10 via-transparent to-black/60" />

          {/* Right Floating Actions */}
          <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-10 pointer-events-auto">
            <button className="flex flex-col items-center gap-1 group">
              <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center transition-transform group-hover:scale-110">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-white drop-shadow-md">{video.likes}</span>
            </button>

            <button className="flex flex-col items-center gap-1 group">
              <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center transition-transform group-hover:scale-110">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-white drop-shadow-md">{video.comments}</span>
            </button>

            <button className="flex flex-col items-center gap-1 group">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 backdrop-blur-xl border border-amber-500/50 flex items-center justify-center transition-transform group-hover:scale-110">
                <DollarSign className="w-6 h-6 text-amber-500" />
              </div>
              <span className="text-xs font-medium text-amber-500 drop-shadow-md">Tip</span>
            </button>

            <button className="flex flex-col items-center gap-1 group">
              <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center transition-transform group-hover:scale-110">
                <Share2 className="w-6 h-6 text-white" />
              </div>
            </button>
          </div>

          {/* Bottom Left Info */}
          <div className="absolute left-4 bottom-20 max-w-[70%] z-10 pointer-events-auto">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-lg font-bold text-white drop-shadow-lg">@{video.creator}</h2>
              {!video.isSubscribed ? (
                <button className="px-3 py-1 text-xs font-bold rounded-full bg-amber-500 text-black uppercase tracking-wider hover:bg-amber-400 transition-colors">
                  Subscribe
                </button>
              ) : (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 border border-amber-500/50">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span className="text-[10px] font-bold text-amber-500 uppercase">VIP</span>
                </div>
              )}
            </div>
            <p className="text-sm text-white/90 drop-shadow-md line-clamp-2">
              {video.description}
            </p>
          </div>
        </div>
      ))}
      </div>
    </div>
  )
}
