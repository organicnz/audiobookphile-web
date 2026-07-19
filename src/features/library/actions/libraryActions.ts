'use server'

import { getLibraryAuthors, getLibraryCollections, getLibraryFilterData, getLibraryItems, getLibraryPlaylists, getLibrarySeries } from '@/shared/lib/api'
import { getLibraryStats } from '@/shared/lib/api/libraries'

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
  return getLibraryCollections(libraryId, query)
}

export async function fetchPlaylistsAction(libraryId: string, query?: string) {
  return getLibraryPlaylists(libraryId, query)
}

export async function fetchLibraryStatsAction(libraryId: string) {
  return getLibraryStats(libraryId)
}
