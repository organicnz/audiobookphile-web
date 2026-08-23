import { LibraryStatsDashboard } from '@/features/library/components/LibraryStatsDashboard'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

// See: https://nextjs.org/docs/app/guides/adopting-partial-prefetching

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components

export default async function StatsPage({ params }: { params: Promise<{ library: string }> }) {
  const { library: libraryId } = await params
  return (
    <div className="min-h-screen w-full p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Library Stats</h1>
        <Link href="/account/stats" className="text-foreground-muted hover:text-foreground text-sm underline underline-offset-2 transition-colors">
          Your listening stats →
        </Link>
      </div>
      <LibraryStatsDashboard libraryId={libraryId} />
    </div>
  )
}
