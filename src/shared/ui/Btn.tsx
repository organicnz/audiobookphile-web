'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useTypeSafeTranslations } from '@/shared/hooks/useTypeSafeTranslations'
import { mergeClasses } from '@/shared/lib/merge-classes'
import React, { memo } from 'react'
import ButtonBase from './ButtonBase'

interface BtnProps {
  to?: string
  color?: string
  type?: 'button' | 'submit' | 'reset'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
  disabled?: boolean
  progress?: string
  children: React.ReactNode
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void
  className?: string
  ariaLabel?: string
  ariaDescription?: string
  ariaExpanded?: boolean
  ariaControls?: string
}

const LoadingOverlay = memo<{ progress?: string }>(({ progress }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm"
      aria-hidden="true"
    >
      {progress ? (
        <span className="text-xs font-bold tracking-tight text-white">{progress}</span>
      ) : (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
        />
      )}
    </motion.div>
  )
})

LoadingOverlay.displayName = 'LoadingOverlay'

export default function Btn({
  to,
  color = 'bg-primary',
  type = 'button',
  size = 'medium',
  loading = false,
  disabled = false,
  progress,
  children,
  onClick,
  className = '',
  ariaLabel,
  ariaDescription,
  ariaExpanded,
  ariaControls
}: BtnProps) {
  const t = useTypeSafeTranslations()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    if (onClick && !disabled && !loading) {
      onClick(e)
    }
  }

  return (
    <ButtonBase
      to={to}
      size={size as any}
      className={mergeClasses('relative font-bold tracking-tight', color, className)}
      disabled={disabled || loading}
      type={type}
      onClick={handleClick}
      onMouseDown={(e) => e.preventDefault()}
      ariaLabel={ariaLabel}
      aria-busy={loading || undefined}
      aria-description={ariaDescription}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
    >
      <motion.span
        animate={{ opacity: loading ? 0 : 1, scale: loading ? 0.9 : 1 }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-center gap-2"
      >
        {children}
      </motion.span>

      <AnimatePresence>{loading && <LoadingOverlay progress={progress} />}</AnimatePresence>

      {loading && (
        <span className="sr-only" role="status" aria-live="polite">
          {progress ? progress : t('MessageLoading')}
        </span>
      )}
    </ButtonBase>
  )
}
