'use client'

import { motion, Variants } from 'framer-motion'
import { Users, Activity, Book, Database } from 'lucide-react'

export interface AdminAnalyticsData {
  totalUsers: number
  totalLibraries: number
  totalItems: number
  activeSessions: number
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15
    }
  }
}

export function AdminAnalyticsGrid({ data }: { data: AdminAnalyticsData }) {
  const kpis = [
    {
      title: 'Total Users',
      value: data.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      trend: '+12% this week',
      trendColor: 'text-emerald-400 bg-emerald-400/10'
    },
    {
      title: 'Active Playback Sessions',
      value: data.activeSessions,
      icon: Activity,
      color: 'bg-green-500',
      trend: 'Live',
      trendColor: 'text-emerald-400 bg-emerald-400/10'
    },
    {
      title: 'Total Library Items',
      value: data.totalItems,
      icon: Book,
      color: 'bg-purple-500',
      trend: '+45 this month',
      trendColor: 'text-emerald-400 bg-emerald-400/10'
    },
    {
      title: 'Libraries Configured',
      value: data.totalLibraries,
      icon: Database,
      color: 'bg-orange-500',
      trend: 'Stable',
      trendColor: 'text-blue-400 bg-blue-400/10'
    }
  ]

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <motion.div
          key={kpi.title}
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white/60">{kpi.title}</p>
            <div className={`rounded-lg p-2 ${kpi.color} bg-opacity-20`}>
              <kpi.icon className="h-5 w-5 text-white" />
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-1">
            <h2 className="text-4xl font-bold tracking-tight text-white">{kpi.value.toLocaleString()}</h2>
            <span className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium ${kpi.trendColor}`}>{kpi.trend}</span>
          </div>

          {/* Decorative background circle */}
          <div className={`absolute -right-6 -bottom-6 h-24 w-24 rounded-full ${kpi.color} opacity-10 blur-xl`} />
        </motion.div>
      ))}
    </motion.div>
  )
}
