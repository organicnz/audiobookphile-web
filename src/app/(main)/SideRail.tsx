'use client'

import { useLibrary } from '@/contexts/LibraryContext'
import { useTypeSafeTranslations } from '@/hooks/useTypeSafeTranslations'
import { mergeClasses } from '@/lib/merge-classes'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  Clock, 
  Library as LibraryIcon, 
  Layers, 
  FolderHeart, 
  ListMusic, 
  Users, 
  Mic2, 
  BarChart2, 
  Plus, 
  Download, 
  AlertTriangle 
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function SideRail({ serverVersion, installSource }: { serverVersion: string; installSource: string }) {
  const pathname = usePathname()
  const t = useTypeSafeTranslations()
  const { library } = useLibrary()

  const currentLibraryId = library?.id ?? ''
  const currentLibraryMediaType = library?.mediaType ?? 'book'

  const buttons = [
    {
      icon: Home,
      label: t('ButtonHome'),
      href: `/library/${currentLibraryId}`
    },
    {
      icon: Clock,
      label: t('ButtonLatest'),
      href: `/library/${currentLibraryId}/latest`,
      mediaType: 'podcast'
    },
    {
      icon: LibraryIcon,
      label: t('ButtonLibrary'),
      href: `/library/${currentLibraryId}/items`
    },
    {
      icon: Layers,
      label: t('ButtonSeries'),
      href: `/library/${currentLibraryId}/series`,
      mediaType: 'book'
    },
    {
      icon: FolderHeart,
      label: t('ButtonCollections'),
      href: `/library/${currentLibraryId}/collections`,
      mediaType: 'book'
    },
    {
      icon: ListMusic,
      label: t('ButtonPlaylists'),
      href: `/library/${currentLibraryId}/playlists`
    },
    {
      icon: Users,
      label: t('ButtonAuthors'),
      href: `/library/${currentLibraryId}/authors`,
      mediaType: 'book'
    },
    {
      icon: Mic2,
      label: t('LabelNarrators'),
      href: `/library/${currentLibraryId}/narrators`,
      mediaType: 'book'
    },
    {
      icon: BarChart2,
      label: t('ButtonStats'),
      href: `/library/${currentLibraryId}/stats`,
      mediaType: 'book'
    },
    {
      icon: Plus,
      label: t('ButtonAdd'),
      href: `/library/${currentLibraryId}/add-podcast`,
      mediaType: 'podcast'
    },
    {
      icon: Download,
      label: t('ButtonDownloadQueue'),
      href: `/library/${currentLibraryId}/download-queue`,
      mediaType: 'podcast'
    },
    {
      icon: AlertTriangle,
      label: t('ButtonIssues'),
      href: `/library/${currentLibraryId}/issues`,
      hidden: true
    }
  ]

  const filteredButtons = buttons.filter((button) => (!button.mediaType || button.mediaType === currentLibraryMediaType) && !button.hidden)

  return (
    <aside className="bg-primary/95 backdrop-blur-xl z-10 hidden h-full max-h-[calc(100vh-4rem)] w-20 min-w-20 md:flex border-e border-white/10 shadow-2xl overflow-hidden flex-col">
      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden py-2 scrollbar-hide">
        {filteredButtons.map((button, index) => {
          const Icon = button.icon
          const isActive = pathname === button.href
          
          return (
            <motion.div
              key={button.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03, type: 'spring', stiffness: 300, damping: 25 }}
            >
              <Link
                href={button.href}
                className={mergeClasses(
                  'text-foreground group relative flex h-20 w-full cursor-pointer flex-col items-center justify-center transition-all duration-300',
                  'hover:bg-white/5 active:scale-95',
                  isActive ? 'bg-white/5' : ''
                )}
              >
                <div className="relative mb-1">
                  <Icon 
                    size={24} 
                    className={mergeClasses(
                      'transition-all duration-300 group-hover:scale-110',
                      isActive ? 'text-primary' : 'text-foreground/40 group-hover:text-foreground/80'
                    )} 
                  />
                  {isActive && (
                    <motion.div
                      layoutId="active-glow"
                      className="absolute inset-0 bg-primary/20 blur-md rounded-full -z-10"
                    />
                  )}
                </div>
                
                <p className={mergeClasses(
                  'text-[9px] uppercase font-black tracking-[0.15em] transition-all duration-300 text-center px-1',
                  isActive ? 'text-primary' : 'text-foreground/30 group-hover:text-foreground/60'
                )}>
                  {button.label}
                </p>

                <AnimatePresence>
                  {isActive && (
                    <motion.div 
                      layoutId="active-indicator"
                      initial={{ opacity: 0, scaleY: 0 }}
                      animate={{ opacity: 1, scaleY: 1 }}
                      exit={{ opacity: 0, scaleY: 0 }}
                      className="absolute start-0 top-1/4 h-1/2 w-1 rounded-r-full bg-primary shadow-[0_0_12px_rgba(var(--primary-rgb),0.6)]"
                    />
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          )
        })}
      </div>
      
      <div className="border-white/5 w-full border-t px-2 py-4 bg-black/10 backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center opacity-40 hover:opacity-100 transition-opacity duration-300">
          <p className="font-mono text-[9px] font-bold tracking-tight text-foreground/80">v{serverVersion}</p>
          <p className="text-[7px] text-foreground/50 uppercase font-black tracking-widest mt-0.5">{installSource}</p>
        </div>
      </div>
    </aside>
  )
}
