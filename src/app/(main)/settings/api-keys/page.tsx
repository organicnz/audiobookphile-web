import { getTypeSafeTranslations } from '@/lib/getTypeSafeTranslations'
import SettingsContent from '../SettingsContent'

export const dynamic = 'force-dynamic'

export default async function ApiKeysPage() {
  const t = await getTypeSafeTranslations()

  return (
    <SettingsContent title={t('HeaderAPIKeys')}>
      <div className="p-6 space-y-4">
        <p className="text-foreground-muted text-sm">
          API keys for this Supabase-backed deployment are managed in the Supabase dashboard.
        </p>
        <div className="bg-bg-light border-border rounded-lg border p-4 space-y-3">
          <h3 className="text-foreground font-medium">Supabase API Keys</h3>
          <p className="text-foreground-muted text-sm">
            Use the Supabase dashboard to manage your project API keys, create service role keys, and configure Row Level Security policies.
          </p>
          <a
            href="https://supabase.com/dashboard/project/iambzzclljayqdxkeepy/settings/api"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            <span className="material-symbols text-base">open_in_new</span>
            Open Supabase API Settings
          </a>
        </div>
        <div className="bg-bg-light border-border rounded-lg border p-4 space-y-2">
          <h3 className="text-foreground font-medium">Project Reference</h3>
          <code className="bg-bg block rounded p-3 text-xs font-mono text-green-400">
            iambzzclljayqdxkeepy
          </code>
        </div>
      </div>
    </SettingsContent>
  )
}
