import { motion } from 'framer-motion'

export function AdminAnalyticsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="border-border bg-primary/80 relative overflow-hidden rounded-2xl border p-6 shadow-xl backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div className="bg-primary h-4 w-24 animate-pulse rounded-md" />
            <div className="bg-primary h-9 w-9 animate-pulse rounded-lg" />
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <div className="bg-primary h-10 w-20 animate-pulse rounded-lg" />
            <div className="bg-primary/60 h-5 w-24 animate-pulse rounded-full" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
