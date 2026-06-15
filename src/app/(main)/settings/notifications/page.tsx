import { getTypeSafeTranslations } from '@/shared/lib/getTypeSafeTranslations'
import SettingsContent from '../SettingsContent'

export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
  const t = await getTypeSafeTranslations()

  return (
    <SettingsContent title={t('HeaderNotifications')}>
      <div className="p-6">
        <p className="text-foreground-muted text-sm">
          Push notifications and webhooks are not available in this version. Email notifications are handled through Supabase Auth email templates.
        </p>
      </div>
    </SettingsContent>
  )
}
