import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/shared/lib/api/users'
import { apiRequest } from '@/shared/lib/api/client'
import { AdminAnalyticsGrid } from '@/features/admin/components/AdminAnalyticsGrid'
import { AdminAnalyticsSkeleton } from '@/features/admin/components/AdminAnalyticsSkeleton'

export const dynamic = 'force-dynamic'

async function AnalyticsData() {
  try {
    const resData = await apiRequest<any>('/admin-analytics', { method: 'POST' })
    if (resData?.error) throw new Error(resData.error)
    return <AdminAnalyticsGrid data={resData} />
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch analytics')
  }
}

export default async function AnalyticsPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser || currentUser.user.type !== 'admin') {
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
