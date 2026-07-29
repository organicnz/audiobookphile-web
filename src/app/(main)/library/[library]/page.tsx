import { getLibraries, getLibraryPersonalized } from '@/shared/lib/api'
import { resolveLibraryFromParam } from '@/shared/lib/library-slugs'
import LibraryClient from './LibraryClient'

// Continue Listening and personalized shelves are per-user and per-session —
// never serve a cached version. Force dynamic rendering so every page load
// hits the edge function with fresh progress data.
export const dynamic = 'force-dynamic'

export default async function LibraryPage({ params }: { params: Promise<{ library: string }> }) {
  const { library: paramValue } = await params

  let libraryId = paramValue
  try {
    const response = await getLibraries()
    const resolved = resolveLibraryFromParam(paramValue, response.libraries)
    if (resolved) {
      libraryId = resolved.library.id
    }
  } catch (err) {
    console.error('Error resolving library slug', err)
  }

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
