import { motion } from 'framer-motion'
import { useTypeSafeTranslations } from '@/hooks/useTypeSafeTranslations'
import { mergeClasses } from '@/lib/merge-classes'
import { TranslationKey } from '@/types/translations'

interface ProgressIndicatorProps {
  progress: number // 0-100
  label?: TranslationKey
  className?: string
}

export default function ProgressIndicator({ progress: rawProgress, label = 'LabelProgress', className = '' }: ProgressIndicatorProps) {
  const t = useTypeSafeTranslations()
  const progress = Math.min(Math.max(rawProgress, 0), 100)

  return (
    <div className={mergeClasses('w-full py-4', className)}>
      <div className="mb-2 flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1"
        >
          {typeof label === 'string' ? (
            <p className="text-xs font-bold uppercase tracking-wider text-foreground/60">{t(label)}</p>
          ) : (
            label
          )}
        </motion.div>
        <motion.p 
          key={progress}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="min-w-[3rem] text-right text-sm font-mono font-bold text-primary"
        >
          {progress.toFixed(0)}%
        </motion.p>
      </div>

      <div className="bg-white/5 h-2.5 w-full overflow-hidden rounded-full border border-white/5 backdrop-blur-sm">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
          className="relative h-full rounded-full bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </motion.div>
      </div>
    </div>
  )
}

