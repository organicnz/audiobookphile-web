'use client'

import React, { useState } from 'react'
import MuxPlayer from '@mux/mux-player-react'
import { Heart, MessageCircle, Share2, DollarSign, Star, MoreVertical, Lock, Clock, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { DropZoneCarousel, type Drop } from './DropZoneCarousel'
import { TipModal } from '@/features/monetization/ui/TipModal'

export interface Video {
  id: string
  creator: string
  description: string
  playbackId: string
  likes: string
  comments: string
  isSubscribed: boolean
  unlocksAt?: string
  moderationStatus?: string
}

export function FanFeed({ videos, drops }: { videos: Video[], drops: Drop[] }) {
  const [activeVideo, setActiveVideo] = useState(0)
  const [tipModalCreator, setTipModalCreator] = useState<string | null>(null)
  const [revealedNsfw, setRevealedNsfw] = useState<Record<string, boolean>>({})

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
        <DropZoneCarousel drops={drops} />
      </div>

      {/* Main scrolling video feed */}
      <div 
        className="h-full w-full relative snap-y snap-mandatory overflow-y-scroll hide-scrollbar"
        onScroll={handleScroll}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
      {videos.map((video, idx) => {
        const isLocked = video.unlocksAt && new Date(video.unlocksAt) > new Date();
        const unlockDateString = video.unlocksAt ? new Date(video.unlocksAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
        const isNsfw = video.moderationStatus === 'rejected' && !revealedNsfw[video.id];
        
        const shouldBlur = isLocked || isNsfw;
        const autoPlayVideo = !shouldBlur && idx === activeVideo;

        return (
        <div key={video.id} className="h-full w-full snap-start relative bg-black flex justify-center items-center">
          {/* Video Player */}
          <div className={`absolute inset-0 transition-all duration-1000 ${shouldBlur ? 'blur-2xl scale-110 opacity-50' : ''}`}>
            <MuxPlayer
              playbackId={video.playbackId}
              className="h-full w-full object-cover pointer-events-none"
              loop
              muted={false}
              autoPlay={autoPlayVideo ? "any" : false}
              streamType="on-demand"
              style={{ '--controls': 'none' } as any}
            />
          </div>

          {isNsfw && !isLocked && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center animate-fade-in-up">
              <div className="w-20 h-20 rounded-full bg-red-500/20 backdrop-blur-md border border-red-500/50 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                <EyeOff className="w-10 h-10 text-red-400 drop-shadow-md" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-widest drop-shadow-lg">Sensitive Content</h3>
              <p className="text-red-200 font-medium mb-8 max-w-[80%]">This video contains adult themes.</p>
              
              <button 
                onClick={() => setRevealedNsfw(prev => ({ ...prev, [video.id]: true }))}
                className="px-8 py-4 rounded-full bg-red-600 text-white font-bold tracking-wider hover:bg-red-500 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] active:scale-95 uppercase text-sm"
              >
                I am over 18 - Reveal
              </button>
            </div>
          )}

          {isLocked && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center animate-fade-in-up">
              <div className="w-20 h-20 rounded-full bg-indigo-500/20 backdrop-blur-md border border-indigo-500/50 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                <Lock className="w-10 h-10 text-indigo-400 drop-shadow-md" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-widest drop-shadow-lg">Time Capsule</h3>
              <p className="text-indigo-200 font-medium mb-6 max-w-[80%]">This exclusive drop is sealed.</p>
              
              <div className="glass-panel px-6 py-4 rounded-2xl flex items-center gap-3 mb-8">
                <Clock className="w-5 h-5 text-indigo-400 animate-pulse" />
                <div className="text-left">
                  <div className="text-xs text-indigo-200/70 font-medium uppercase tracking-wider">Unlocks On</div>
                  <div className="text-lg font-bold text-white">{unlockDateString}</div>
                </div>
              </div>

              <button className="px-8 py-4 rounded-full bg-indigo-500 text-white font-bold tracking-wider hover:bg-indigo-400 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] active:scale-95 uppercase text-sm">
                Set Reminder
              </button>
            </div>
          )}

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

            <button 
              onClick={() => setTipModalCreator(video.creator)}
              className="flex flex-col items-center gap-1 group"
            >
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
              <Link href={`/${video.creator}`}>
                <h2 className="text-lg font-bold text-white drop-shadow-lg hover:underline decoration-amber-500">@{video.creator}</h2>
              </Link>
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
        );
      })}
      </div>

      {tipModalCreator && (
        <TipModal 
          creatorId={tipModalCreator} 
          onClose={() => setTipModalCreator(null)} 
        />
      )}
    </div>
  )
}
