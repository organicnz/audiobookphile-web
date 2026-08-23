import { getLibraryItems, getSeries } from '@/shared/lib/api'
import SeriesClient from './SeriesClient'

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components

export default async function SeriesPage({ params }: { params: Promise<{ series: string; library: string }> }) {
  const { series: seriesId, library: libraryId } = await params

  let series, libraryItems
  try {
    ;[series, libraryItems] = await Promise.all([getSeries(libraryId, seriesId), getLibraryItems(libraryId)])
  } catch (err) {
    console.error('Error getting series or library items data', err)
    return null
  }

  if (!series || !libraryItems) {
    console.error('Error getting series or library items data')
    return null
  }

  return (
    <div className="w-full p-8">
      <SeriesClient series={series as any} libraryItems={libraryItems as any} />
    </div>
  )
}
