'use client'

import ConfirmDialog from '@/components/widgets/ConfirmDialog'
import CollectionGroupCover from '@/components/widgets/media-card/CollectionGroupCover'
import MediaCardFrame from '@/components/widgets/media-card/MediaCardFrame'
import MediaCardMoreMenu from '@/components/widgets/media-card/MediaCardMoreMenu'
import MediaCardOverlayContainer from '@/components/widgets/media-card/MediaCardOverlayContainer'
import MediaCardStandardFooter from '@/components/widgets/media-card/MediaCardStandardFooter'
import MediaOverlayIconBtn from '@/components/widgets/media-card/MediaOverlayIconBtn'
import { useCollectionCardActions } from '@/components/widgets/media-card/useCollectionCardActions'
import { useCardSize } from '@/contexts/CardSizeContext'
import { useBookCoverAspectRatio } from '@/contexts/LibraryContext'
import { useUser } from '@/contexts/UserContext'
import { useTypeSafeTranslations } from '@/hooks/useTypeSafeTranslations'
import { mergeClasses } from '@/lib/merge-classes'
import type { Collection } from '@/types/api'
import { BookshelfView } from '@/types/api'
import { useRouter } from 'next/navigation'
import { memo, useCallback, useId, useMemo, useState } from 'react'
import LoadingSpinner from '../LoadingSpinner'

export interface CollectionCardProps {
  /** The collection to display */
  collection: Collection
  /** View mode (standard or detail) */
  bookshelfView: BookshelfView
  sizeMultiplier?: number
  /** Whether the card is in selection mode */
  isSelectionMode?: boolean
  /** Whether the card is currently selected */
  selected?: boolean
  /** Callback when the select button is clicked */
  onSelect?: (event: React.MouseEvent) => void
  /** Callback when the edit button is clicked */
  onEdit?: (collection: Collection) => void
  /** Callback to open RSS feed modal */
  onOpenRssFeedModal?: (collection: Collection) => void
  /** Whether to show the selection button */
  showSelectedButton?: boolean
}

