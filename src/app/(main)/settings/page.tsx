import { getTypeSafeTranslations } from '@/lib/getTypeSafeTranslations'
import { getLibraries } from '@/lib/supabase-api'
import { iconMap } from '@/lib/icon-mapping'
import { Settings } from 'lucide-react'
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
    { href: '/settings/api-keys', icon: 'key', label: t('HeaderApiKeys'), desc: 'API access tokens' },
  ]

  return (
    <>
      <SettingsContent title={t('HeaderSettings')}>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => {
              const Icon = iconMap[card.icon] || Settings
              
              return (
                <Link
                  key={card.href}
                  href={card.href}
                  className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/50 group flex items-center gap-5 rounded-2xl border p-5 transition-all duration-300 shadow-lg backdrop-blur-md"
                >
                  <div className="bg-primary/10 text-primary group-hover:scale-110 flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300">
                    <Icon size={28} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-white/90 text-[13px] font-black uppercase tracking-widest">{card.label}</p>
                    <p className="text-white/30 text-[11px] font-medium mt-1 uppercase tracking-wider">{card.desc}</p>
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
