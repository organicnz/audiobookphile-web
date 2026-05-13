'use client'

import { useTypeSafeTranslations } from '@/hooks/useTypeSafeTranslations'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

export interface ToastProps {
  id: string
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  onClose?: (id: string) => void
}

const Toast: React.FC<ToastProps> = ({ id, type = 'info', title, message, duration = 5000, onClose }) => {
  const t = useTypeSafeTranslations()
  const [isVisible, setIsVisible] = useState(true)

  const handleClose = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => {
      onClose?.(id)
    }, 400)
  }, [id, onClose])

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(handleClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, handleClose])

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  }[type]

  const typeStyles = {
    success: 'bg-success/90 border-success/30 shadow-success/20',
    error: 'bg-error/90 border-error/30 shadow-error/20',
    warning: 'bg-warning/90 border-warning/30 shadow-warning/20',
    info: 'bg-info/90 border-info/30 shadow-info/20'
  }[type]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          layout
          initial={{ opacity: 0, x: 50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.9, transition: { duration: 0.2 } }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="pointer-events-auto w-full max-w-sm"
        >
          <div className={`${typeStyles} backdrop-blur-xl rounded-xl border p-4 shadow-2xl relative overflow-hidden group`}>
            {/* Subtle glass reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
            
            <div className="flex items-start gap-3 relative z-10">
              <div className="flex-shrink-0 mt-0.5">
                <Icon size={20} className="text-white" />
              </div>
              <div className="min-w-0 flex-1">
                {title && (
                  <div className="mb-1 text-sm font-black uppercase tracking-wider text-white">
                    {title}
                  </div>
                )}
                <div className="text-sm font-medium text-white/90 leading-relaxed">
                  {message}
                </div>
              </div>
              <button
                cy-id="close-button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleClose()
                }}
                className="flex-shrink-0 -mt-1 -me-1 p-1 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                aria-label={t('ButtonCloseNotification')}
              >
                <X size={18} />
              </button>
            </div>

            {/* Progress bar for auto-dismiss */}
            {duration > 0 && (
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
                className="absolute bottom-0 start-0 h-1 w-full bg-white/20 origin-left"
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Toast
