'use server'

import { requireUser } from '@/lib/supabase-api'
import type { Playlist, PlaylistItemPayload } from '@/types/api'

/**
 * Delete a playlist
 */
export async function deletePlaylistAction(playlistId: string): Promise<void> {
  const { supabase } = await requireUser()
  const { error } = await supabase.from('playlists').delete().eq('id', playlistId)
  if (error) throw new Error(error.message)
}

export async function createPlaylistAction(payload: {
  libraryId: string
  name: string
  description?: string | null
  items?: PlaylistItemPayload[]
}): Promise<Playlist> {
  const { supabase, user } = await requireUser()
  const db = supabase as any

  const { data, error } = await db
    .from('playlists')
    .insert({
      library_id: payload.libraryId,
      name: payload.name,
      description: payload.description ?? null,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  if (payload.items && payload.items.length > 0) {
    const items = payload.items.map((item, index) => ({
      playlist_id: data.id,
      library_item_id: item.libraryItemId,
      episode_id: item.episodeId ?? null,
      display_order: index,
    }))
    await db.from('playlist_items').insert(items)
  }

  return data as unknown as Playlist
}

export async function batchAddToPlaylistAction(
  playlistId: string,
  items: PlaylistItemPayload[],
): Promise<Playlist> {
  const { supabase } = await requireUser()
  const db = supabase as any

  const { count } = await db
    .from('playlist_items')
    .select('*', { count: 'exact', head: true })
    .eq('playlist_id', playlistId)

  const rows = items.map((item, index) => ({
    playlist_id: playlistId,
    library_item_id: item.libraryItemId,
    episode_id: item.episodeId ?? null,
    display_order: (count ?? 0) + index,
  }))

  await db.from('playlist_items').insert(rows)

  const { data, error } = await db
    .from('playlists')
    .select('*, playlist_items(*, library_items(*))')
    .eq('id', playlistId)
    .single()

  if (error) throw new Error(error.message)
  return data as unknown as Playlist
}

export async function batchRemoveFromPlaylistAction(
  playlistId: string,
  items: PlaylistItemPayload[],
): Promise<Playlist> {
  const { supabase } = await requireUser()
  const db = supabase as any

  for (const item of items) {
    let query = db
      .from('playlist_items')
      .delete()
      .eq('playlist_id', playlistId)
      .eq('library_item_id', item.libraryItemId)

    if (item.episodeId) {
      query = query.eq('episode_id', item.episodeId)
    }

    await query
  }

  const { data, error } = await db
    .from('playlists')
    .select('*, playlist_items(*, library_items(*))')
    .eq('id', playlistId)
    .single()

  if (error) throw new Error(error.message)
  return data as unknown as Playlist
}
