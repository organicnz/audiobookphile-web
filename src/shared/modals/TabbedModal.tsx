import { motion, AnimatePresence } from 'framer-motion'
import { mergeClasses } from '@/shared/lib/merge-classes'
import React, { ReactNode } from 'react'
import Modal from './Modal'

export interface Tab {
  id: string
  label: string
}

export interface TabbedModalProps {
  isOpen: boolean
  processing?: boolean
  persistent?: boolean
  zIndexClass?: string
  bgOpacityClass?: string
  tabs: Tab[]
  selectedTab: string
  onTabChange: (tabId: string) => void
  children?: ReactNode
  footer?: ReactNode
  outerContent?: ReactNode
  onClose?: () => void
  className?: string
  contentClassName?: string
  style?: React.CSSProperties
}

export default function TabbedModal({
  isOpen,
  processing,
  persistent,
  zIndexClass,
  bgOpacityClass,
  tabs,
  selectedTab,
  onTabChange,
  children,
  footer,
  outerContent,
  onClose,
  className,
  contentClassName,
  style
}: TabbedModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      processing={processing}
      persistent={persistent}
      zIndexClass={zIndexClass}
      bgOpacityClass={bgOpacityClass}
      outerContent={outerContent}
      onClose={onClose}
      className={mergeClasses('overflow-visible rounded-none bg-transparent shadow-none', className)}
      style={style}
    >
      {/* Tabs bar */}
      <div className="flex gap-1.5 px-2 mb-[-1px]" role="tablist">
        {tabs.map((tab) => {
          const isActive = tab.id === selectedTab
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              className={mergeClasses(
                'relative flex-1 max-w-[140px] cursor-pointer px-4 py-3 text-sm font-semibold transition-colors select-none rounded-t-xl overflow-hidden',
                isActive ? 'text-foreground' : 'text-foreground/40 hover:text-foreground/60'
              )}
              onClick={() => onTabChange(tab.id)}
            >
              {isActive && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute inset-0 bg-primary/10 border-t border-x border-primary/20"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Modal content */}
      <div className="bg-primary/95 border-white/10 backdrop-blur-xl shadow-2xl flex flex-col rounded-tr-2xl rounded-b-2xl border overflow-hidden">
        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab}
            id={`tabpanel-${selectedTab}`}
            role="tabpanel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={contentClassName}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        {footer && <div className="border-white/5 bg-white/5 px-6 py-4">{footer}</div>}
      </div>
    </Modal>
  )
}

