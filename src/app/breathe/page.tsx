'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function BreathePage() {
  const [phase, setPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle')
  const [progress, setProgress] = useState(0)
  
  useEffect(() => {
    if (phase === 'idle') return

    let timer: NodeJS.Timeout
    let progressTimer: NodeJS.Timeout
    
    // Coherent breathing: 4s inhale, 7s hold, 8s exhale (4-7-8 method)
    // For simplicity of visual loop, we'll do 4s inhale, 6s exhale (10s cycle = 6 breaths/min)
    if (phase === 'inhale') {
      setProgress(0)
      progressTimer = setInterval(() => setProgress(p => p + (100 / 40)), 100)
      timer = setTimeout(() => setPhase('exhale'), 4000)
    } else if (phase === 'exhale') {
      setProgress(100)
      progressTimer = setInterval(() => setProgress(p => p - (100 / 60)), 100)
      timer = setTimeout(() => setPhase('inhale'), 6000)
    }

    return () => {
      clearTimeout(timer)
      clearInterval(progressTimer)
    }
  }, [phase])

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background">
      {/* Background ambient lighting that shifts with breath */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ease-in-out ${
          phase === 'inhale' ? 'opacity-40' : phase === 'exhale' ? 'opacity-10' : 'opacity-20'
        }`}
      >
        <div className="absolute inset-0 bg-secondary/30 blur-[100px] mix-blend-screen" />
      </div>

      <div className="absolute top-8 left-6 z-50">
        <Link href="/home" className="flex items-center text-muted-foreground hover:text-off-white transition-colors">
          <ArrowLeft className="w-6 h-6 mr-2" />
          <span className="font-medium">Back</span>
        </Link>
      </div>

      <div className="z-10 text-center mb-16">
        <h1 className="text-3xl font-bold tracking-tight text-off-white mb-2">Urge Surfing</h1>
        <p className="text-muted-foreground max-w-sm mx-auto px-4">
          Ride the wave. Urges are temporary and will pass. Follow the orb to regulate your nervous system.
        </p>
      </div>

      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* The Breathing Orb */}
        <div 
          className="absolute rounded-full mix-blend-screen blur-[2px]"
          style={{
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle, rgba(0,240,181,0.8) 0%, rgba(18,42,59,0.4) 70%, transparent 100%)',
            transition: 'transform 4s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: phase === 'inhale' ? 'scale(1.5)' : phase === 'exhale' ? 'scale(0.8)' : 'scale(1)'
          }}
        />
        
        {/* Core solid orb */}
        <div 
          className="absolute rounded-full border border-white/20 shadow-[0_0_40px_rgba(0,240,181,0.3)]"
          style={{
            width: '120px',
            height: '120px',
            background: 'linear-gradient(135deg, rgba(0,240,181,0.6) 0%, rgba(18,42,59,0.9) 100%)',
            backdropFilter: 'blur(8px)',
            transition: 'transform 4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 4s ease',
            transform: phase === 'inhale' ? 'scale(1.2)' : phase === 'exhale' ? 'scale(0.8)' : 'scale(1)',
            boxShadow: phase === 'inhale' 
              ? '0 0 80px rgba(0,240,181,0.6), inset 0 0 20px rgba(255,255,255,0.4)' 
              : '0 0 20px rgba(0,240,181,0.2), inset 0 0 5px rgba(255,255,255,0.1)'
          }}
        />

        <div className="absolute z-20 font-medium text-off-white/90 uppercase tracking-widest text-sm">
          {phase === 'idle' ? 'Tap to start' : phase}
        </div>
      </div>

      <div className="mt-20 z-10">
        {phase === 'idle' ? (
          <button 
            onClick={() => setPhase('inhale')}
            className="px-8 py-3 rounded-full bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 hover:shadow-[0_0_20px_rgba(0,240,181,0.3)] transition-all duration-300"
          >
            Start Breathing
          </button>
        ) : (
          <button 
            onClick={() => setPhase('idle')}
            className="text-muted-foreground hover:text-off-white transition-colors uppercase tracking-wider text-sm"
          >
            End Session
          </button>
        )}
      </div>
    </div>
  )
}
