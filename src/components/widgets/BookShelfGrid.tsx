'use client'

import { useTypeSafeTranslations } from '@/hooks/useTypeSafeTranslations'
import { mergeClasses } from '@/lib/merge-classes'
import { motion } from 'framer-motion'

interface BookShelfGridProps {
  title: string
  children: React.ReactNode
  className?: string
}

export default function BookShelfGrid({ title, children, className }: BookShelfGridProps) {
  const t = useTypeSafeTranslations()

  return (
    <div className={mergeClasses('relative w-full content-visibility-auto mb-12', className)}>
      <div className="relative mb-6">
        <div className="categoryPlacard left-4e md:left-8e w-44e relative top-0 z-30 transform">
          <div className="bg-primary/95 backdrop-blur-xl px-4 py-1.5 flex h-full w-full items-center justify-center rounded-lg border border-white/10 shadow-lg">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">{title}</h2>
          </div>
        </div>
        <div className="h-px bg-white/5 absolute top-0 right-0 left-0 z-5 w-full"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 gap-4 px-4e sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 md:px-8e"
      >
        {children}
      </motion.div>
    </div>
  )
}
