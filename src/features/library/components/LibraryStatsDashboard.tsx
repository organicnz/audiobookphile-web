'use client'

import { motion } from 'framer-motion'
import { BookOpen, CalendarDays, Clock, HardDrive, Layers, Users } from 'lucide-react'
import { useLibraryStats } from '../hooks/useLibraryStats'

// Utility for formatting bytes
function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

// Utility for formatting duration in seconds to hours/days
function formatDuration(seconds: number) {
  if (!seconds) return '0 hours'
  const hours = seconds / 3600
  if (hours > 24) {
    const days = Math.floor(hours / 24)
    const remainingHours = Math.round(hours % 24)
    return `${days}d ${remainingHours}h`
  }
  return `${Math.round(hours)} hours`
}

export function LibraryStatsDashboard({ libraryId }: { libraryId: string }) {
  const { data: stats, isLoading, isError } = useLibraryStats(libraryId)

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="border-accent h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 opacity-60" />
      </div>
    )
  }

  if (isError || !stats) {
    return <div className="text-foreground-muted flex w-full items-center justify-center p-12">Failed to load library stats.</div>
  }

  const cards = [
    {
      title: 'Total Books',
      value: stats.totalBooks.toLocaleString(),
      icon: BookOpen,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10'
    },
    {
      title: 'Total Authors',
      value: stats.totalAuthors.toLocaleString(),
      icon: Users,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10'
    },
    {
      title: 'Total Series',
      value: stats.totalSeries.toLocaleString(),
      icon: Layers,
      color: 'text-pink-400',
      bg: 'bg-pink-400/10'
    },
    {
      title: 'Total Duration',
      value: formatDuration(stats.totalDuration),
      icon: Clock,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10'
    },
    {
      title: 'Library Size',
      value: formatBytes(stats.totalSize),
      icon: HardDrive,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10'
    },
    {
      title: 'Added Last 30 Days',
      value: stats.addedLast30Days.toLocaleString(),
      icon: CalendarDays,
      color: 'text-cyan-400',
      bg: 'bg-cyan-400/10'
    }
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-white/90">Library Stats</h1>
        <p className="text-white/50">Overview of your library contents and metrics.</p>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <motion.div
            key={card.title}
            variants={item}
            whileHover={{ scale: 1.02, y: -4 }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md transition-all"
          >
            {/* Ambient Glow */}
            <div className={`absolute -top-6 -right-6 h-24 w-24 rounded-full opacity-50 blur-2xl transition-opacity group-hover:opacity-100 ${card.bg}`} />

            <div className="relative z-10 flex items-center justify-between">
              <div className={`rounded-xl p-3 ${card.bg} ${card.color}`}>
                <card.icon className="h-6 w-6" />
              </div>
            </div>

            <div className="relative z-10 mt-6 flex flex-col space-y-1">
              <h3 className="text-sm font-medium tracking-wider text-white/50 uppercase">{card.title}</h3>
              <p className="text-4xl font-bold tracking-tight text-white/90">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
