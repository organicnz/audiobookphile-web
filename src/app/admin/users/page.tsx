import { createClient } from '@/shared/lib/supabase/server'
import { Shield, User } from 'lucide-react'

export const metadata = { title: 'Users — Admin' }

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('profiles')
    .select('id, username, user_type, is_admin, zip_code, strikes, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Users</h1>
        <p className="text-muted-foreground mt-1 text-sm">Most recent 50 accounts</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Username</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Type</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Zip</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Strikes</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Role</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users && users.length > 0 ? users.map((u, i) => (
              <tr key={u.id} className={`border-b border-white/5 ${i % 2 === 0 ? '' : 'bg-white/[0.02]'} hover:bg-white/5 transition-colors`}>
                <td className="px-4 py-3 text-white font-medium flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  @{u.username ?? <span className="text-muted-foreground italic">unnamed</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    u.user_type === 'aficionado' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>{u.user_type ?? '—'}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{u.zip_code ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`font-bold ${(u.strikes ?? 0) >= 3 ? 'text-destructive' : (u.strikes ?? 0) > 0 ? 'text-orange-400' : 'text-muted-foreground'}`}>
                    {u.strikes ?? 0}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.is_admin ? (
                    <span className="flex items-center gap-1 text-xs text-primary">
                      <Shield className="w-3 h-3" /> Admin
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">User</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
