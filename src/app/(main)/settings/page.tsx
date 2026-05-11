import { getTypeSafeTranslations } from '@/lib/getTypeSafeTranslations'
import SettingsContent from './SettingsContent'
import SettingsFooter from './SettingsFooter'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const t = await getTypeSafeTranslations()

  return (
    <>
      <SettingsContent title={t('HeaderSettings')}>
        <div className="p-6 text-center text-fg-muted">
          <p>Server settings are not available in the Supabase-backed version.</p>
        </div>
      </SettingsContent>
      <SettingsFooter />
    </>
  )
}
