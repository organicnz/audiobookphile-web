'use client'

import React, { useState } from 'react'
import { MapPin, ShieldAlert, ArrowLeft, Send } from 'lucide-react'
import Link from 'next/link'

export function NeighborhoodFeed({ userZipCode = '90210' }: { userZipCode?: string }) {
  // Simulate checking the requested neighborhood against the user's verified zip code
  // In a real app, this would be a dynamic route like /communities/neighborhood/[zipcode]
  const [targetZip, setTargetZip] = useState('90210')
  const [inputZip, setInputZip] = useState('')

  const isVerified = userZipCode === targetZip

  return (
    <div className="h-[100dvh] w-full bg-black flex flex-col max-w-md mx-auto relative border-x border-white/5 shadow-2xl">
      
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/communities">
            <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          </Link>
          <div>
            <h1 className="text-lg font-bold text-white">The Block</h1>
            <p className="text-xs text-bio-teal font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Zip: {targetZip}
            </p>
          </div>
        </div>
      </div>

      {/* Strict Boundary Enforcement */}
      {!isVerified ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in-up">
          <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <ShieldAlert className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-widest drop-shadow-md">Access Denied</h2>
          <p className="text-red-300 font-medium mb-2">
            You do not live in <span className="text-white font-bold">{targetZip}</span>.
          </p>
          <p className="text-muted-foreground text-sm max-w-[90%] mx-auto mb-8">
            Neighborhood communities are strictly segregated by verified Zip Codes to ensure safe, authentic local connections.
          </p>
          
          <div className="glass-panel p-4 rounded-2xl w-full">
            <p className="text-sm text-white/70 mb-3">Try visiting your verified neighborhood:</p>
            <button 
              onClick={() => setTargetZip(userZipCode)}
              className="w-full py-3 rounded-xl bg-bio-teal text-black font-bold uppercase tracking-wider hover:bg-bio-emerald transition-colors"
            >
              Go to {userZipCode}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col animate-fade-in">
          {/* Feed Switcher Simulation */}
          <div className="p-4 bg-bio-teal/10 border-b border-bio-teal/20 mb-4 flex items-center justify-between">
            <span className="text-sm font-bold text-bio-teal">Verified Resident</span>
            <div className="flex gap-2 text-xs text-muted-foreground">
              <span className="text-white font-medium">Local Feed</span>
              <span>•</span>
              <span>Events</span>
            </div>
          </div>

          {/* Posts */}
          <div className="flex-1 overflow-y-auto px-4 pb-20 space-y-4 hide-scrollbar">
            {/* Post 1 */}
            <div className="glass-panel p-4 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center">
                  <span className="text-blue-400 font-bold text-sm">SJ</span>
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Sarah Jenkins</h4>
                  <p className="text-xs text-muted-foreground">2 blocks away • 2h ago</p>
                </div>
              </div>
              <p className="text-sm text-white/90 mb-3">
                Anyone else's power flicker just now near Elm St? Wondering if I need to reset the router again.
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <button className="hover:text-white transition-colors">Like (12)</button>
                <button className="hover:text-white transition-colors">Comment (4)</button>
              </div>
            </div>

            {/* Post 2 */}
            <div className="glass-panel p-4 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center">
                  <span className="text-green-400 font-bold text-sm">MB</span>
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Marcus Brown</h4>
                  <p className="text-xs text-muted-foreground">0.5 miles away • 5h ago</p>
                </div>
              </div>
              <p className="text-sm text-white/90 mb-3">
                Hosting a local cleanup at the community park this Saturday at 9 AM! Coffee and donuts provided for anyone who helps out. 🍩☕️
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <button className="hover:text-white transition-colors">Like (45)</button>
                <button className="hover:text-white transition-colors">Comment (18)</button>
              </div>
            </div>
          </div>

          {/* Create Post Input */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black to-transparent">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Share with the neighborhood..." 
                className="w-full bg-white/10 border border-white/20 rounded-full py-3 px-4 pr-12 text-sm text-white focus:outline-none focus:border-bio-teal/50 transition-colors backdrop-blur-md"
              />
              <button className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-bio-teal text-black flex items-center justify-center hover:scale-105 transition-transform">
                <Send className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Demo Controls (Only visible for testing the boundary) */}
      {isVerified && (
        <div className="absolute -right-48 top-1/2 -translate-y-1/2 w-40 glass-panel p-4 rounded-xl hidden xl:block">
          <p className="text-xs text-muted-foreground mb-2">Simulate Boundary:</p>
          <button 
            onClick={() => setTargetZip('10001')}
            className="w-full py-2 rounded-lg bg-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/30 transition-colors"
          >
            Visit 10001
          </button>
        </div>
      )}
    </div>
  )
}
