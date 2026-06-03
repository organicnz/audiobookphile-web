import { mergeClasses } from '@/lib/merge-classes'
import { motion } from 'framer-motion'
import { type ReactNode } from 'react'

interface MediaCardFrameProps {
  width: number | string
  height: number | string
  onClick?: (event: React.MouseEvent) => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  onKeyDown?: (event: React.KeyboardEvent) => void
  cardId?: string
  cover: ReactNode
  overlay: ReactNode
  footer?: ReactNode
  aspectRatio?: number
  className?: string
  'cy-id'?: string
}

export default function MediaCardFrame({
  width,
  height,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onKeyDown,
  cardId,
  cover,
  overlay,
  footer,
  aspectRatio,
  className,
  'cy-id': cyId = 'mediaCard'
}: MediaCardFrameProps) {
  return (
    <div
      cy-id={cyId}
      id={cardId}
      tabIndex={0}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onKeyDown={onKeyDown}
      className={mergeClasses(
        'relative z-30 @container rounded-xl overflow-hidden',
        onClick && 'cursor-pointer',
        'focus-visible:outline-primary focus-visible:outline-2 focus-visible:outline-offset-2',
        'transition-all duration-300',
        className
      )}
      style={{
        minWidth: typeof width === 'number' ? `${width}px` : width,
        maxWidth: typeof width === 'number' ? `${width}px` : width,
        contentVisibility: 'auto'
      }}
    >
      <div
        className="bg-primary/95 backdrop-blur-xl relative start-0 top-0 z-10 w-full overflow-hidden rounded-xl border border-white/10 shadow-2xl transition-transform duration-500 ease-out group-hover:scale-[1.02]"
        style={{
          height: typeof height === 'number' ? `${height}px` : height,
          aspectRatio: aspectRatio ? `${aspectRatio}` : undefined,
          willChange: 'transform'
        }}
      >
        <div className="absolute start-0 top-0 z-10 h-full w-full overflow-hidden">
          {cover}
          {overlay}
        </div>
      </div>
      {footer}
    </div>
  )
}
