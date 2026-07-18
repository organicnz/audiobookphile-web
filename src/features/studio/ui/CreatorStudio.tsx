'use client'

import React, { useState } from 'react'
import { Upload, Video, TrendingUp, Users, DollarSign, AlertTriangle, ShieldCheck } from 'lucide-react'
import { CreateDropModal } from './CreateDropModal'

export function CreatorStudio() {
  const [isDropModalOpen, setIsDropModalOpen] = useState(false)
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-white">Creator Studio</h1>
        <p className="mt-2 text-muted-foreground">Manage your content, engage your fans, and track earnings.</p>
      </header>

      {/* Quick Actions */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <button className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl liquid-glass-hover bg-amber-500/10 border-amber-500/30 group">
          <Upload className="w-8 h-8 text-amber-500 group-hover:-translate-y-1 transition-transform" />
          <span className="text-lg font-bold text-amber-500">Upload Video</span>
        </button>
        <button className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl liquid-glass-hover bg-amber-500/10 border-amber-500/30 group">
          <Video className="w-8 h-8 text-amber-500 group-hover:scale-110 transition-transform" />
          <span className="text-lg font-bold text-amber-500">Go Live</span>
        </button>
        <button 
          onClick={() => setIsDropModalOpen(true)}
          className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl liquid-glass-hover bg-amber-500/20 border-amber-500 group shadow-[0_0_15px_rgba(245,158,11,0.2)]"
        >
          <svg className="w-8 h-8 text-amber-500 group-hover:scale-110 transition-transform fill-amber-500 drop-shadow-md" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-lg font-bold text-amber-500 drop-shadow-md">Create Drop</span>
        </button>
      </section>

      {isDropModalOpen && <CreateDropModal onClose={() => setIsDropModalOpen(false)} />}

      {/* Analytics Dashboard */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" /> Performance (Last 30 Days)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel p-6 rounded-2xl flex flex-col">
            <span className="text-sm font-medium text-muted-foreground mb-1">Total Views</span>
            <span className="text-3xl font-bold text-white">1.2M</span>
            <span className="text-xs text-primary mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12% from last month
            </span>
          </div>
          <div className="glass-panel p-6 rounded-2xl flex flex-col">
            <span className="text-sm font-medium text-muted-foreground mb-1">Active Subscribers</span>
            <span className="text-3xl font-bold text-white">4,892</span>
            <span className="text-xs text-primary mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +5% from last month
            </span>
          </div>
          <div className="glass-panel p-6 rounded-2xl flex flex-col">
            <span className="text-sm font-medium text-muted-foreground mb-1">Total Earnings</span>
            <span className="text-3xl font-bold text-white">$12,450</span>
            <span className="text-xs text-primary mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +18% from last month
            </span>
          </div>
        </div>
      </section>

      {/* Moderation Inbox */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" /> Moderation Inbox
          </h2>
          <span className="text-xs text-muted-foreground">Automated by Aficionado Anti-Porn AI</span>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Flagged Content: "Summer Vibes Vlog"</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Our automated systems detected potential adult content at timestamp 01:24. The video is currently hidden from the public feed.
              </p>
              <div className="flex gap-3">
                <button className="px-4 py-2 text-xs font-bold rounded-full bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors">
                  Review & Edit
                </button>
                <button className="px-4 py-2 text-xs font-bold rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors">
                  Submit Appeal
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-4 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">All other recent uploads passed moderation checks.</span>
          </div>
        </div>
      </section>
    </div>
  )
}
