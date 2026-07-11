'use client'

import { ImagePlus, Send, Sparkles } from 'lucide-react'
import { useFormStatus } from 'react-dom'
import { createPost } from '@/app/create/actions'
import { useState } from 'react'
import { cn } from '@/lib/utils'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all font-medium shadow-[0_4px_14px_0_rgba(0,240,181,0.39)] hover:shadow-[0_6px_20px_rgba(0,240,181,0.5)] active:scale-95 disabled:opacity-50 disabled:active:scale-100"
    >
      <span>{pending ? 'Publishing...' : 'Publish'}</span>
      <Send className="w-4 h-4" />
    </button>
  )
}

export function ComposeForm() {
  const [tone, setTone] = useState<'gentle' | 'direct' | 'clinical'>('gentle')
  
  return (
    <div className="liquid-glass p-6 animate-fade-in-up">
      <form action={createPost}>
        <textarea 
          name="content"
          className="w-full h-32 bg-transparent border-none resize-none text-off-white placeholder:text-muted-foreground focus:outline-none text-lg"
          placeholder="What's on your mind today?"
          required
        ></textarea>
        
        <div className="h-px w-full bg-white/10 my-4"></div>
        
        {/* Mock AI Tone Selector */}
        <div className="mb-6">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-3">
            <Sparkles className="w-3 h-3 text-primary" />
            AI Moderation Tone
          </label>
          <div className="flex gap-3">
            {(['gentle', 'direct', 'clinical'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTone(t)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 capitalize border",
                  tone === t 
                    ? "bg-primary/20 text-primary border-primary/30" 
                    : "bg-white/5 text-muted-foreground border-white/5 hover:bg-white/10 hover:text-off-white"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button type="button" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-off-white transition-colors cursor-not-allowed opacity-50" title="Media upload coming soon">
            <ImagePlus className="w-5 h-5" />
            <span className="text-sm font-medium">Add Media</span>
          </button>
          
          <SubmitButton />
        </div>
      </form>
    </div>
  )
}
