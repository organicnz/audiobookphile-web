import IconBtn from '@/shared/ui/IconBtn'
import { getLegacyIcon } from '@/shared/lib/icon-mapping'
import { mergeClasses } from '@/shared/lib/merge-classes'
import { LucideIcon, Circle } from 'lucide-react'
import React from 'react'

export interface MediaOverlayIconBtnProps {
  icon: LucideIcon | string
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

  const EffectiveIcon = typeof icon === 'string' ? getLegacyIcon(icon) || Circle : icon

  return (
    <div cy-id={cyId} className={mergeClasses('absolute z-40', positionClasses[position])}>
      <IconBtn
        borderless
        size="small"
        className={mergeClasses(
          'p-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white/70 hover:not-disabled:text-white hover:bg-white/10 transition-all duration-300 shadow-xl',
          selected && 'bg-primary/90 text-black border-primary shadow-primary/20',
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
