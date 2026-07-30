import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/shared/lib/api/users'
import { apiRequest } from '@/shared/lib/api/client'
import { AdminAnalyticsGrid } from '@/features/admin/components/AdminAnalyticsGrid'
import { AdminAnalyticsSkeleton } from '@/features/admin/components/AdminAnalyticsSkeleton'

export const dynamic = 'force-dynamic'

async function AnalyticsData() {
  try {
    const resData = await apiRequest<any>('/api/admin-analytics', { method: 'GET' })
    if (resData?.error) throw new Error(resData.error)
    const safeData = {
      totalUsers: resData?.totalUsers ?? 1,
      totalLibraries: resData?.totalLibraries ?? 1,
      totalItems: resData?.totalItems ?? 0,
      activeSessions: resData?.activeSessions ?? 1
    }
    return <AdminAnalyticsGrid data={safeData} />
  } catch (error: any) {
    console.error('Failed to fetch analytics:', error)
    return (
      <AdminAnalyticsGrid
        data={{
          totalUsers: 1,
          totalLibraries: 1,
          totalItems: 0,
          activeSessions: 1
        }}
      />
    )
  }
}

export default async function AnalyticsPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser?.user || !['admin', 'root'].includes(currentUser.user.type)) {
    return redirect('/')
  }

  return (
    <div className="w-full max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Server Analytics</h1>
        <p className="text-foreground-muted">Monitor your server&apos;s health and user activity.</p>
      </div>

      <Suspense fallback={<AdminAnalyticsSkeleton />}>
        <AnalyticsData />
      </Suspense>
    </div>
  )
}
