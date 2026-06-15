import { getCurrentUser } from '@/shared/lib/api/users'
import { apiRequest } from '@/shared/lib/api/client'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface AdminAnalyticsResponse {
  totalUsers: number
  totalLibraries: number
  totalItems: number
  activeSessions: number
}

export default async function AdminDashboardPage() {
  const currentUser = await getCurrentUser()
  
  if (!currentUser || currentUser.user.type !== 'admin') {
    return redirect('/')
  }

  let analytics: AdminAnalyticsResponse | null = null
  let errorMsg: string | null = null

  try {
    // Calling the Edge Function
    analytics = await apiRequest<AdminAnalyticsResponse>('/admin-analytics')
  } catch (error: any) {
    console.error('Failed to fetch admin analytics', error)
    errorMsg = error.message || 'Failed to fetch analytics'
  }

  return (
    <div className="mx-auto w-full max-w-5xl p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">Admin Dashboard</h1>
        <p className="mt-2 text-white/60">System overview and analytics.</p>
      </div>

      {errorMsg ? (
        <div className="rounded-xl border border-error/20 bg-error/10 p-4 text-error">
          <p className="font-semibold">Error Loading Analytics</p>
          <p className="text-sm opacity-80">{errorMsg}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Users" value={analytics?.totalUsers} icon="group" />
          <StatCard title="Total Libraries" value={analytics?.totalLibraries} icon="library_books" />
          <StatCard title="Library Items" value={analytics?.totalItems} icon="headphones" />
          <StatCard title="Active Sessions" value={analytics?.activeSessions} icon="play_circle" />
        </div>
      )}
    </div>
  )
}

function StatCard({ title, value, icon }: { title: string, value?: number, icon: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-white/60">{title}</p>
        <span className="material-symbols-outlined text-white/40">{icon}</span>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <h2 className="text-4xl font-bold tracking-tight text-white">{value !== undefined ? value : '--'}</h2>
      </div>
    </div>
  )
}
