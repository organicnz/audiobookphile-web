'use client'

import React, { useState, useEffect } from 'react'
import { Users, MessageCircle, Send, Heart, DollarSign, X } from 'lucide-react'
import Link from 'next/link'

export function WatchPartyTheater({ username }: { username: string }) {
  const [messages, setMessages] = useState([
    { id: 1, user: 'superfan99', text: 'OMG so excited for this!', isTip: false },
    { id: 2, user: 'creator_supporter', text: 'Here for it 🔥', isTip: false },
    { id: 3, user: 'vip_john', text: 'Sent a $20 tip!', isTip: true }
  ])
  const [input, setInput] = useState('')

  // Simulate incoming chat messages
  useEffect(() => {
    const interval = setInterval(() => {
      const mockUsers = ['fan_girl', 'aficionado_joe', 'hype_master', 'cool_cat']
      const mockTexts = ['Woah!', 'This looks amazing', '🔥🔥🔥', 'Love this stream', 'Can you shout me out?']
      const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)]
      const randomText = mockTexts[Math.floor(Math.random() * mockTexts.length)]
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        user: randomUser,
        text: randomText,
        isTip: Math.random() > 0.9
      }].slice(-50)) // keep last 50
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    setMessages(prev => [...prev, { id: Date.now(), user: 'you', text: input, isTip: false }])
    setInput('')
  }

  return (
    <div className="h-[100dvh] w-full flex flex-col md:flex-row bg-black overflow-hidden">
      
      {/* Main Theater Area */}
      <div className="flex-1 relative flex flex-col">
        {/* Header Overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 z-10 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-3">
            <Link href="/home">
              <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <h1 className="text-white font-bold drop-shadow-md">LIVE: @{username}'s Watch Party</h1>
              </div>
              <p className="text-xs text-white/70">Exclusive VIP Event</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
            <Users className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-bold text-white">1,204</span>
          </div>
        </div>

        {/* Video Player Shell */}
        <div className="flex-1 bg-zinc-900 flex items-center justify-center relative">
          {/* Mock live stream placeholder */}
          <div className="text-center animate-pulse">
            <div className="w-24 h-24 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center mx-auto mb-4">
              <span className="text-amber-500 font-bold">STREAM</span>
            </div>
            <p className="text-muted-foreground text-sm">Awaiting video signal...</p>
          </div>
          
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        </div>
      </div>

      {/* Chat Sidebar */}
      <div className="w-full h-[40vh] md:h-full md:w-[350px] lg:w-[400px] flex flex-col bg-zinc-950 border-t md:border-t-0 md:border-l border-white/10 z-20">
        
        {/* Chat Header */}
        <div className="p-4 border-b border-white/10 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-amber-500" />
          <h2 className="text-white font-bold">Live Chat</h2>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scroll-smooth">
          {messages.map(msg => (
            <div key={msg.id} className="animate-fade-in">
              {msg.isTip ? (
                <div className="px-3 py-2 rounded-xl bg-amber-500/20 border border-amber-500/50 flex flex-col">
                  <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> {msg.user}
                  </span>
                  <span className="text-white text-sm">{msg.text}</span>
                </div>
              ) : (
                <div>
                  <span className="text-xs font-bold text-muted-foreground mr-2">{msg.user}</span>
                  <span className="text-white text-sm break-words">{msg.text}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-white/10 bg-zinc-950">
          <form onSubmit={handleSend} className="relative flex items-center gap-2">
            <button type="button" className="w-10 h-10 flex-shrink-0 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center hover:bg-amber-500/20 transition-colors">
              <DollarSign className="w-5 h-5" />
            </button>
            <div className="relative flex-1">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Say something..." 
                className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 px-4 pr-10 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
              />
              <button 
                type="submit"
                disabled={!input.trim()}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-amber-500 text-black flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  )
}
