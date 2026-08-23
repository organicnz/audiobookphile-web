import { apiFetch } from '@/shared/lib/api/client'
import { getLibrarySlug, resolveLibraryFromParam } from '@/shared/lib/library-slugs'
import { redirect } from 'next/navigation'
import type { GetLibrariesResponse, PersonalizedShelf } from '@/types/api'
import LibraryClient from './LibraryClient'

// Continue Listening and personalized shelves are per-user and per-session —
// never serve a cached version. Force dynamic rendering so every page load
// hits the edge function with fresh progress data.

export default async function LibraryPage({ params }: { params: Promise<{ library: string }> }) {
  const { library: paramValue } = await params

  let libraryId = paramValue
  const librariesResult = await apiFetch<GetLibrariesResponse>('/api/libraries', {})
  if (librariesResult.ok) {
    const response = librariesResult.data
    const resolved = resolveLibraryFromParam(paramValue, response.libraries)
    if (resolved) {
      if (resolved.isUuidRedirect) {
        const canonicalSlug = getLibrarySlug(resolved.library, response.libraries)
        redirect(`/library/${canonicalSlug}`)
      }
      libraryId = resolved.library.id
    }
  }

  const personalizedResult = await apiFetch<PersonalizedShelf[]>(`/api/libraries/${libraryId}/personalized?include=rssfeed,share`, {})

  if (!personalizedResult.ok) {
    return (
      <div className="flex w-full flex-col items-center justify-center p-12 text-center">
        <p className="text-lg font-medium">Unable to load library</p>
        <p className="mt-2 text-sm text-gray-500">There was a problem fetching your library data. Try refreshing the page.</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <LibraryClient personalized={personalizedResult.data} />
    </div>
  )
}
