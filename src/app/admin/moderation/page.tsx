import { createClient } from '@/shared/lib/supabase/server'
import { ShieldAlert, ShieldCheck, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Moderation — Admin' }

export default async function AdminModerationPage() {
  const supabase = await createClient()

  const { data: flagged } = await supabase
    .from('content')
    .select('id, title, description, moderation_status, nsfw_score, created_at, profiles!inner(username)')
    .eq('moderation_status', 'pending_review')
    .order('created_at', { ascending: false })
    .limit(50)

  const { data: rejected } = await supabase
    .from('content')
    .select('id, title, moderation_status, nsfw_score, created_at, profiles!inner(username)')
    .eq('moderation_status', 'rejected')
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-7 h-7 text-destructive" /> Moderation Queue
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">Content flagged by AI for human review</p>
      </div>

      {/* Pending Review */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          Pending Review
          {flagged && flagged.length > 0 && (
            <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded-full">{flagged.length}</span>
          )}
        </h2>
        {flagged && flagged.length > 0 ? (
          <div className="space-y-3">
            {flagged.map(c => {
              const profile = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles
              return (
                <div key={c.id} className="glass-panel rounded-2xl p-5 flex items-start gap-4 border border-destructive/20">
                  <ShieldAlert className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white truncate">{c.title}</span>
                      {c.nsfw_score && c.nsfw_score > 0 && (
                        <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full flex-shrink-0">
                          NSFW {(c.nsfw_score * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      by @{(profile as { username?: string })?.username ?? 'unknown'} · {new Date(c.created_at).toLocaleDateString()}
                    </p>
                    {c.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{c.description}</p>
                    )}
                    <Link
                      href={`/content/${c.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" /> View Content
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="glass-panel rounded-2xl p-8 text-center">
            <ShieldCheck className="w-8 h-8 text-primary mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No content pending review.</p>
          </div>
        )}
      </section>

      {/* Recently Rejected */}
      {rejected && rejected.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Recently Rejected</h2>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Title</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Creator</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">NSFW Score</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {rejected.map(c => {
                  const profile = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles
                  return (
                    <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-white truncate max-w-[200px]">{c.title}</td>
                      <td className="px-4 py-3 text-muted-foreground">@{(profile as { username?: string })?.username ?? '—'}</td>
                      <td className="px-4 py-3">
                        {c.nsfw_score ? (
                          <span className="text-orange-400">{(c.nsfw_score * 100).toFixed(0)}%</span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
