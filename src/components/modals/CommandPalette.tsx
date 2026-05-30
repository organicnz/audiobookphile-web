'use client'

import { useLibraryOptional } from '@/contexts/LibraryContext'
import { useUser } from '@/contexts/UserContext'

import { useCommandPalette } from '@/contexts/CommandPaletteContext'
import { useLibrarySearch } from '@/hooks/useLibrarySearch'
import { getLibraryItemCoverUrl } from '@/lib/coverUtils'
import { mergeClasses } from '@/lib/merge-classes'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, Settings, Book, Headphones, X } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useTypeSafeTranslations } from '@/hooks/useTypeSafeTranslations'

export default function CommandPalette() {
  const { isOpen, setIsOpen } = useCommandPalette()
  const libraryContext = useLibraryOptional()
  const { user } = useUser()
  const router = useRouter()
  const t = useTypeSafeTranslations()

  const activeLibraryId = libraryContext?.library?.id || user?.defaultLibraryId

  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    handleSearch
  } = useLibrarySearch({
    libraryId: activeLibraryId || undefined,
    autoSelectFirst: false
  })

  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, handleSearch])

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('')
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, setSearchQuery])

  const books = searchResults?.book || []
  const podcasts = searchResults?.podcast || []
  
  // Aggregate items for keyboard navigation
  const items = [
    ...books.map(b => ({ type: 'book' as const, id: b.libraryItem.id, title: b.libraryItem.media?.metadata?.title, item: b.libraryItem })),
    ...podcasts.map(p => ({ type: 'podcast' as const, id: p.libraryItem.id, title: p.libraryItem.media?.metadata?.title, item: p.libraryItem })),
    { type: 'action' as const, id: 'settings', title: t('HeaderSettings'), icon: Settings, href: '/settings' }
  ]

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex(prev => (prev < items.length - 1 ? prev + 1 : prev))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex(prev => (prev > 0 ? prev - 1 : 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const selected = items[activeIndex]
        if (selected) {
          executeAction(selected)
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, items, activeIndex, setIsOpen])

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[activeIndex] as HTMLElement
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [activeIndex])

  const executeAction = (selected: typeof items[number]) => {
    setIsOpen(false)
    if (selected.type === 'action' && selected.href) {
      router.push(selected.href)
    } else if ((selected.type === 'book' || selected.type === 'podcast') && activeLibraryId) {
      router.push(`/library/${activeLibraryId}/item/${selected.id}`)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] sm:pt-[20vh]">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-white/10 bg-primary shadow-2xl mx-4"
        >
          {/* Search Input */}
          <div className="flex items-center border-b border-white/10 px-4 py-4">
            <Search className="text-foreground-muted mr-3 h-5 w-5" />
            <input
              ref={inputRef}
              className="flex-1 bg-transparent text-lg text-foreground outline-none placeholder:text-foreground-muted"
              placeholder={t('PlaceholderSearch') + '...'}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setActiveIndex(0)
              }}
            />
            {isSearching && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="ml-3 rounded-md p-1 text-foreground-muted hover:bg-white/10 hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Results Area */}
          <div 
            ref={listRef}
            className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
          >
            {items.length === 0 && searchQuery.length > 0 && !isSearching && (
              <div className="py-14 text-center text-sm text-foreground-muted">
                {t('MessageNoItems')}
              </div>
            )}

            {items.map((item, index) => {
              const isActive = index === activeIndex
              
              return (
                <div
                  key={item.id}
                  onClick={() => executeAction(item)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={mergeClasses(
                    'flex cursor-pointer items-center rounded-lg px-3 py-2 transition-colors',
                    isActive ? 'bg-white/10 text-foreground' : 'text-foreground-muted hover:bg-white/5'
                  )}
                >
                  {/* Icon or Cover */}
                  <div className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded bg-white/5">
                    {item.type === 'action' && item.icon ? (
                      <item.icon className="h-5 w-5" />
                    ) : item.type === 'book' || item.type === 'podcast' ? (
                      <Image
                        src={getLibraryItemCoverUrl(item.id, item.item.updatedAt)}
                        alt={item.title || ''}
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    ) : null}
                  </div>

                  {/* Title & Type */}
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate font-medium">
                      {item.title}
                    </span>
                    <span className="text-xs opacity-70 flex items-center gap-1 mt-0.5">
                      {item.type === 'book' && <Book size={10} />}
                      {item.type === 'podcast' && <Headphones size={10} />}
                      {item.type === 'action' && 'Action'}
                      {item.type !== 'action' && item.type}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Footer */}
          <div className="border-t border-white/10 px-4 py-2 text-xs text-foreground-muted bg-black/20 flex justify-between">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1"><kbd className="font-sans font-semibold bg-white/10 px-1.5 rounded">↑</kbd> <kbd className="font-sans font-semibold bg-white/10 px-1.5 rounded">↓</kbd> to navigate</span>
              <span className="flex items-center gap-1"><kbd className="font-sans font-semibold bg-white/10 px-1.5 rounded">Enter</kbd> to select</span>
            </div>
            <span className="flex items-center gap-1"><kbd className="font-sans font-semibold bg-white/10 px-1.5 rounded">esc</kbd> to close</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
