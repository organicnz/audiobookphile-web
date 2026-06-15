'use client'

import { useTypeSafeTranslations } from '@/shared/hooks/useTypeSafeTranslations'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export type ModalSideNavigationProps = {
  canGoPrev: boolean
  canGoNext: boolean
  onPrevAction: () => void
  onNextAction: () => void
}

/**
 * Left/right chevrons outside the modal panel (Vue EditModal-style).
 */
export default function ModalSideNavigation({ canGoPrev, canGoNext, onPrevAction, onNextAction }: ModalSideNavigationProps) {
  const t = useTypeSafeTranslations()

  return (
    <div className="absolute inset-0 pointer-events-none z-[1]">
      <AnimatePresence>
        {canGoPrev && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="absolute start-[-8rem] top-0 bottom-0 flex h-full items-center px-6"
          >
            <motion.button
              whileHover={{ scale: 1.1, x: -4 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              className="group pointer-events-auto cursor-pointer flex items-center justify-center w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-xl transition-all shadow-2xl"
              aria-label={t('ButtonPrevious')}
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                onPrevAction()
              }}
              onMouseDown={(e) => e.preventDefault()}
            >
              <ChevronLeft size={40} className="text-foreground/40 group-hover:text-primary transition-colors duration-300 drop-shadow-lg" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {canGoNext && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="absolute end-[-8rem] top-0 bottom-0 flex h-full items-center px-6"
          >
            <motion.button
              whileHover={{ scale: 1.1, x: 4 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              className="group pointer-events-auto cursor-pointer flex items-center justify-center w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-xl transition-all shadow-2xl"
              aria-label={t('ButtonNext')}
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                onNextAction()
              }}
              onMouseDown={(e) => e.preventDefault()}
            >
              <ChevronRight size={40} className="text-foreground/40 group-hover:text-primary transition-colors duration-300 drop-shadow-lg" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
