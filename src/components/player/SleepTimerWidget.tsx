'use client'

import type { UsePlayerHandlerReturn } from '@/hooks/usePlayerHandler'
import { useTypeSafeTranslations } from '@/hooks/useTypeSafeTranslations'
import { mergeClasses } from '@/lib/merge-classes'
import { arrow as arrowMw, autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/react-dom'
import { Moon } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import IconBtn from '../ui/IconBtn'

interface SleepTimerWidgetProps {
  playerHandler: UsePlayerHandlerReturn
}

const PRESET_DURATIONS = [5, 15, 30, 45, 60] as const

export default function SleepTimerWidget({ playerHandler }: SleepTimerWidgetProps) {
  const t = useTypeSafeTranslations()
  const { sleepTimerRemaining } = playerHandler.state
  const { startSleepTimer, stopSleepTimer } = playerHandler.controls

  const widgetId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const arrowRef = useRef<HTMLDivElement>(null)

  // Ensure component is mounted before rendering popover
  useEffect(() => {
    setMounted(true)
  }, [])

  // Floating UI positioning
  const middleware = useMemo(() => [offset(8), shift({ padding: 8 }), flip({ fallbackAxisSideDirection: 'start' }), arrowMw({ element: arrowRef })], [])

  const {
    refs,
    floatingStyles,
    placement: resolvedPlacement,
    middlewareData
  } = useFloating({
    open: isOpen,
    placement: 'top',
    strategy: 'fixed',
    middleware,
    whileElementsMounted: autoUpdate,
    elements: {
      reference: triggerRef.current
    }
  })

  // Sync popover ref with Floating UI
  useEffect(() => {
    if (popoverRef.current) {
      refs.setFloating(popoverRef.current)
    }
  }, [refs, isOpen])

  // Update reference element when trigger ref is available
  useEffect(() => {
    if (triggerRef.current) {
      refs.setReference(triggerRef.current)
    }
  }, [refs])

  // Close on mousedown outside
  useEffect(() => {
    if (!isOpen) return

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node
      if (popoverRef.current?.contains(target) || triggerRef.current?.contains(target)) {
        return
      }
      setIsOpen(false)
    }

    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  const toggleOpen = () => setIsOpen((prev) => !prev)

  const handleStartTimer = (minutes: number) => {
    startSleepTimer(minutes * 60)
    setIsOpen(false)
  }

  const handleStopTimer = () => {
    stopSleepTimer()
    setIsOpen(false)
  }

  // Arrow positioning
  const arrowStyles = useMemo<React.CSSProperties>(() => {
    const { x, y } = middlewareData.arrow ?? {}
    const staticSide: Record<string, keyof React.CSSProperties> = {
      top: 'bottom',
      bottom: 'top',
      left: 'right',
      right: 'left'
    }
    return {
      left: x != null ? `${x}px` : '',
      top: y != null ? `${y}px` : '',
      [staticSide[resolvedPlacement.split('-')[0]]]: '-4px'
    } as React.CSSProperties
  }, [middlewareData.arrow, resolvedPlacement])

  const formatRemainingTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const popoverContent = isOpen ? (
    <div ref={popoverRef} id={`${widgetId}-popover`} role="dialog" style={floatingStyles} className="bg-background z-70 rounded-lg p-3 shadow-lg flex flex-col gap-2">
      <div className="text-foreground text-sm font-semibold mb-1 text-center">Sleep Timer</div>
      <div className="grid grid-cols-5 gap-1">
        {PRESET_DURATIONS.map((minutes) => (
          <button
            key={minutes}
            type="button"
            onClick={() => handleStartTimer(minutes)}
            className="border-border border rounded-md px-3 py-1.5 text-sm font-medium transition-colors text-button-foreground-muted hover:bg-button-selected-bg hover:text-button-foreground"
          >
            {minutes}m
          </button>
        ))}
      </div>
      {sleepTimerRemaining !== null && (
        <button
          type="button"
          onClick={handleStopTimer}
          className="bg-error/10 text-error hover:bg-error/20 w-full rounded-md py-1.5 text-sm font-medium transition-colors mt-2"
        >
          Cancel Timer
        </button>
      )}
      <div ref={arrowRef} style={arrowStyles} className="bg-background absolute h-2 w-2 rotate-45" />
    </div>
  ) : null

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleOpen}
        aria-expanded={isOpen}
        aria-controls={`${widgetId}-popover`}
        aria-label="Sleep Timer"
        className={mergeClasses(
          'p-2 transition-colors flex items-center gap-1.5',
          sleepTimerRemaining !== null ? 'text-primary' : 'text-foreground/60 hover:text-foreground'
        )}
      >
        <Moon size={20} />
        {sleepTimerRemaining !== null && (
          <span className="text-xs font-semibold tabular-nums">{formatRemainingTime(sleepTimerRemaining)}</span>
        )}
      </button>

      {mounted && typeof document !== 'undefined' && createPortal(popoverContent, document.body)}
    </>
  )
}
