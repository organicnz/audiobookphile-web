'use client'

import { useTypeSafeTranslations } from '@/hooks/useTypeSafeTranslations'
import { mergeClasses } from '@/lib/merge-classes'
import { motion } from 'framer-motion'
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import React, { useEffect, useRef } from 'react'

export interface AlertProps {
  type?: 'error' | 'warning' | 'success' | 'info'
  autoFocus?: boolean
  children: React.ReactNode
  className?: string
}

export default function Alert({ type = 'error', autoFocus = true, children, className }: AlertProps) {
  const t = useTypeSafeTranslations()
  const alertRef = useRef<HTMLDivElement>(null)

  const isAlert = type === 'error' || type === 'warning'
  const alertRole = isAlert ? 'alert' : 'status'

  const Icon = {
    error: AlertCircle,
    warning: AlertTriangle,
    success: CheckCircle,
    info: Info
  }[type]

  const prefix =
    type === 'error'
      ? t('LabelError')
      : type === 'warning'
        ? t('LabelWarning')
        : type === 'success'
          ? t('LabelSuccess')
          : t('LabelInformation')

  const typeClasses =
    type === 'error'
      ? 'bg-error/10 border-error/20 text-error shadow-error/5'
      : type === 'warning'
        ? 'bg-warning/10 border-warning/20 text-warning shadow-warning/5'
        : type === 'success'
          ? 'bg-success/10 border-success/20 text-success shadow-success/5'
          : 'bg-info/10 border-info/20 text-info shadow-info/5'

  useEffect(() => {
    if (isAlert && alertRef.current && autoFocus) {
      alertRef.current.focus()
    }
  }, [isAlert, autoFocus])

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      cy-id="alert"
      className={mergeClasses(
        'w-full border rounded-xl flex items-start gap-4 p-4 relative overflow-hidden backdrop-blur-xl shadow-lg',
        typeClasses,
        className
      )}
      role={alertRole}
      tabIndex={isAlert ? -1 : undefined}
      ref={alertRef}
    >
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      <div className="flex-shrink-0 mt-0.5 relative z-10">
        <Icon size={22} className="opacity-90" />
      </div>
      
      <div className="flex-1 relative z-10 min-w-0">
        <span className="sr-only">{prefix}: </span>
        <div className="text-sm font-medium leading-relaxed">
          {children}
        </div>
      </div>
    </motion.div>
  )
}
