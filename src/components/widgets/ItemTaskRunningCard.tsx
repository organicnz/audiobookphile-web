'use client'

import Btn from '@/components/ui/Btn'
import { useSocketEmit } from '@/contexts/SocketContext'
import { useUser } from '@/contexts/UserContext'
import { useTypeSafeTranslations } from '@/hooks/useTypeSafeTranslations'
import { formatDuration } from '@/lib/formatDuration'
import { Task } from '@/types/api'
import { TranslationKey } from '@/types/translations'
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import LoadingSpinner from './LoadingSpinner'

interface ItemTaskRunningCardProps {
  task: Task
}

interface TaskScanResults {
  added?: number
  updated?: number
  missing?: number
  elapsed?: number
}

interface TaskDataWithScanResults {
  scanResults?: TaskScanResults
}

function mapSubsToValues(subs: string[] | null | undefined): Record<string, string> | undefined {
  if (!subs?.length) {
    return undefined
  }

  return subs.reduce<Record<string, string>>((acc, value, index) => {
    acc[index.toString()] = value
    return acc
  }, {})
}

function getTaskString(
  t: ReturnType<typeof useTypeSafeTranslations>,
  key: string | null,
  subs: string[] | null,
  fallback: string | null,
  defaultValue = ''
): string {
  if (!key) {
    return fallback || defaultValue
  }

  try {
    const values = mapSubsToValues(subs)
    return values ? t(key as TranslationKey, values) : t(key as TranslationKey)
  } catch {
    return fallback || defaultValue
  }
}

export default function ItemTaskRunningCard({ task }: ItemTaskRunningCardProps) {
  const t = useTypeSafeTranslations()
  const { emit } = useSocketEmit()
  const { userIsAdminOrUp } = useUser()
  const [cancelingScan, setCancelingScan] = useState(false)

  const isFinished = !!task.isFinished
  const isFailed = !!task.isFailed
  const isSuccess = isFinished && !isFailed

  const title = useMemo(() => {
    return getTaskString(t, task.titleKey, task.titleSubs, task.title, 'No Title')
  }, [t, task.title, task.titleKey, task.titleSubs])

  const description = useMemo(() => {
    return getTaskString(t, task.descriptionKey, task.descriptionSubs, task.description)
  }, [t, task.description, task.descriptionKey, task.descriptionSubs])

  const failedMessage = useMemo(() => {
    return getTaskString(t, task.errorKey, task.errorSubs, task.error)
  }, [t, task.error, task.errorKey, task.errorSubs])

  const action = task.action || ''

  const isLibraryScan = useMemo(() => {
    return action === 'library-scan' || action === 'library-match-all'
  }, [action])

  const specialMessage = useMemo(() => {
    const scanResults = (task.data as TaskDataWithScanResults | undefined)?.scanResults
    if (!scanResults) {
      return ''
    }

    const messages: string[] = []

    if (scanResults.added) {
      messages.push(t('MessageTaskScanItemsAdded', { 0: scanResults.added }))
    }
    if (scanResults.updated) {
      messages.push(t('MessageTaskScanItemsUpdated', { 0: scanResults.updated }))
    }
    if (scanResults.missing) {
      messages.push(t('MessageTaskScanItemsMissing', { 0: scanResults.missing }))
    }

    const changesDetected = messages.length > 0 ? messages.join(', ') : t('MessageTaskScanNoChangesNeeded')
    if (!scanResults.elapsed) {
      return changesDetected
    }

    const elapsed = formatDuration(scanResults.elapsed / 1000, t, {
      style: 'compact',
      showDays: true,
      showSeconds: true
    })

    return elapsed ? `${changesDetected} (${elapsed})` : changesDetected
  }, [t, task.data])

  const cancelScan = useCallback(
    (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
      event.preventDefault()
      event.stopPropagation()

      const libraryId = task.data?.libraryId
      if (!libraryId) {
        console.error('No library id in library-scan task', task)
        return
      }

      setCancelingScan(true)
      emit('cancel_scan', libraryId)
    },
    [emit, task]
  )

  return (
    <div className="flex items-start gap-3 px-3 py-2.5 transition-all">
      <div className="flex shrink-0 items-center justify-center pt-0.5">
        {isFailed ? (
          <div className="bg-error/20 p-1.5 rounded-lg border border-error/20">
            <AlertCircle size={16} className="text-error" />
          </div>
        ) : isSuccess ? (
          <div className="bg-success/20 p-1.5 rounded-lg border border-success/20">
            <CheckCircle2 size={16} className="text-success" />
          </div>
        ) : (
          <div className="bg-white/5 p-1.5 rounded-lg border border-white/10">
            <LoadingSpinner size="la-sm" className="!cursor-default opacity-80" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-[11px] font-black uppercase tracking-widest text-white/90 leading-none truncate">{title}</p>
          {!isFinished && (
            <div className="bg-primary/20 px-1.5 py-0.5 rounded-full border border-primary/20">
              <span className="text-[8px] font-black uppercase tracking-tighter text-primary">Live</span>
            </div>
          )}
        </div>
        
        {!!description && (
          <p className="text-white/40 text-[10px] font-medium leading-relaxed break-words whitespace-normal line-clamp-2">
            {description}
          </p>
        )}
        
        {!!specialMessage && (
          <div className="flex items-center gap-1.5 mt-1 text-white/50">
            <Clock size={10} className="shrink-0" />
            <p className="text-[9px] font-bold tracking-tight leading-none uppercase">{specialMessage}</p>
          </div>
        )}
        
        {isFailed && !!failedMessage && (
          <div className="mt-1.5 p-2 bg-error/10 rounded-lg border border-error/10">
            <p className="text-error text-[10px] font-medium leading-tight break-words whitespace-normal italic">
              {failedMessage}
            </p>
          </div>
        )}
      </div>

      {userIsAdminOrUp && !isFinished && isLibraryScan && !cancelingScan && (
        <Btn size="small" color="bg-white/10" className="shrink-0 px-2 py-1 text-[9px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/20 transition-all h-7" onClick={cancelScan}>
          {t('ButtonCancel')}
        </Btn>
      )}
    </div>
  )
}
