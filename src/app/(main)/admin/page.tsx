import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/shared/lib/api/users'
import { apiRequest } from '@/shared/lib/api/client'
import { AdminAnalyticsGrid } from '@/features/admin/components/AdminAnalyticsGrid'
import { AdminAnalyticsSkeleton } from '@/features/admin/components/AdminAnalyticsSkeleton'
import { AdminInvitePanel } from '@/features/admin/components/AdminInvitePanel'

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

export default async function AdminDashboardPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser || currentUser.user.type !== 'admin') {
    return redirect('/')
  }

  return (
    <div className="mx-auto w-full max-w-5xl p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">Admin Dashboard</h1>
        <p className="mt-2 text-white/60">System overview and analytics.</p>
      </div>

      <Suspense fallback={<AdminAnalyticsSkeleton />}>
        <AnalyticsData />
      </Suspense>

      {/* User Invitation */}
      <div className="mt-10">
        <h2 className="mb-4 text-xl font-semibold tracking-tight text-white/80">User Management</h2>
        <div className="max-w-md">
          <AdminInvitePanel />
        </div>
      </div>
    </div>
  )
}
