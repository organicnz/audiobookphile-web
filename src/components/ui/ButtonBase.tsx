import { mergeClasses } from '@/lib/merge-classes'
import { motion } from 'framer-motion'
import Link from 'next/link'
import React from 'react'

const MotionLink = motion(Link)

interface ButtonBaseProps {
  id?: string
  to?: string
  children: React.ReactNode
  disabled?: boolean
  borderless?: boolean
  size?: 'small' | 'medium' | 'large' | 'auto' | 'custom'
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void
  onMouseDown?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLButtonElement | HTMLAnchorElement>) => void
  type?: 'button' | 'submit' | 'reset'
  ariaLabel?: string
  className?: string
  ref?: React.Ref<HTMLButtonElement>
  whileHover?: any
  whileTap?: any
  transition?: any
  [key: string]: unknown
}

const ButtonBase = ({
  id,
  to,
  children,
  disabled = false,
  borderless = false,
  size = 'medium',
  className = '',
  onClick,
  onMouseDown,
  onKeyDown,
  type = 'button',
  ariaLabel,
  ref,
  whileHover,
  whileTap,
  transition,
  ...props
}: ButtonBaseProps) => {
  const buttonClass = mergeClasses(
    'relative flex items-center justify-center overflow-hidden transition-all duration-200 select-none font-sans font-semibold',
    'rounded-xl border shadow-sm',
    !borderless && 'bg-primary/80 backdrop-blur-md border-white/10 hover:border-white/20',
    borderless && 'border-transparent bg-transparent shadow-none text-foreground/60 hover:text-foreground',
    
    // Focus states
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black',
    
    // Sizing
    size === 'small' ? 'h-9 px-4 text-sm' : size === 'large' ? 'h-12 px-10 text-lg' : size === 'auto' ? 'min-h-10 h-auto px-6' : size === 'custom' ? '' : 'h-10 px-8 text-base',
    
    // Disabled states
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:grayscale',
    
    className
  )

  const handleClick = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    if (onClick && !disabled) {
      onClick(e)
    }
  }

  const animationProps = !disabled ? {
    whileHover: whileHover ?? { scale: 1.02, y: -1 },
    whileTap: whileTap ?? { scale: 0.97 },
    transition: transition ?? { type: 'spring', stiffness: 500, damping: 25 }
  } : {}

  if (to) {
    return (
      <MotionLink
        href={to}
        className={buttonClass}
        onClick={handleClick}
        onMouseDown={onMouseDown}
        onKeyDown={onKeyDown}
        style={{ pointerEvents: disabled ? 'none' : 'auto' }}
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-label={ariaLabel}
        {...animationProps}
        {...props}
      >
        {children}
      </MotionLink>
    )
  }

  return (
    <motion.button
      id={id}
      ref={ref}
      type={type}
      disabled={disabled}
      className={buttonClass}
      onClick={handleClick}
      onMouseDown={onMouseDown}
      onKeyDown={onKeyDown}
      aria-label={ariaLabel}
      {...animationProps}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export default ButtonBase
