import IconBtn from '@/shared/ui/IconBtn'
import { mergeClasses } from '@/shared/lib/merge-classes'
import { LucideIcon } from 'lucide-react'
import React from 'react'

export interface MediaOverlayIconBtnProps {
  icon: LucideIcon
  onClick: (event: React.MouseEvent) => void
  ariaLabel: string
  position?: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'
  className?: string
  selected?: boolean
  cyId?: string
  whileHover?: any
  transition?: any
}

export default function MediaOverlayIconBtn({
  icon,
  onClick,
  ariaLabel,
  position = 'top-start',
  className,
  selected,
  cyId,
  whileHover,
  transition
}: MediaOverlayIconBtnProps) {
  const positionClasses = {
    'top-start': 'top-2 start-2',
    'top-end': 'top-2 end-2',
    'bottom-start': 'bottom-2 start-2',
    'bottom-end': 'bottom-2 end-2'
  }

  const EffectiveIcon = icon

  return (
    <div cy-id={cyId} className={mergeClasses('absolute z-40', positionClasses[position])}>
      <IconBtn
        borderless
        size="small"
        className={mergeClasses(
          'rounded-xl border border-white/10 bg-black/60 p-1.5 text-white/70 shadow-xl backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:not-disabled:text-white',
          selected && 'bg-primary/90 border-primary shadow-primary/20 text-black',
          className
        )}
        onClick={onClick}
        ariaLabel={ariaLabel}
        whileHover={whileHover ?? { scale: 1.1 }}
        transition={transition ?? { type: 'spring', stiffness: 500, damping: 25 }}
        icon={EffectiveIcon}
      />
    </div>
  )
}
