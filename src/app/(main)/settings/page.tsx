import { getTypeSafeTranslations } from '@/lib/getTypeSafeTranslations'
import { getLibraries } from '@/lib/supabase-api'
import Link from 'next/link'
import SettingsContent from './SettingsContent'
import SettingsFooter from './SettingsFooter'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const t = await getTypeSafeTranslations()
  const { libraries } = await getLibraries().catch(() => ({ libraries: [] }))

  const cards = [
    { href: '/settings/libraries', icon: 'library_books', label: t('HeaderLibraries'), desc: `${libraries.length} librar${libraries.length !== 1 ? 'ies' : 'y'}` },
    { href: '/settings/users', icon: 'group', label: t('HeaderUsers'), desc: 'Manage user accounts' },
    { href: '/settings/item-metadata-utils', icon: 'tune', label: t('HeaderItemMetadataUtils'), desc: 'Genres, tags, providers' },
    { href: '/settings/listening-sessions', icon: 'headphones', label: t('HeaderListeningSessions'), desc: 'Playback history' },
    { href: '/settings/backups', icon: 'backup', label: t('HeaderBackups'), desc: 'Database backups' },
    { href: '/settings/api-keys', icon: 'key', label: t('HeaderAPIKeys'), desc: 'API access tokens' },
  ]

  return (
    <>
      <SettingsContent title={t('HeaderSettings')}>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="bg-bg-light border-border hover:border-primary flex items-center gap-4 rounded-lg border p-4 transition-colors"
              >
                <span className="material-symbols text-primary text-3xl">{card.icon}</span>
                <div>
                  <p className="text-foreground font-medium">{card.label}</p>
                  <p className="text-foreground-muted text-sm">{card.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </SettingsContent>
      <SettingsFooter />
    </>
  )
}