function CollectionCard(props: CollectionCardProps) {
  const {
    collection,
    bookshelfView,
    sizeMultiplier,
    isSelectionMode = false,
    selected = false,
    onSelect,
    onEdit,
    onOpenRssFeedModal,
    showSelectedButton = false
  } = props

  const router = useRouter()
  const coverAspect = useBookCoverAspectRatio()
  const { userCanUpdate } = useUser()
  const { sizeMultiplier: contextSizeMultiplier } = useCardSize()
  const cardId = useId()
  const t = useTypeSafeTranslations()

  const [isHovering, setIsHovering] = useState(false)
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)

  // Use prop to override context value if provided
  const effectiveSizeMultiplier = sizeMultiplier ?? contextSizeMultiplier

  const books = useMemo(() => collection.books || [], [collection.books])
  const rssFeed = useMemo(() => collection.rssFeed ?? null, [collection.rssFeed])

  // Cover dimensions - collection card is wider (2x width of a single book cover)
  const coverHeight = useMemo(() => 192 * effectiveSizeMultiplier, [effectiveSizeMultiplier])
  // Collection card is wider (2x width of a single book cover)
  const coverWidth = useMemo(() => (coverHeight / coverAspect) * 2, [coverHeight, coverAspect])

  // Label font size based on width
  const labelFontSize = useMemo(() => (coverWidth < 160 ? 0.75 : 0.9), [coverWidth])

  // Display title
  const displayTitle = useMemo(() => collection.name || '\u00A0', [collection.name])

  const isAlternativeBookshelfView = bookshelfView === BookshelfView.DETAIL

  const showOverlay = (isHovering || isSelectionMode || isMoreMenuOpen) && !false // not processing locally

  const handleCardClick = useCallback(() => {
    router.push(`/library/${collection.libraryId}/collection/${collection.id}`)
  }, [collection.id, collection.libraryId, router])

  const handleEditClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      onEdit?.(collection)
    },
    [collection, onEdit]
  )

  // Selection handler - kept for future use
  const handleSelectClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      onSelect?.(event)
    },
    [onSelect]
  )

  const handleOpenRssFeedModal = useCallback(() => {
    onOpenRssFeedModal?.(collection)
  }, [collection, onOpenRssFeedModal])

  const handleMoreMenuOpenChange = useCallback((isOpen: boolean) => {
    setIsMoreMenuOpen(isOpen)
    if (!isOpen) {
      setIsHovering(false)
    }
  }, [])

  const { processing, confirmState, closeConfirm, handleMoreAction, moreMenuItems } = useCollectionCardActions({
    collection,
    rssFeed,
    onOpenRssFeedModal: handleOpenRssFeedModal
  })

  return (
    <>
      <MediaCardFrame
        width={coverWidth}
        height={coverHeight}
        onClick={!processing ? handleCardClick : undefined}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        cardId={cardId}
        cy-id="collectionCard"
        cover={<CollectionGroupCover books={books} width={coverWidth} height={coverHeight} />}
        overlay={
          <>
            {/* Hover overlay */}
            {showOverlay && (
              <MediaCardOverlayContainer isSelectionMode={isSelectionMode} selected={selected}>
                {/* Selection button */}
                {showSelectedButton && (isSelectionMode || isHovering) && (
                  <MediaOverlayIconBtn
                    cyId="selectButton"
                    position="top-start"
                    icon={selected ? 'radio_button_checked' : 'radio_button_unchecked'}
                    onClick={handleSelectClick}
                    ariaLabel={selected ? t('ButtonDeselect') : t('ButtonSelect')}
                    selected={selected}
                  />
                )}

                {/* Edit button */}
                {userCanUpdate && !isSelectionMode && (
                  <MediaOverlayIconBtn cyId="editButton" position="top-end" icon="edit" onClick={handleEditClick} ariaLabel={t('ButtonEdit')} />
                )}

                {/* More menu button */}
                {!isSelectionMode && moreMenuItems.length > 0 && (
                  <div
                    cy-id="moreButton"
                    className={mergeClasses(
                      'absolute end-2 bottom-2 cursor-pointer md:block transition-transform duration-300',
                      'hover:scale-125'
                    )}
                  >
                    <MediaCardMoreMenu items={moreMenuItems} processing={processing} onAction={handleMoreAction} onOpenChange={handleMoreMenuOpenChange} />
                  </div>
                )}
              </MediaCardOverlayContainer>
            )}

            {/* Processing overlay */}
            {processing && (
              <div cy-id="loadingSpinner" className="absolute start-0 top-0 z-10 flex h-full w-full items-center justify-center rounded-sm bg-black/40">
                <LoadingSpinner size="la-lg" />
              </div>
            )}

            {/* RSS feed indicator */}
            {rssFeed && !isSelectionMode && !isHovering && (
              <div
                cy-id="rssFeed"
                className={mergeClasses(
                  'absolute start-2 top-2 z-10',
                  'flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/10 shadow-lg'
                )}
                style={{ width: '1.5rem', height: '1.5rem' }}
              >
                <span className="text-orange-500">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11a9 9 0 0 1 9 9" /><path d="M4 4a16 16 0 0 1 16 16" /><circle cx="5" cy="19" r="1" /></svg>
                </span>
              </div>
            )}
          </>
        }
        footer={
          isAlternativeBookshelfView ? (
            // Detail view footer
            <div cy-id="detailBottomText" className="relative start-0 end-0 z-30 mx-auto rounded-md py-[0.25em] text-center">
              <p cy-id="detailBottomDisplayTitle" className="truncate" style={{ fontSize: `${labelFontSize}em` }}>
                {displayTitle}
              </p>
            </div>
          ) : (
            // Standard view footer (shiny black placard)
            <MediaCardStandardFooter displayTitle={displayTitle} fontSize={labelFontSize} width={Math.min(200, coverWidth)} />
          )
        }
      />

      {/* Confirm dialog for delete */}
      {confirmState && (
        <ConfirmDialog
          isOpen={confirmState.isOpen}
          message={confirmState.message}
          checkboxLabel={confirmState.checkboxLabel}
          yesButtonText={confirmState.yesButtonText}
          yesButtonClassName={confirmState.yesButtonClassName}
          onClose={closeConfirm}
          onConfirm={(value) => {
            confirmState.onConfirm(value)
          }}
        />
      )}
    </>
  )
}

/**
 * Memoized CollectionCard component to prevent unnecessary re-renders.
 */
const MemoizedCollectionCard = memo(CollectionCard)

export { MemoizedCollectionCard as CollectionCard }

export default MemoizedCollectionCard
