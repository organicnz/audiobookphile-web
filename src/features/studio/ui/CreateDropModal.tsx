'use client'

import React from 'react'
import { X, ImagePlus, Send } from 'lucide-react'
import { useFormStatus } from 'react-dom'
import { createPost } from '@/app/create/actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-black rounded-full hover:bg-amber-400 transition-all font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] active:scale-95 disabled:opacity-50 disabled:active:scale-100"
    >
      <span>{pending ? 'Dropping...' : 'Drop It'}</span>
      <Send className="w-4 h-4 ml-1" />
    </button>
  )
}

export function CreateDropModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg glass-panel p-1 rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 bg-black/60">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500 fill-amber-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Create Drop
          </h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <form action={createPost}>
            <textarea 
              name="content"
              className="w-full h-32 bg-transparent border-none resize-none text-white placeholder:text-muted-foreground focus:outline-none text-xl"
              placeholder="What's dropping?"
              required
              autoFocus
            ></textarea>
            
            <div className="h-px w-full bg-white/10 my-6"></div>

            <div className="flex items-center justify-between">
              <button 
                type="button" 
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white transition-colors cursor-not-allowed opacity-50" 
                title="Media upload coming soon"
              >
                <ImagePlus className="w-5 h-5" />
                <span className="text-sm font-medium">Add Media</span>
              </button>
              
              <SubmitButton />
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
