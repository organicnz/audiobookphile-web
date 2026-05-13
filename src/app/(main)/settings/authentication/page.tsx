import { getTypeSafeTranslations } from '@/lib/getTypeSafeTranslations'
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
