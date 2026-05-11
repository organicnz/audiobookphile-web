import { getLibraryItems, getSeries } from '@/lib/supabase-api';
import SeriesClient from './SeriesClient';

export default async function SeriesPage({ params }: { params: Promise<{ series: string; library: string }> }) {
  const { series: seriesId, library: libraryId } = await params

  let series, libraryItems
  try {
    ;[series, libraryItems] = await Promise.all([getSeries(seriesId), getLibraryItems(libraryId)])
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
