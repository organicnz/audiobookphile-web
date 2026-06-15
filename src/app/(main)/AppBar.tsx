'use client'

import { motion, AnimatePresence } from 'framer-motion'
import IconBtn from '@/shared/ui/IconBtn'
import Tooltip from '@/shared/ui/Tooltip'
import NotificationWidget from '@/shared/widgets/NotificationWidget'
import { useMediaContext } from '@/features/player/contexts/MediaContext'
import { useUser } from '@/shared/contexts/UserContext'
import { useTypeSafeTranslations } from '@/shared/hooks/useTypeSafeTranslations'
import { Library } from '@/types/api'
import { Search, Upload, Settings, Library as LibraryIcon, Activity } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useState } from 'react'
import AppBarNav from './AppBarNav'
import GlobalSearchInput from './GlobalSearchInput'
import LibrariesDropdown from './LibrariesDropdown'

interface AppBarProps {
  libraries?: Library[]
  currentLibraryId?: string
}

export default function AppBar({ libraries, currentLibraryId }: AppBarProps) {
  const t = useTypeSafeTranslations()
  const { user, userDefaultLibraryId } = useUser()
  const userCanUpload = user.permissions.upload
  const [isSearchMode, setIsSearchMode] = useState(false)
  const { lastCurrentLibraryId } = useMediaContext()

  const handleSearchModeToggle = useCallback(() => {
    setIsSearchMode((prev) => !prev)
  }, [])

  const handleSearchSubmit = useCallback(() => {
    setIsSearchMode(false)
  }, [])

  const isAdmin = ['admin', 'root'].includes(user.type)
  const currentLibrary = libraries?.find((lib) => lib.id === currentLibraryId)
  const redirectLibraryId = currentLibraryId || lastCurrentLibraryId || userDefaultLibraryId
  const redirectUrl = redirectLibraryId ? `/library/${redirectLibraryId}` : '/library'

  const LogoContent = (
    <>
      <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-white/5 p-1 shadow-inner transition-transform group-hover:scale-105 group-active:scale-95">
        <Image 
          src="/images/icon.svg" 
          alt="" 
          width={40} 
          height={40} 
          priority 
          className="h-full w-full object-contain" 
        />
      </div>
      <span className="hidden text-lg font-black tracking-tight text-foreground/90 transition-colors group-hover:text-foreground md:block">
        audiobookphile
      </span>
    </>
  )

  return (
    <div className="sticky top-0 z-50 h-16 w-full">
      <header
        cy-id="appbar"
        className="absolute inset-0 flex items-center justify-between gap-4 px-4 py-2 bg-primary/95 backdrop-blur-xl border-b border-white/5 shadow-2xl md:px-8"
      >
        <div className="flex items-center gap-4 min-w-0 flex-shrink-0">
          {redirectLibraryId ? (
            <Link
              href={redirectUrl}
              aria-label={`audiobookphile - ${t('ButtonHome')}`}
              className="group flex items-center gap-3"
            >
              {LogoContent}
            </Link>
          ) : (
            <a
              href={redirectUrl}
              aria-label={`audiobookphile - ${t('ButtonHome')}`}
              className="group flex items-center gap-3"
            >
              {LogoContent}
            </a>
          )}

          <AnimatePresence mode="wait">
            {!isSearchMode && libraries && currentLibraryId && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="hidden sm:block"
              >
                <LibrariesDropdown currentLibraryId={currentLibraryId} libraries={libraries} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-1 items-center justify-center min-w-0 max-w-2xl px-2">
          <AnimatePresence mode="wait">
            {isSearchMode || !currentLibrary ? (
              <motion.div
                key="search-mode"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full"
              >
                <GlobalSearchInput autoFocus onSubmit={handleSearchSubmit} libraryId={currentLibraryId} />
              </motion.div>
            ) : (
              <motion.div
                key="default-mode"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="hidden w-full md:block"
              >
                <GlobalSearchInput onSubmit={handleSearchSubmit} libraryId={currentLibraryId} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {!isSearchMode && currentLibrary && (
            <IconBtn 
              borderless 
              ariaLabel={t('ButtonSearch')} 
              onClick={handleSearchModeToggle} 
              className="md:hidden" 
              icon={Search} 
            />
          )}

          <div className="flex items-center gap-1.5 border-s border-white/10 ps-2 md:ps-4">
            <NotificationWidget />

            {isAdmin && (
              <div className="hidden items-center gap-1.5 lg:flex">
                <Tooltip text={t('ButtonUpload')} position="bottom">
                  <IconBtn borderless ariaLabel={t('ButtonUpload')} to="/upload" icon={Upload} />
                </Tooltip>
                <Tooltip text="Admin Dashboard" position="bottom">
                  <IconBtn borderless ariaLabel="Admin Dashboard" to="/admin" icon={Activity} />
                </Tooltip>
                <Tooltip text={t('HeaderSettings')} position="bottom">
                  <IconBtn borderless ariaLabel={t('HeaderSettings')} to="/settings" icon={Settings} />
                </Tooltip>
              </div>
            )}

            <AppBarNav userCanUpload={userCanUpload} isAdmin={isAdmin} username={user.username} />
          </div>
        </div>
      </header>
    </div>
  )
}

