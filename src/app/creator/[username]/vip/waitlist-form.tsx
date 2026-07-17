'use client'

import { useState } from 'react'
import { createClient } from '@/shared/lib/supabase/client'
import { ArrowRight, Check } from 'lucide-react'

export default function WaitlistForm({ creatorId }: { creatorId: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    const supabase = createClient()
    const { error } = await supabase
      .from('creator_waitlists')
      .insert([{ creator_id: creatorId, fan_email: email.toLowerCase().trim() }])

    if (error) {
      if (error.code === '23505') {
        // Postgres unique constraint violation
        setErrorMessage("You're already on the VIP list!")
      } else {
        setErrorMessage('Something went wrong. Try again.')
      }
      setStatus('error')
    } else {
      setStatus('success')
    }
  }

  if (status === 'success') {
    return (
      <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-medium flex items-center justify-center gap-2 animate-fade-in-up">
        <Check className="w-5 h-5" />
        You&apos;re on the list! Check your inbox soon.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="email"
          required
          placeholder="Enter your email address..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'loading'}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-off-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 transition"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-1.5 shrink-0 transition disabled:opacity-50 shadow-[0_4px_14px_0_rgba(0,240,181,0.39)] hover:shadow-[0_6px_20px_rgba(0,240,181,0.5)] active:scale-95"
        >
          {status === 'loading' ? 'Joining...' : 'Join VIP'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      {status === 'error' && (
        <p className="text-xs text-destructive text-left pl-1">{errorMessage}</p>
      )}
    </form>
  )
}
