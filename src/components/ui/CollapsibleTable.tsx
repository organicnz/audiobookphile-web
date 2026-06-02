import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useTypeSafeTranslations } from '@/hooks/useTypeSafeTranslations'
import { mergeClasses } from '@/lib/merge-classes'
import { KeyboardEvent, ReactNode, useCallback, useId, useMemo } from 'react'

interface TableHeader {
  label: ReactNode
  className?: string
  scope?: string
}

interface CollapsibleTableProps {
  title: string
  count: number
  expanded?: boolean
  onExpandedChange: (expanded: boolean) => void
  keepOpen?: boolean
  headerActions?: ReactNode
  tableHeaders: TableHeader[]
  tableClassName?: string
  containerRef?: React.RefObject<HTMLDivElement | null>
  children: ReactNode
}

export default function CollapsibleTable({
  title,
  count,
  expanded = false,
  onExpandedChange,
  keepOpen = false,
  headerActions,
  tableHeaders,
  tableClassName,
  containerRef,
  children
}: CollapsibleTableProps) {
  const t = useTypeSafeTranslations()
  const id = useId()

  const handleClickBar = useCallback(() => {
    if (!keepOpen) {
      onExpandedChange(!expanded)
    }
  }, [keepOpen, expanded, onExpandedChange])

  const handleKeyDownBar = useCallback(
    (e: KeyboardEvent) => {
      if (!keepOpen && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        onExpandedChange(!expanded)
      }
    },
    [keepOpen, expanded, onExpandedChange]
  )

  const isExpanded = keepOpen || expanded
  const hasHeaderActions = Boolean(headerActions)
  const countAriaLabel = useMemo(() => t('LabelItemsPlural', { count }), [count, t])

  return (
    <div className="my-4 w-full overflow-hidden rounded-2xl border border-white/10 bg-primary/5 shadow-lg">
      <div
        className={mergeClasses(
          'w-full bg-white/5 backdrop-blur-md py-4 px-6 flex items-center gap-4 transition-colors',
          !keepOpen ? 'cursor-pointer hover:bg-white/10' : ''
        )}
        onClick={handleClickBar}
        onKeyDown={handleKeyDownBar}
        role={!keepOpen ? 'button' : undefined}
        tabIndex={!keepOpen ? 0 : undefined}
        aria-expanded={!keepOpen ? isExpanded : undefined}
        aria-controls={!keepOpen ? `${id}-content` : undefined}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/80 truncate">
            {title}
          </h3>
          <div 
            className="flex h-6 w-8 items-center justify-center rounded-full bg-primary/20 text-[10px] font-black text-primary shadow-inner" 
            aria-label={countAriaLabel} 
            role="status"
          >
            {count}
          </div>
          <div className="grow" />
          {hasHeaderActions && (
            <div className="flex flex-shrink-0 items-center gap-2" onClick={e => e.stopPropagation()}>
              {headerActions}
            </div>
          )}
        </div>
        
        {!keepOpen && (
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="text-foreground/40"
          >
            <ChevronDown size={20} strokeWidth={3} />
          </motion.div>
        )}
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          >
            <div ref={containerRef} id={`${id}-content`} role="region" aria-label={title} className="p-4 pt-0">
              <div className="overflow-x-auto">
                <table className={mergeClasses('w-full border-collapse text-sm', tableClassName)}>
                  <caption className="sr-only">{title}</caption>
                  <thead>
                    <tr className="border-b border-white/5">
                      {tableHeaders.map((header, index) => (
                        <th 
                          key={index} 
                          className={mergeClasses('py-3 text-start text-[10px] font-black uppercase tracking-widest text-foreground/30', header.className)} 
                          scope={header.scope ?? 'col'}
                        >
                          {header.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {children}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

