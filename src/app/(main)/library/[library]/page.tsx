import { getLibraries, getLibraryPersonalized } from '@/shared/lib/api'
import { getLibrarySlug, resolveLibraryFromParam } from '@/shared/lib/library-slugs'
import { redirect } from 'next/navigation'
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
      if (resolved.isUuidRedirect) {
        const canonicalSlug = getLibrarySlug(resolved.library, response.libraries)
        redirect(`/library/${canonicalSlug}`)
      }
      libraryId = resolved.library.id
    }
  } catch (err) {
    if (err && typeof err === 'object' && 'digest' in err && typeof err.digest === 'string' && err.digest.includes('NEXT_REDIRECT')) {
      throw err
    }
    console.error('Error resolving library slug', err)
  }

  let personalized
  try {
    personalized = await getLibraryPersonalized(libraryId)
  } catch (err) {
    console.error('Error getting personalized data', err)
  }

  if (!personalized) {
    return (
      <div className="flex w-full flex-col items-center justify-center p-12 text-center">
        <p className="text-lg font-medium">Unable to load library</p>
        <p className="mt-2 text-sm text-gray-500">There was a problem fetching your library data. Try refreshing the page.</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <LibraryClient personalized={personalized} />
    </div>
  )
}
