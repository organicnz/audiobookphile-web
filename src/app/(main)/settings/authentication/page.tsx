import { getTypeSafeTranslations } from '@/shared/lib/getTypeSafeTranslations'
import { ExternalLink, Shield } from 'lucide-react'
import SettingsContent from '../SettingsContent'

export const dynamic = 'force-dynamic'

export default async function AuthenticationPage() {
  const t = await getTypeSafeTranslations()

  return (
    <SettingsContent title={t('HeaderAuthentication')}>
      <div className="p-6 space-y-4">
        <p className="text-foreground-muted text-sm">
          Authentication is handled by Supabase Auth. Configure providers, email templates, and security settings in the Supabase dashboard.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { label: 'Auth Providers', desc: 'Google, email, magic link', path: 'auth/providers' },
            { label: 'Email Templates', desc: 'Confirmation, reset password', path: 'auth/templates' },
            { label: 'URL Configuration', desc: 'Redirect URLs, site URL', path: 'auth/url-configuration' },
            { label: 'Users', desc: 'View and manage users', path: 'auth/users' },
          ].map((item) => (
            <a
              key={item.path}
              href={`https://supabase.com/dashboard/project/iambzzclljayqdxkeepy/${item.path}`}
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
