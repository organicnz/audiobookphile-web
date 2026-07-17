'use client'

import { mergeClasses } from '@/shared/lib/merge-classes'
import { motion } from 'framer-motion'
import { MailQuestion, MailCheck, Lock, User, LucideIcon } from 'lucide-react'
import { getLegacyIcon } from '@/shared/lib/icon-mapping'

interface AuthCardProps {
  /** Card title */
  title: string
  /** Optional subtitle shown below the title */
  subtitle?: string
  /** Optional material-symbols icon name or LucideIcon shown above the title */
  icon?: string | LucideIcon
  /** Render as a <form> element when provided; plain <div> otherwise */
  onSubmit?: (e: React.FormEvent) => void
  children: React.ReactNode
  className?: string
}

/**
 * Shared card shell used by all auth pages (login, signup, forgot/reset password, verify email).
 * Renders as a <form> when `onSubmit` is provided, otherwise as a <div>.
 */
export default function AuthCard({ title, subtitle, icon, onSubmit, children, className }: AuthCardProps) {
  const cardClass = mergeClasses(
    'bg-primary/95 backdrop-blur-xl border-white/10 w-full max-w-md rounded-2xl border p-10 shadow-2xl relative overflow-hidden',
    icon || subtitle ? 'text-center' : '',
    className
  )

  const getIcon = () => {
    if (!icon) return null
    if (typeof icon !== 'string') {
      const IconComp = icon
      return <IconComp size={48} className="text-accent mx-auto mb-6 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]" />
    }

    const MappedIcon = getLegacyIcon(icon) || MailQuestion
    return <MappedIcon size={48} className="text-accent mx-auto mb-6 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]" />
  }

  const header = (
    <div className="relative z-10">
      {getIcon()}
      <h1 className={mergeClasses('text-3xl font-black tracking-tight uppercase', subtitle ? 'mb-2' : 'mb-8')}>{title}</h1>
      {subtitle && <p className="text-foreground/60 mb-8 text-sm leading-relaxed font-medium">{subtitle}</p>}
    </div>
  )

  const content = (
    <>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
      {header}
      <div className="relative z-10">{children}</div>
    </>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="flex w-full justify-center"
    >
      {onSubmit ? (
        <form onSubmit={onSubmit} className={cardClass}>
          {content}
        </form>
      ) : (
        <div className={cardClass}>{content}</div>
      )}
    </motion.div>
  )
}
