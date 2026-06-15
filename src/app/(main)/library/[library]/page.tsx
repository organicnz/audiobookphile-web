import { getLibraryPersonalized } from '@/shared/lib/api'
import LibraryClient from './LibraryClient'

export default async function LibraryPage({ params }: { params: Promise<{ library: string }> }) {
  const { library: libraryId } = await params

  let personalized
  try {
    personalized = await getLibraryPersonalized(libraryId)
  } catch (err) {
    console.error('Error getting personalized data', err)
    return null
  }

  if (!personalized) {
    console.error('Error getting personalized data')
    return null
  }

  return (
    <div className="w-full">
      <LibraryClient personalized={personalized} />
    </div>
  )
}
