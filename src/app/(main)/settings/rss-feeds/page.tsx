import { getTypeSafeTranslations } from '@/lib/getTypeSafeTranslations'
import SettingsContent from '../SettingsContent'

export const dynamic = 'force-dynamic'

export default async function RssFeedsPage() {
  const t = await getTypeSafeTranslations()

  return (
    <SettingsContent title={t('HeaderRSSFeeds')}>
      <div className="p-6">
        <p className="text-foreground-muted text-sm">
          RSS feed generation is not available in this version. RSS feeds require a persistent server process to generate and serve feeds.
        </p>
      </div>
    </SettingsContent>
  )
}
