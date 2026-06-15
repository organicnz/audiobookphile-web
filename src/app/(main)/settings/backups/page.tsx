import { getTypeSafeTranslations } from '@/shared/lib/getTypeSafeTranslations'
import { ExternalLink, Database, Terminal } from 'lucide-react'
import SettingsContent from '../SettingsContent'

export const dynamic = 'force-dynamic'

export default async function BackupsPage() {
  const t = await getTypeSafeTranslations()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'YOUR_PROJECT_REF'

  return (
    <SettingsContent title={t('HeaderBackups')}>
      <div className="p-6 space-y-4">
        <p className="text-foreground-muted text-sm">
          Database backups are managed by Supabase. You can download a backup or restore from the Supabase dashboard.
        </p>
        <div className="bg-bg-light border-border rounded-lg border p-4 space-y-3">
          <h3 className="text-foreground font-medium">Supabase Managed Backups</h3>
          <p className="text-foreground-muted text-sm">
            Supabase automatically backs up your database daily on paid plans. Point-in-time recovery is available on Pro and above.
          </p>
          <a
            href={`https://supabase.com/dashboard/project/${projectRef}/database/backups/scheduled`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary/20 border border-primary/30 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black uppercase tracking-widest text-primary hover:bg-primary/30 transition-all hover:scale-105 active:scale-95"
          >
            <ExternalLink size={16} />
            Open Supabase Backups
          </a>
        </div>
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Terminal size={18} className="text-primary" />
            <h3 className="text-white/40 text-[11px] font-black uppercase tracking-widest">Manual Export</h3>
          </div>
          <p className="text-white/60 text-sm">
            You can export your data using the Supabase SQL editor or the CLI:
          </p>
          <code className="bg-black/40 block rounded-xl p-4 text-xs font-mono text-primary/80 border border-white/5">
            supabase db dump --project-ref {projectRef} &gt; backup.sql
          </code>
        </div>
      </div>
    </SettingsContent>
  )
}
