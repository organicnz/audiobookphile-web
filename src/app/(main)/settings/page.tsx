import { getTypeSafeTranslations } from '@/shared/lib/getTypeSafeTranslations'
import { getLibraries } from '@/shared/lib/api'
import { Settings, Library, Users, SlidersHorizontal, Headphones, DatabaseBackup, Key } from 'lucide-react'
import Link from 'next/link'
import SettingsContent from './SettingsContent'
import SettingsFooter from './SettingsFooter'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const t = await getTypeSafeTranslations()
  const { libraries } = await getLibraries().catch(() => ({ libraries: [] }))

  const cards = [
    {
      href: '/settings/libraries',
      icon: Library,
      label: t('HeaderLibraries'),
      desc: `${libraries.length} librar${libraries.length !== 1 ? 'ies' : 'y'}`
    },
    { href: '/settings/users', icon: Users, label: t('HeaderUsers'), desc: 'Manage user accounts' },
    { href: '/settings/item-metadata-utils', icon: SlidersHorizontal, label: t('HeaderItemMetadataUtils'), desc: 'Genres, tags, providers' },
    { href: '/settings/listening-sessions', icon: Headphones, label: t('HeaderListeningSessions'), desc: 'Playback history' },
    { href: '/settings/backups', icon: DatabaseBackup, label: t('HeaderBackups'), desc: 'Database backups' },
    { href: '/settings/api-keys', icon: Key, label: t('HeaderApiKeys'), desc: 'API access tokens' }
  ]

  return (
    <>
      <SettingsContent title={t('HeaderSettings')}>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => {
              const Icon = card.icon || Settings

              return (
                <Link
                  key={card.href}
                  href={card.href}
                  className="hover:border-primary/50 group flex items-center gap-5 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-white/10"
                >
                  <div className="bg-primary/10 text-primary flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110">
                    <Icon size={28} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-[13px] font-black tracking-widest text-white/90 uppercase">{card.label}</p>
                    <p className="mt-1 text-[11px] font-medium tracking-wider text-white/30 uppercase">{card.desc}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </SettingsContent>
      <SettingsFooter />
    </>
  )
}
