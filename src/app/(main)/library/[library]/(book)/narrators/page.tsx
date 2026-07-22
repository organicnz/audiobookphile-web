import NarratorsClient from './NarratorsClient'
import { apiRequest } from '@/shared/lib/api/client'

export default async function NarratorsPage({ params }: { params: Promise<{ library: string }> }) {
  const { library: libraryId } = await params

  // Narrators are stored in book_narrators joined with a narrators table (if it exists)
  // Fall back to empty array if the table doesn't exist
  let narrators: { id: string; name: string }[] = []
  try {
    const { narrators: fetchedNarrators } = await apiRequest<{ narrators: { id: string; name: string }[] }>(`/api/libraries/${libraryId}/narrators`)
    narrators = fetchedNarrators ?? []
  } catch {
    narrators = []
  }

  return (
    <div className="w-full p-8">
      <NarratorsClient libraryId={libraryId} narrators={narrators as any} />
    </div>
  )
}
