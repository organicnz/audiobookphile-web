'use client'

import { motion } from 'framer-motion'
import { Clock, X } from 'lucide-react'
import { useMediaContext } from '@/features/player/contexts/MediaContext'
import { useAudioPlayerHotkeys } from '@/features/player/hooks/useAudioPlayerHotkeys'
import { getLibraryItemCoverUrl } from '@/shared/lib/coverUtils'
import { secondsToTimestamp } from '@/shared/lib/datefns'
import { BookMedia } from '@/types/api'
import Link from 'next/link'
import { Fragment } from 'react'
import PreviewCover from '../../metadata/components/PreviewCover'
import IconBtn from '../../../shared/ui/IconBtn'
import PlayerControls from './PlayerControls'
import PlayerTrackBar from './PlayerTrackBar'

import { useImageColor } from '@/shared/hooks/useImageColor'

export default function MediaPlayerContainer() {
  const { streamLibraryItem, clearStreamMedia, playerHandler } = useMediaContext()

  useAudioPlayerHotkeys(playerHandler.state, playerHandler.controls, !!streamLibraryItem, clearStreamMedia)

  const coverAspectRatio = 1
  const coverUrl = streamLibraryItem ? getLibraryItemCoverUrl(streamLibraryItem.id, streamLibraryItem.updatedAt) : null
  const dominantColor = useImageColor(coverUrl)

  // Don't render the player if nothing is streaming
  if (!streamLibraryItem) {
    return null
  }

  // TODO: Get podcast episode duration
  const bookDuration = (streamLibraryItem.media as BookMedia).duration
  const bookAuthors = 'authors' in streamLibraryItem.media.metadata ? streamLibraryItem.media.metadata.authors || [] : []
  const displayTitle = playerHandler.state.displayTitle || streamLibraryItem.media.metadata.title

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      style={{ 
        willChange: 'transform, opacity',
        background: dominantColor ? `linear-gradient(to top, var(--background) 40%, ${dominantColor}22 100%)` : undefined,
      }}
      className="glassmorphism shadow-[0_-8px_30px_rgb(0,0,0,0.3)] border-t border-primary/20 fixed right-0 bottom-0 left-0 z-50 h-48 w-full px-2 pt-2 pb-1 lg:h-40 lg:px-4 lg:pb-4 transition-colors duration-1000"
    >
      <div className="absolute top-4 left-4 flex gap-4 lg:left-6">
        <div className="shadow-lg rounded-md overflow-hidden ring-1 ring-white/10 transition-transform duration-300 hover:scale-105 hover:shadow-xl">
          <PreviewCover
            src={coverUrl || ''}
            bookCoverAspectRatio={coverAspectRatio}
            showResolution={false}
            width={72}
            priority={true}
          />
        </div>
        <div className="flex flex-col gap-0.5 max-w-[200px] sm:max-w-[400px]">
          <Link 
            href={`/library/${streamLibraryItem.libraryId}/item/${streamLibraryItem.id}`} 
            className="text-foreground text-lg font-semibold truncate hover:text-primary-foreground transition-colors"
          >
            {displayTitle}
          </Link>
          {bookAuthors.length > 0 && (
            <div className="text-foreground-muted truncate text-sm">
              {bookAuthors.map((author, index) => (
                <Fragment key={author.id}>
                  <Link href={`/library/${streamLibraryItem.libraryId}/authors/${author.id}`} className="hover:text-foreground transition-colors">
                    {author.name}
                  </Link>
                  {index < bookAuthors.length - 1 && <span>, </span>}
                </Fragment>
              ))}
            </div>
          )}
          {bookDuration && (
            <div className="text-foreground-muted/60 flex items-center gap-1.5 text-xs font-medium mt-1">
              <Clock size={12} className="opacity-70" />
              {secondsToTimestamp(bookDuration)}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-4 mt-1">
        <PlayerControls playerHandler={playerHandler} />

        <PlayerTrackBar playerHandler={playerHandler} />
      </div>

      <div className="absolute top-4 right-4 flex items-center gap-2 lg:right-6">
        <IconBtn 
          size="small" 
          borderless 
          onClick={clearStreamMedia}
          whileHover={{ rotate: 90, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 300 }}
          icon={X}
        />
      </div>
    </motion.div>
  )
}
