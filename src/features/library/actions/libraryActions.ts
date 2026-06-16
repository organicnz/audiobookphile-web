'use server'

import { getLibraryAuthors, getLibraryCollections, getLibraryFilterData, getLibraryItems, getLibraryPlaylists, getLibrarySeries } from '@/shared/lib/api'

export async function fetchLibraryItemsAction(libraryId: string, query?: string) {
  return getLibraryItems(libraryId, query)
}

export async function fetchLibraryFilterDataAction(libraryId: string) {
  return getLibraryFilterData(libraryId)
}

export async function fetchSeriesAction(libraryId: string, query?: string) {
  return getLibrarySeries(libraryId, query)
}

export async function fetchAuthorsAction(libraryId: string, query?: string) {
  return getLibraryAuthors(libraryId, query)
}

export async function fetchCollectionsAction(libraryId: string, query?: string) {
  const data = await getLibraryCollections(libraryId, query)
  return { results: data ?? [] }
}

export async function fetchPlaylistsAction(libraryId: string, query?: string) {
  const data = await getLibraryPlaylists(libraryId, query)
  return { results: data ?? [] }
}
