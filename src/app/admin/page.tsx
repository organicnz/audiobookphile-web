import { createClient } from '@/shared/lib/supabase/server'
import { Users, FileVideo, ShieldAlert, TrendingUp, Mail, DollarSign } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Admin Dashboard' }

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Platform stats
  const [
    { count: totalUsers },
    { count: totalContent },
    { count: flaggedContent },
    { count: activeSubscriptions },
    { count: totalCreators },
    { count: totalFans },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('content').select('*', { count: 'exact', head: true }),
    supabase.from('content').select('*', { count: 'exact', head: true }).eq('moderation_status', 'pending_review'),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_type', 'aficionado'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_type', 'fan'),
  ])

  // Recent signups
  const { data: recentUsers } = await supabase
    .from('profiles')
    .select('id, username, user_type, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  // Recent flagged content
  const { data: recentFlagged } = await supabase
    .from('content')
    .select('id, title, moderation_status, created_at')
    .eq('moderation_status', 'pending_review')
    .order('created_at', { ascending: false })
    .limit(5)

  const stats = [
    { label: 'Total Users', value: totalUsers ?? 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { label: 'Creators', value: totalCreators ?? 0, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { label: 'Fans', value: totalFans ?? 0, icon: Users, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
    { label: 'Active Subscriptions', value: activeSubscriptions ?? 0, icon: DollarSign, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
    { label: 'Total Content', value: totalContent ?? 0, icon: FileVideo, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { label: 'Flagged Content', value: flaggedContent ?? 0, icon: ShieldAlert, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">Platform overview and key metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className={`p-5 rounded-2xl border ${stat.bg} ${stat.border}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className={`text-3xl font-bold ${stat.color}`}>
                {stat.value.toLocaleString()}
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Signups */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Signups</h2>
            <Link href="/admin/users" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {recentUsers && recentUsers.length > 0 ? (
            <div className="space-y-3">
              {recentUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <span className="text-sm font-medium text-white">@{u.username ?? 'unnamed'}</span>
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                      u.user_type === 'aficionado' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>{u.user_type ?? 'unknown'}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No signups yet.</p>
          )}
        </div>

        {/* Flagged Content */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-destructive" /> Flagged Content
            </h2>
            <Link href="/admin/moderation" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {recentFlagged && recentFlagged.length > 0 ? (
            <div className="space-y-3">
              {recentFlagged.map(c => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <Link href={`/content/${c.id}`} className="text-sm text-white hover:text-primary truncate max-w-[70%]">
                    {c.title}
                  </Link>
                  <span className="text-xs text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                    {c.moderation_status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldAlert className="w-4 h-4 text-primary" />
              No flagged content.
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { href: '/admin/email', label: 'Send Email', icon: Mail, desc: 'Broadcast to users' },
          { href: '/admin/users', label: 'Manage Users', icon: Users, desc: 'View & moderate accounts' },
          { href: '/admin/moderation', label: 'Moderation', icon: ShieldAlert, desc: 'Review flagged content' },
        ].map(item => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} className="glass-panel rounded-2xl p-5 hover:bg-white/5 transition-colors group">
              <Icon className="w-6 h-6 text-primary mb-3 group-hover:scale-110 transition-transform" />
              <div className="font-semibold text-white text-sm">{item.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{item.desc}</div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
