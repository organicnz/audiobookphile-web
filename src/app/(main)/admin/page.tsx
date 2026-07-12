import { Suspense } from 'react'
import { createClient } from '@/shared/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/shared/lib/api/users'
import { AdminAnalyticsGrid } from '@/features/admin/components/AdminAnalyticsGrid'
import { AdminAnalyticsSkeleton } from '@/features/admin/components/AdminAnalyticsSkeleton'

export const dynamic = 'force-dynamic'

async function AnalyticsData() {
  const supabase = await createClient()

  const { data: resData, error: apiError } = await supabase.functions.invoke('admin-analytics')

  if (apiError) throw new Error(apiError.message || 'Failed to fetch analytics')
  if (resData?.error) throw new Error(resData.error)

  return <AdminAnalyticsGrid data={resData} />
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
    </div>
  )
}
