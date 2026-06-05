import { getTypeSafeTranslations } from '@/lib/getTypeSafeTranslations'
import { ExternalLink, Terminal } from 'lucide-react'
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
            { label: 'Vercel Function Logs', desc: 'Server-side function logs', href: 'https://vercel.com/organicnz/audiobookphile-client-react/logs' },
            { label: 'Vercel Deployments', desc: 'Build and deploy history', href: 'https://vercel.com/organicnz/audiobookphile-client-react' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/5 backdrop-blur-md border border-white/10 hover:border-primary/50 flex items-center gap-4 rounded-2xl p-6 transition-all hover:scale-[1.02] active:scale-[0.98] group"
            >
              <div className="bg-primary/20 p-3 rounded-xl group-hover:bg-primary/30 transition-colors">
                <ExternalLink size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-white/90 text-sm font-black uppercase tracking-widest">{item.label}</p>
                <p className="text-white/40 text-xs mt-1">{item.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </SettingsContent>
  )
}
