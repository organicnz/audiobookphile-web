'use server'

import {
    getLibraryAuthors,
    getLibraryCollections,
    getLibraryFilterData,
    getLibraryItems,
    getLibraryPlaylists,
    getLibrarySeries,
} from '@/lib/supabase-api'

export async function fetchLibraryItemsAction(libraryId: string, _query?: string) {
  return getLibraryItems(libraryId)
}

export async function fetchLibraryFilterDataAction(libraryId: string) {
  return getLibraryFilterData(libraryId)
}

export async function fetchSeriesAction(libraryId: string, _query?: string) {
  return getLibrarySeries(libraryId)
}

export async function fetchAuthorsAction(libraryId: string, _query?: string) {
  return getLibraryAuthors(libraryId)
}

export async function fetchCollectionsAction(libraryId: string, _query?: string) {
  const data = await getLibraryCollections(libraryId)
  return { results: data ?? [] }
}

export async function fetchPlaylistsAction(libraryId: string, _query?: string) {
  const data = await getLibraryPlaylists(libraryId)
  return { results: data ?? [] }
}
