import { getTypeSafeTranslations } from '@/shared/lib/getTypeSafeTranslations'
import { ExternalLink, Key } from 'lucide-react'
import SettingsContent from '../SettingsContent'

export const dynamic = 'force-dynamic'

export default async function ApiKeysPage() {
  const t = await getTypeSafeTranslations()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'YOUR_PROJECT_REF'

  return (
    <SettingsContent title={t('HeaderAPIKeys' as any)}>
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
            href={`https://supabase.com/dashboard/project/${projectRef}/settings/api`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary/20 border border-primary/30 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-black uppercase tracking-widest text-primary hover:bg-primary/30 transition-all hover:scale-105 active:scale-95"
          >
            <ExternalLink size={16} />
            Open Supabase API Settings
          </a>
        </div>
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-3">
          <h3 className="text-white/40 text-[11px] font-black uppercase tracking-widest">Project Reference</h3>
          <code className="bg-black/40 block rounded-xl p-4 text-xs font-mono text-primary/80 border border-white/5">
            {projectRef}
          </code>
        </div>
      </div>
    </SettingsContent>
  )
}
