'use server'

import { apiRequest } from '@/shared/lib/api'
import type { Playlist, PlaylistItemPayload } from '@/types/api'

/**
 * Delete a playlist
 */
export async function deletePlaylistAction(playlistId: string): Promise<void> {
  return await apiRequest<void>(`/api/playlists/${playlistId}`, {
    method: 'DELETE'
  })
}

export async function createPlaylistAction(payload: {
  libraryId: string
  name: string
  description?: string | null
  items?: PlaylistItemPayload[]
}): Promise<Playlist> {
  return await apiRequest<Playlist>('/api/playlists', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export async function batchAddToPlaylistAction(
  playlistId: string,
  items: PlaylistItemPayload[],
): Promise<Playlist> {
  return await apiRequest<Playlist>(`/api/playlists/${playlistId}/batch-add`, {
    method: 'POST',
    body: JSON.stringify({ items })
  })
}

export async function batchRemoveFromPlaylistAction(
  playlistId: string,
  items: PlaylistItemPayload[],
): Promise<Playlist> {
  return await apiRequest<Playlist>(`/api/playlists/${playlistId}/batch-remove`, {
    method: 'POST',
    body: JSON.stringify({ items })
  })
}
