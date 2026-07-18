import React from 'react'
import Link from 'next/link'
import { Palette, Baby, MapPin } from 'lucide-react'

export default function CommunitiesHub() {
  return (
    <div className="min-h-[100dvh] w-full bg-black flex flex-col items-center p-6 sm:p-12 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-bio-emerald/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="z-10 text-center mb-16 animate-fade-in-up">
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-bio-teal to-bio-emerald tracking-tight mb-4">
          Shared Experiences
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto text-lg">
          Connect in dedicated spaces tailored to your life stage, your creative passions, and your exact coordinates.
        </p>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 z-10">
        
        {/* The Studio */}
        <div className="group liquid-glass p-8 rounded-3xl flex flex-col items-center text-center hover:border-primary/50 transition-all hover:-translate-y-2 cursor-not-allowed opacity-80">
          <div className="w-20 h-20 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(168,85,247,0.3)]">
            <Palette className="w-10 h-10 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">The Studio</h2>
          <p className="text-muted-foreground text-sm mb-6 flex-1">
            A collaborative sanctuary for artists, writers, musicians, and designers to create alongside their top fans.
          </p>
          <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/50 font-bold tracking-wider uppercase">Coming Soon</span>
        </div>

        {/* The Nursery */}
        <div className="group liquid-glass p-8 rounded-3xl flex flex-col items-center text-center hover:border-primary/50 transition-all hover:-translate-y-2 cursor-not-allowed opacity-80">
          <div className="w-20 h-20 rounded-full bg-pink-500/20 border border-pink-500/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(236,72,153,0.3)]">
            <Baby className="w-10 h-10 text-pink-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">The Nursery</h2>
          <p className="text-muted-foreground text-sm mb-6 flex-1">
            A supportive network exclusively for parents navigating life with newborns and toddlers up to 3 years old.
          </p>
          <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/50 font-bold tracking-wider uppercase">Coming Soon</span>
        </div>

        {/* The Block (Neighborhoods) */}
        <Link href="/communities/neighborhood" className="group liquid-glass p-8 rounded-3xl flex flex-col items-center text-center hover:border-bio-teal/80 transition-all hover:-translate-y-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-bio-teal/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-20 h-20 rounded-full bg-bio-teal/20 border border-bio-teal/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(45,212,191,0.4)]">
            <MapPin className="w-10 h-10 text-bio-teal" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">The Block</h2>
          <p className="text-muted-foreground text-sm mb-6 flex-1">
            Hyper-local living communities for neighbors. Strictly segregated and verified by your Zip Code.
          </p>
          <span className="px-6 py-2 rounded-full bg-bio-teal text-black font-bold tracking-wider uppercase text-sm group-hover:bg-bio-emerald transition-colors shadow-[0_0_20px_rgba(45,212,191,0.4)]">
            Enter Neighborhood
          </span>
        </Link>

      </div>
    </div>
  )
}
