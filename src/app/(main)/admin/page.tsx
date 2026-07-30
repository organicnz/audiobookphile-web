import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Settings, ShieldAlert, Sparkles } from 'lucide-react'
import { getCurrentUser } from '@/shared/lib/api/users'
import { apiRequest } from '@/shared/lib/api/client'
import { AdminAnalyticsGrid } from '@/features/admin/components/AdminAnalyticsGrid'
import { AdminAnalyticsSkeleton } from '@/features/admin/components/AdminAnalyticsSkeleton'
import { AdminInvitePanel } from '@/features/admin/components/AdminInvitePanel'

export const dynamic = 'force-dynamic'

async function AnalyticsData() {
  try {
    const resData = await apiRequest<any>('/api/admin-analytics', { method: 'GET' })
    if (resData?.error) throw new Error(resData.error)
    return <AdminAnalyticsGrid data={resData} />
  } catch (error: any) {
    console.error('Failed to fetch admin analytics:', error)
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

export default async function AdminDashboardPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser || !['admin', 'root'].includes(currentUser.user.type)) {
    return redirect('/')
  }

  const roleBadge = currentUser.user.type === 'root' ? 'ROOT ADMINISTRATOR' : 'ADMINISTRATOR'

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-black/60 via-black/40 to-transparent">
      <div className="mx-auto w-full max-w-6xl p-6 md:p-10">
        {/* Bleeding-Edge Navigation Banner */}
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/library"
              className="group inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:border-white/30 hover:bg-white/15 hover:shadow-md"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              <span>Return to Library</span>
            </Link>

            <Link
              href="/settings"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/80 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              <Settings className="h-4 w-4 text-white/70" />
              <span>Server Settings</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1 text-xs font-bold tracking-wider text-amber-300 uppercase">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
              <span>{roleBadge}</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>Live System</span>
            </span>
          </div>
        </div>

        {/* Dashboard Title & Intro */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">Admin Dashboard</h1>
          <p className="mt-2 text-base text-white/60">Real-time server telemetry, active sessions, and user invite management.</p>
        </div>

        {/* Analytics Telemetry Grid */}
        <div className="mb-12">
          <h2 className="mb-4 text-xs font-bold tracking-wider text-white/50 uppercase">System Analytics</h2>
          <Suspense fallback={<AdminAnalyticsSkeleton />}>
            <AnalyticsData />
          </Suspense>
        </div>

        {/* User Management & Invitations */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h2 className="mb-1 text-xl font-bold tracking-tight text-white">User Management</h2>
          <p className="mb-6 text-sm text-white/60">Invite new members to your server. Newly invited users will receive an enrollment token via email.</p>
          <div className="max-w-xl">
            <AdminInvitePanel />
          </div>
        </div>
      </div>
    </div>
  )
}
