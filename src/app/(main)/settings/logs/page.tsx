import { getTypeSafeTranslations } from '@/lib/getTypeSafeTranslations'
import SettingsContent from '../SettingsContent'

export const dynamic = 'force-dynamic'

export default async function LogsPage() {
  const t = await getTypeSafeTranslations()

  return (
    <SettingsContent title={t('HeaderLogs')}>
      <div className="p-6 space-y-4">
        <p className="text-foreground-muted text-sm">
          Application logs are available in the Supabase dashboard and Vercel deployment logs.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { label: 'Supabase API Logs', desc: 'Database and auth requests', href: 'https://supabase.com/dashboard/project/iambzzclljayqdxkeepy/logs/edge-logs' },
            { label: 'Supabase Auth Logs', desc: 'Login and auth events', href: 'https://supabase.com/dashboard/project/iambzzclljayqdxkeepy/logs/auth-logs' },
            { label: 'Vercel Function Logs', desc: 'Server-side function logs', href: 'https://vercel.com/organicnz/audiobookshelf-client-react/logs' },
            { label: 'Vercel Deployments', desc: 'Build and deploy history', href: 'https://vercel.com/organicnz/audiobookshelf-client-react' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-bg-light border-border hover:border-primary flex items-center gap-3 rounded-lg border p-4 transition-colors"
            >
              <span className="material-symbols text-primary text-2xl">open_in_new</span>
              <div>
                <p className="text-foreground text-sm font-medium">{item.label}</p>
                <p className="text-foreground-muted text-xs">{item.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </SettingsContent>
  )
}
