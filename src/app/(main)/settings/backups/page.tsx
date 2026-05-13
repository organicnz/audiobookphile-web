import { getTypeSafeTranslations } from '@/lib/getTypeSafeTranslations'
import SettingsContent from '../SettingsContent'

export const dynamic = 'force-dynamic'

export default async function BackupsPage() {
  const t = await getTypeSafeTranslations()

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
            href="https://supabase.com/dashboard/project/iambzzclljayqdxkeepy/database/backups/scheduled"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            <span className="material-symbols text-base">open_in_new</span>
            Open Supabase Backups
          </a>
        </div>
        <div className="bg-bg-light border-border rounded-lg border p-4 space-y-3">
          <h3 className="text-foreground font-medium">Manual Export</h3>
          <p className="text-foreground-muted text-sm">
            You can export your data using the Supabase SQL editor or the CLI:
          </p>
          <code className="bg-bg block rounded p-3 text-xs font-mono text-green-400">
            supabase db dump --project-ref iambzzclljayqdxkeepy &gt; backup.sql
          </code>
        </div>
      </div>
    </SettingsContent>
  )
}
