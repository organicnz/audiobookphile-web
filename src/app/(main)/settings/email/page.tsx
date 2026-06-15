import { getTypeSafeTranslations } from '@/shared/lib/getTypeSafeTranslations'
import { ExternalLink, Mail } from 'lucide-react'
import SettingsContent from '../SettingsContent'

export const dynamic = 'force-dynamic'

export default async function EmailPage() {
  const t = await getTypeSafeTranslations()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'YOUR_PROJECT_REF'

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
              href={`https://supabase.com/dashboard/project/${projectRef}/${item.path}`}
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
