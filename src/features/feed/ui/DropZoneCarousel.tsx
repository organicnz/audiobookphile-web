'use client'

import React, { useState } from 'react'
import { X, Play } from 'lucide-react'

// Mock data for drops
const MOCK_DROPS = [
  { id: '1', creator: 'alexa_streams', avatar: 'https://i.pravatar.cc/150?u=alexa', hasUnread: true, content: 'Getting ready for the stream! 💄' },
  { id: '2', creator: 'fitness_guru', avatar: 'https://i.pravatar.cc/150?u=fitness', hasUnread: true, content: 'Morning pump is real 💪' },
  { id: '3', creator: 'gamer_pro', avatar: 'https://i.pravatar.cc/150?u=gamer', hasUnread: false, content: 'New high score, check the VOD' },
  { id: '4', creator: 'chef_boyardee', avatar: 'https://i.pravatar.cc/150?u=chef', hasUnread: true, content: 'Secret recipe drop incoming...' },
  { id: '5', creator: 'music_maker', avatar: 'https://i.pravatar.cc/150?u=music', hasUnread: false, content: 'Studio time 🎧' },
]

export function DropZoneCarousel() {
  const [activeDrop, setActiveDrop] = useState<typeof MOCK_DROPS[0] | null>(null)

  return (
    <>
      {/* Horizontal Carousel */}
      <div className="w-full pt-4 pb-2 px-4 overflow-x-auto hide-scrollbar flex gap-4 items-center">
        {MOCK_DROPS.map((drop) => (
          <button 
            key={drop.id}
            onClick={() => setActiveDrop(drop)}
            className="flex flex-col items-center gap-1 flex-shrink-0 group focus:outline-none"
          >
            <div className={`w-16 h-16 rounded-full p-[2px] transition-transform group-active:scale-95 ${
              drop.hasUnread ? 'bg-gradient-to-tr from-amber-600 to-amber-400' : 'bg-white/20'
            }`}>
              <div className="w-full h-full rounded-full border-2 border-black overflow-hidden bg-black flex items-center justify-center">
                 {/* Fallback avatar if external image fails, though pravatar usually works */}
                 <img src={drop.avatar} alt={drop.creator} className="w-full h-full object-cover" />
              </div>
            </div>
            <span className="text-[10px] text-white/90 truncate w-16 text-center font-medium drop-shadow-md">
              {drop.creator}
            </span>
          </button>
        ))}
      </div>

      {/* Fullscreen Drop Viewer Modal */}
      {activeDrop && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col animate-fade-in">
          {/* Top progress bar (mocked static) */}
          <div className="w-full p-4 flex gap-1 pt-12">
            <div className="h-1 bg-white rounded-full flex-1" />
          </div>
          
          <header className="flex items-center justify-between px-4 pb-4">
            <div className="flex items-center gap-2">
              <img src={activeDrop.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
              <span className="text-sm font-bold text-white">@{activeDrop.creator}</span>
              <span className="text-xs text-muted-foreground ml-2">2h</span>
            </div>
            <button 
              onClick={() => setActiveDrop(null)}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            {/* Mock ephemeral content display */}
            <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mb-6">
              <Play className="w-10 h-10 text-amber-500 ml-1" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{activeDrop.content}</h2>
            <p className="text-muted-foreground">Tap to view full drop</p>
          </div>
        </div>
      )}
    </>
  )
}
