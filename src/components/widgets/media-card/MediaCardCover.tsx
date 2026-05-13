'use client'

import { motion } from 'framer-motion'
import { getLibraryItemCoverSrc } from '@/lib/coverUtils'
import { mergeClasses } from '@/lib/merge-classes'
import type { LibraryItem } from '@/types/api'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface MediaCardCoverProps {
  libraryItem: LibraryItem
  coverAspect: number
  placeholderUrl: string
  hasCover: boolean
  title: string
  titleCleaned: string
  authorCleaned: string
  isPodcast: boolean
  userProgressPercent: number
  itemIsFinished: boolean
  onImageLoad?: (showBg: boolean) => void
  isHovering?: boolean
}

const PLACEHOLDER_COVER_PADDING = 0.8
const TITLE_FONT_SIZE = 0.8
const AUTHOR_FONT_SIZE = 0.65
const AUTHOR_BOTTOM = 1

export default function MediaCardCover({
  libraryItem,
  coverAspect,
  placeholderUrl,
  hasCover,
  title,
  titleCleaned,
  authorCleaned,
  isPodcast,
  userProgressPercent,
  itemIsFinished,
  onImageLoad,
  isHovering = false
}: MediaCardCoverProps) {
  const [imageReady, setImageReady] = useState(false)
  const [showCoverBg, setShowCoverBg] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const hasHandledLoad = useRef(false)

  const bookCoverSrc = useMemo(() => getLibraryItemCoverSrc(libraryItem, placeholderUrl), [libraryItem, placeholderUrl])

  const [prevSrc, setPrevSrc] = useState(bookCoverSrc)

  useEffect(() => {
    if (bookCoverSrc !== prevSrc) {
      setPrevSrc(bookCoverSrc)
      setImageReady(false)
      hasHandledLoad.current = false
    }
  }, [bookCoverSrc, prevSrc])

  const handleImageLoaded = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      if (hasHandledLoad.current) return
      hasHandledLoad.current = true

      const img = event.currentTarget
      setImageReady(true)

      if (bookCoverSrc !== placeholderUrl) {
        const { naturalWidth, naturalHeight } = img
        const aspectRatio = naturalHeight / naturalWidth
        const arDiff = Math.abs(aspectRatio - coverAspect)

        const shouldShowBg = arDiff > 0.15
        setShowCoverBg(shouldShowBg)
        onImageLoad?.(shouldShowBg)
      }
    },
    [bookCoverSrc, coverAspect, placeholderUrl, onImageLoad]
  )

  useEffect(() => {
    const img = imgRef.current
    if (img && img.complete && img.naturalWidth > 0) {
      handleImageLoaded({ currentTarget: img } as React.SyntheticEvent<HTMLImageElement>)
    }
  }, [bookCoverSrc, handleImageLoaded])

  return (
    <>
      {/* Cover background when image does not fill */}
      <div
        cy-id="coverBg"
        className="bg-black/40 absolute start-0 top-0 h-full w-full overflow-hidden"
        style={{ display: showCoverBg ? 'block' : 'none' }}
      >
        {showCoverBg && (
          <motion.div
            animate={{ scale: isHovering ? 1.15 : 1.1, opacity: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="cover-bg absolute inset-0 blur-2xl saturate-150"
            style={{
              backgroundImage: `url("${bookCoverSrc}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        )}
      </div>

      {/* Placeholder title when image is not ready */}
      {libraryItem && !imageReady && (
        <div
          cy-id="titleImageNotReady"
          aria-hidden="true"
          className="absolute start-0 top-0 flex h-full w-full items-center justify-center bg-white/5"
          style={{ padding: '1rem' }}
        >
          <p className="text-center text-foreground/20 font-black uppercase tracking-widest text-[10px]">
            {title}
          </p>
        </div>
      )}

      {/* Cover image */}
      {libraryItem && (
        <motion.img
          ref={imgRef}
          cy-id="coverImage"
          alt={`${title}, Cover`}
          aria-hidden="true"
          src={bookCoverSrc}
          onLoad={handleImageLoaded}
          animate={{ 
            opacity: imageReady ? 1 : 0,
            scale: isHovering ? 1.08 : 1
          }}
          transition={{ 
            opacity: { duration: 0.4 },
            scale: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
          }}
          className={mergeClasses(
            'absolute inset-0 h-full w-full transition-shadow duration-500',
            showCoverBg ? 'object-contain' : 'object-cover',
            isHovering ? 'shadow-2xl' : 'shadow-none'
          )}
        />
      )}

      {/* Placeholder cover title & author */}
      {!hasCover && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 p-4 text-center">
          <div
            cy-id="placeholderTitle"
            className="flex-1 flex items-center justify-center"
          >
            <p cy-id="placeholderTitleText" aria-hidden="true" className="font-black uppercase tracking-widest text-primary/80 drop-shadow-sm leading-tight" style={{ fontSize: `${TITLE_FONT_SIZE}em` }}>
              {titleCleaned}
            </p>
          </div>
          <div
            cy-id="placeholderAuthor"
            className="w-full pb-2"
          >
            <p cy-id="placeholderAuthorText" aria-hidden="true" className="font-bold text-primary/40 uppercase tracking-widest" style={{ fontSize: `${AUTHOR_FONT_SIZE}em` }}>
              {authorCleaned}
            </p>
          </div>
        </div>
      )}

      {/* Progress bar */}
      {userProgressPercent > 0 && (!isPodcast || !!libraryItem.recentEpisode) && (
        <div className="absolute start-0 bottom-0 z-20 w-full px-2 pb-2">
          <div className="h-1.5 w-full bg-white/10 backdrop-blur-sm rounded-full overflow-hidden shadow-inner">
            <motion.div
              cy-id="progressBar"
              initial={{ width: 0 }}
              animate={{ width: `${userProgressPercent * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={mergeClasses(
                'h-full rounded-full transition-all duration-500',
                itemIsFinished 
                  ? 'bg-success shadow-[0_0_10px_rgba(var(--success-rgb),0.5)]' 
                  : 'bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]'
              )}
            />
          </div>
        </div>
      )}
    </>
  )
}
