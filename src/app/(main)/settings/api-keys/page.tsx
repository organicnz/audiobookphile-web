import { getTypeSafeTranslations } from '@/shared/lib/getTypeSafeTranslations'
import { ExternalLink, Key } from 'lucide-react'
import SettingsContent from '../SettingsContent'

export const dynamic = 'force-dynamic'

export default async function ApiKeysPage() {
  const t = await getTypeSafeTranslations()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const isSupabaseCloud = supabaseUrl.includes('.supabase.co')
  const projectRef = isSupabaseCloud ? supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] : null
  const dashboardHref =
    isSupabaseCloud && projectRef
      ? `https://supabase.com/dashboard/project/${projectRef}/settings/api`
      : supabaseUrl.replace(':8000', ':54323').replace('/v1', '')

  return (
    <SettingsContent title={t('HeaderAPIKeys' as any)}>
      <div className="space-y-4 p-6">
        <p className="text-foreground-muted text-sm">API keys for this deployment are managed in your Supabase dashboard.</p>
        <div className="bg-bg-light border-border space-y-3 rounded-lg border p-4">
          <h3 className="text-foreground font-medium">Supabase API Keys</h3>
          <p className="text-foreground-muted text-sm">
            Use the Supabase dashboard to manage your project API keys, create service role keys, and configure Row Level Security policies.
          </p>
          <a
            href={dashboardHref}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary/20 border-primary/30 text-primary hover:bg-primary/30 inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-black tracking-widest uppercase transition-all hover:scale-105 active:scale-95"
          >
            <ExternalLink size={16} />
            Open API Settings
          </a>
        </div>
        {projectRef && (
          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <h3 className="text-[11px] font-black tracking-widest text-white/40 uppercase">Project Reference</h3>
            <code className="text-primary/80 block rounded-xl border border-white/5 bg-black/40 p-4 font-mono text-xs">{projectRef}</code>
          </div>
        )}
      </div>
    </SettingsContent>
  )
}
