'use client'

import Tooltip from '@/shared/ui/Tooltip'
import { useTruncation } from '@/shared/hooks/useTruncation'
import { mergeClasses } from '@/shared/lib/merge-classes'

interface TruncatingTooltipTextProps {
  text: string
  className: string
}

/**
 * If the text is truncated, a tooltip will be shown.
 */
export default function TruncatingTooltipText({ text, className }: TruncatingTooltipTextProps) {
  const { ref, isTruncated } = useTruncation(text, false)
  return (
    <Tooltip text={text} position="top" disabled={!isTruncated} className="block w-full">
      <p ref={ref} className={mergeClasses('truncate', className)}>
        {text}
      </p>
    </Tooltip>
  )
}
