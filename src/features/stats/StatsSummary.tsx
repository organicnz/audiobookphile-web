import type { StatsSummary } from './statsModel'

interface StatsSummaryProps {
  summary: StatsSummary
}

interface StatCardProps {
  icon: string
  value: number
  label: string
  locale?: string
}

function StatCard({ icon, value, label, locale = 'en' }: StatCardProps) {
  const formatted = new Intl.NumberFormat(locale).format(value)
  return (
    <div className="flex items-center gap-3 p-3">
      <span className="material-symbols hidden text-5xl text-yellow-400 sm:block" aria-hidden="true">
        {icon}
      </span>
      <div>
        <p className="text-foreground text-4xl leading-none font-bold md:text-5xl">{formatted}</p>
        <p className="text-foreground-muted mt-1 text-sm">{label}</p>
      </div>
    </div>
  )
}

export default function StatsSummaryRow({ summary }: StatsSummaryProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <StatCard icon="auto_stories" value={summary.booksFinished} label="Books finished" />
      <StatCard icon="event" value={summary.daysListened} label="Days listened" />
      <StatCard icon="watch_later" value={summary.totalHours} label="Hours listening" />
    </div>
  )
}
