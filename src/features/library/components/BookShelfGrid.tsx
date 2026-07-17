'use client'

import { useTypeSafeTranslations } from '@/shared/hooks/useTypeSafeTranslations'
import { mergeClasses } from '@/shared/lib/merge-classes'
import { motion } from 'framer-motion'

interface BookShelfGridProps {
  title: string
  children: React.ReactNode
  className?: string
}

export default function BookShelfGrid({ title, children, className }: BookShelfGridProps) {
  const t = useTypeSafeTranslations()

  return (
    <div className={mergeClasses('content-visibility-auto relative mb-12 w-full', className)}>
      <div className="relative mb-6">
        <div className="categoryPlacard left-4e md:left-8e w-44e relative top-0 z-30 transform">
          <div className="bg-primary/95 flex h-full w-full items-center justify-center rounded-lg border border-white/10 px-4 py-1.5 shadow-lg backdrop-blur-xl">
            <h2 className="text-[10px] font-black tracking-[0.2em] text-white/90 uppercase">{title}</h2>
          </div>
        </div>
        <div className="absolute top-0 right-0 left-0 z-5 h-px w-full bg-white/5"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4e md:px-8e grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7"
      >
        {children}
      </motion.div>
    </div>
  )
}
