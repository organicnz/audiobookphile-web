'use client'

import { useEffect, useState } from 'react'
import { apiRequest } from '@/shared/lib/api/browser'
import { AdminAnalyticsGrid, type AdminAnalyticsData } from './AdminAnalyticsGrid'
import { AdminAnalyticsSkeleton } from './AdminAnalyticsSkeleton'

const EMPTY: AdminAnalyticsData = {
  totalUsers: null,
  totalLibraries: null,
  totalItems: null,
  activeSessions: null
}

export default function AdminAnalyticsWidget() {
  const [data, setData] = useState<AdminAnalyticsData>(EMPTY)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    apiRequest<AdminAnalyticsData>('/api/admin-analytics', { method: 'GET' })
      .then((resData) => {
        if (cancelled) return
        setData({
          totalUsers: typeof resData?.totalUsers === 'number' ? resData.totalUsers : null,
          totalLibraries: typeof resData?.totalLibraries === 'number' ? resData.totalLibraries : null,
          totalItems: typeof resData?.totalItems === 'number' ? resData.totalItems : null,
          activeSessions: typeof resData?.activeSessions === 'number' ? resData.activeSessions : null
        })
      })
      .catch(() => {
        if (!cancelled) setData(EMPTY)
      })
      .finally(() => {
        if (!cancelled) setReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!ready) {
    return <AdminAnalyticsSkeleton />
  }

  return <AdminAnalyticsGrid data={data} />
}
