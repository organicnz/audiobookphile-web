import type { PlaybackSessionRow } from '@/shared/lib/api/stats'
import { formatDistanceToNow } from 'date-fns'

interface RecentSessionsProps {
  sessions: PlaybackSessionRow[]
}

function formatMinutes(seconds: number | null): string {
  if (!seconds || seconds <= 0) return '0m'
  const m = Math.round(seconds / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  const rem = m % 60
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`
}

export default function RecentSessions({ sessions }: RecentSessionsProps) {
  if (!sessions.length) {
    return (
      <div className="mx-auto w-full md:mx-0 md:w-80 md:shrink-0">
        <h2 className="mb-4 text-xl font-semibold">Recent Sessions</h2>
        <p className="text-foreground-muted text-sm">No listening sessions yet.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full md:mx-0 md:w-80 md:shrink-0">
      <h2 className="mb-4 text-xl font-semibold">Recent Sessions</h2>
      <ul className="space-y-1.5">
        {sessions.map((item, index) => (
          <li key={item.id}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-1">
                <span className="text-foreground-muted w-7 shrink-0 text-sm tabular-nums">{index + 1}.</span>
                <div className="max-w-[14rem] min-w-0">
                  <p className="text-foreground truncate text-sm">{item.display_title ?? 'Unknown title'}</p>
                  <p className="text-foreground-subdued text-xs">{formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}</p>
                </div>
              </div>
              <p className="text-foreground w-[4.5rem] shrink-0 text-right text-sm font-semibold tabular-nums">{formatMinutes(item.time_listening)}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
