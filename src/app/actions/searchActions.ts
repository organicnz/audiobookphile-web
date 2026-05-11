'use server'

import {
    getCurrentUser,
    getLibraries,
    getLibraryCollections,
    getLibraryPlaylists,
    searchLibrary,
} from '@/lib/supabase-api'

/**
 * Server Action: Search a library
 */
export async function searchLibraryAction(libraryId: string, query: string, limit?: number) {
  return searchLibrary(libraryId, query, limit)
}

/**
 * Server Action: Get current user
 */
export async function getCurrentUserAction() {
  return getCurrentUser()
}

/**
 * Server Action: Get libraries
 */
export async function getLibrariesAction() {
  return getLibraries()
}

/**
 * Server Action: Get collections for a library
 */
export async function getCollectionsAction(libraryId: string) {
  const data = await getLibraryCollections(libraryId)
  const results = (data ?? []).map((c: any) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    libraryId: c.library_id,
    books: (c.collection_items ?? []).map((ci: any) => ci.library_items).filter(Boolean),
    createdAt: c.created_at ? new Date(c.created_at).getTime() : undefined,
    updatedAt: c.updated_at ? new Date(c.updated_at).getTime() : undefined,
  }))
  return { results }
}

/**
 * Server Action: Get playlists for a library
 */
export async function getPlaylistsAction(libraryId: string) {
  const data = await getLibraryPlaylists(libraryId)
  const results = (data ?? []).map((p: any) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    libraryId: p.library_id,
    userId: p.user_id,
    items: (p.playlist_items ?? []).map((pi: any) => pi.library_items).filter(Boolean),
    createdAt: p.created_at ? new Date(p.created_at).getTime() : undefined,
    updatedAt: p.updated_at ? new Date(p.updated_at).getTime() : undefined,
  }))
  return { results }
}
