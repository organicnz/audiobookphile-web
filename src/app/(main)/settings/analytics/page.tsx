'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/shared/utils/supabase/client'
import { useUser } from '@/shared/contexts/UserContext'
import { Activity, Book, Users, Database } from 'lucide-react'
import { useTypeSafeTranslations } from '@/shared/hooks/useTypeSafeTranslations'

export default function AnalyticsPage() {
  const [data, setData] = useState<{
    totalUsers: number
    totalLibraries: number
    totalItems: number
    activeSessions: number
  } | null>(null)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const { userIsAdmin } = useUser()
  const t = useTypeSafeTranslations()

  useEffect(() => {
    if (!userIsAdmin) {
      setError('Forbidden: Admins only')
      setLoading(false)
      return
    }

    const fetchAnalytics = async () => {
      const supabase = createClient()
      try {
        const { data: resData, error: apiError } = await supabase.functions.invoke('admin-analytics')
        if (apiError) throw new Error(apiError.message || 'Failed to fetch analytics')
        if (resData?.error) throw new Error(resData.error)

        setData(resData)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [userIsAdmin])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-error/10 text-error rounded-lg p-4">
        <h3 className="font-semibold">Failed to load analytics</h3>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  const kpis = [
    {
      title: 'Total Users',
      value: data?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Playback Sessions',
      value: data?.activeSessions || 0,
      icon: Activity,
      color: 'bg-green-500'
    },
    {
      title: 'Total Library Items',
      value: data?.totalItems || 0,
      icon: Book,
      color: 'bg-purple-500'
    },
    {
      title: 'Libraries Configured',
      value: data?.totalLibraries || 0,
      icon: Database,
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="w-full max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Server Analytics</h1>
        <p className="text-foreground-muted">Monitor your server&apos;s health and user activity.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.title} className="bg-primary-100/5 relative overflow-hidden rounded-xl border border-white/10 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`rounded-lg p-3 ${kpi.color} bg-opacity-20`}>
                <kpi.icon className={`h-6 w-6 text-white`} />
              </div>
              <div>
                <p className="text-foreground-muted text-sm font-medium">{kpi.title}</p>
                <h3 className="mt-1 text-3xl font-bold tracking-tighter">{kpi.value.toLocaleString()}</h3>
              </div>
            </div>
            {/* Decorative background circle */}
            <div className={`absolute -right-6 -bottom-6 h-24 w-24 rounded-full ${kpi.color} opacity-10 blur-xl`}></div>
          </div>
        ))}
      </div>
    </div>
  )
}
