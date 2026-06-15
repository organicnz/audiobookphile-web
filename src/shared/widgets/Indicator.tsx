import Tooltip from '@/shared/ui/Tooltip'
import { getLegacyIcon } from '@/shared/lib/icon-mapping'
import { mergeClasses } from '@/shared/lib/merge-classes'
import React from 'react'

interface IndicatorProps {
  tooltipText: string
  children?: React.ReactNode
  className?: string
  ariaLabel?: string
  role?: string
}

const Indicator = ({ tooltipText, children, className, ariaLabel, role = 'note' }: IndicatorProps) => {
  const effectiveAriaLabel = ariaLabel || tooltipText

  if (typeof children === 'string') {
    const Icon = getLegacyIcon(children.trim())
    if (Icon) {
      return (
        <Tooltip text={tooltipText} position="top">
          <div className={mergeClasses('flex items-center justify-center', className)} role={role} aria-label={effectiveAriaLabel}>
            <Icon size={14} strokeWidth={2.5} />
          </div>
        </Tooltip>
      )
    }
  }

  if (children && typeof children === 'object' && 'render' in (children as any)) {
    const Icon = children as any
    return (
      <Tooltip text={tooltipText} position="top">
        <div className={mergeClasses('flex items-center justify-center', className)} role={role} aria-label={effectiveAriaLabel}>
          <Icon size={14} strokeWidth={2.5} />
        </div>
      </Tooltip>
    )
  }

  return (
    <Tooltip text={tooltipText} position="top">
      <div className={className} role={role} aria-label={effectiveAriaLabel}>
        {children}
      </div>
    </Tooltip>
  )
}

export default Indicator
