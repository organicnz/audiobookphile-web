'use client'

import { useTypeSafeTranslations } from '@/shared/hooks/useTypeSafeTranslations'
import { mergeClasses } from '@/shared/lib/merge-classes'
import { LucideIcon } from 'lucide-react'
import { getLegacyIcon } from '@/shared/lib/icon-mapping'
import React, { memo } from 'react'
import ButtonBase from './ButtonBase'

interface IconBtnProps {
  children?: React.ReactNode
  icon?: LucideIcon
  disabled?: boolean
  outlined?: boolean
  borderless?: boolean
  loading?: boolean
  size?: 'small' | 'medium' | 'large' | 'auto' | 'custom'
  iconClass?: string
  ariaLabel?: string
  to?: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void
  onMouseDown?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement | HTMLAnchorElement>) => void
  'aria-pressed'?: boolean
  className?: string
  ref?: React.Ref<HTMLButtonElement>
  tabIndex?: number
  whileHover?: any
  whileTap?: any
  transition?: any
  [key: string]: unknown
}

const LoadingSpinner = memo(() => (
  <div
    cy-id="icon-btn-loading-spinner"
    className="text-foreground absolute start-0 top-0 flex h-full w-full items-center justify-center"
    aria-hidden="true"
  >
    <svg className="animate-spin" style={{ width: '1.2em', height: '1.2em' }} viewBox="0 0 24 24">
      <path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
    </svg>
  </div>
))

LoadingSpinner.displayName = 'LoadingSpinner'

export default function IconBtn({
  children,
  icon: Icon,
  disabled = false,
  outlined = true,
  borderless = false,
  loading = false,
  size = 'medium',
  iconClass,
  ariaLabel,
  to,
  onClick,
  onMouseDown,
  onKeyDown,
  'aria-pressed': ariaPressed,
  className = '',
  ref,
  tabIndex,
  whileHover,
  whileTap,
  transition,
  ...props
}: IconBtnProps) {
  const t = useTypeSafeTranslations()
  const isDisabled = disabled || loading

  const sizeClass = size === 'small' ? 'w-9' : size === 'large' ? 'w-11' : size === 'medium' ? 'w-10' : size === 'auto' ? 'w-auto' : ''
  const classList = mergeClasses(sizeClass, className)

  const iconSize = size === 'small' ? 18 : size === 'large' ? 24 : 20

  const handleClick = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    if (isDisabled) {
      e.preventDefault()
      return
    }
    onClick?.(e)
  }

  // getLegacyIcon moved to @/shared/lib/icon-mapping

  let EffectiveIcon = Icon
  let childrenContent = children

  if (!EffectiveIcon && typeof children === 'string') {
    const mapped = getLegacyIcon(children.trim())
    if (mapped) {
      EffectiveIcon = mapped
      childrenContent = null
    }
  }

  return (
    <ButtonBase
      ref={ref}
      size={size}
      disabled={isDisabled}
      borderless={borderless}
      to={to}
      onClick={handleClick}
      onMouseDown={onMouseDown}
      onKeyDown={onKeyDown}
      className={classList}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      tabIndex={tabIndex}
      whileHover={whileHover ?? { scale: 1.1 }}
      whileTap={whileTap ?? { scale: 0.9 }}
      transition={transition ?? { type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {loading && (
        <span cy-id="icon-btn-loading" className="sr-only">
          {t('LabelLoadingIndicator')}
        </span>
      )}
      {!loading && (
        <>
          {EffectiveIcon ? (
            <EffectiveIcon size={iconSize} className={mergeClasses('shrink-0', iconClass)} aria-hidden="true" />
          ) : (
            <span cy-id="icon-btn-icon" className={mergeClasses(outlined ? 'material-symbols' : 'material-symbols fill', iconClass)} aria-hidden="true">
              {childrenContent}
            </span>
          )}
        </>
      )}
    </ButtonBase>
  )
}
