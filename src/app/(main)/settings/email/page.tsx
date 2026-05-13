import { getTypeSafeTranslations } from '@/lib/getTypeSafeTranslations'
import SettingsContent from '../SettingsContent'

export const dynamic = 'force-dynamic'

export default async function EmailPage() {
  const t = await getTypeSafeTranslations()

  return (
    <SettingsContent title={t('HeaderEmail')}>
      <div className="p-6 space-y-4">
        <p className="text-foreground-muted text-sm">
          Email sending is handled by Supabase Auth. Configure SMTP settings and email templates in the Supabase dashboard.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { label: 'Custom SMTP', desc: 'Configure your email provider', path: 'auth/smtp' },
            { label: 'Email Templates', desc: 'Customize auth emails', path: 'auth/templates' },
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
