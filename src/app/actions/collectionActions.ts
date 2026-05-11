'use server'

import { requireUser } from '@/lib/supabase-api'
import type { Collection } from '@/types/api'

/**
 * Create a collection w/ initial book library item IDs
 */
export async function createCollectionAction(payload: {
  libraryId: string
  name: string
  description?: string | null
  books?: string[]
}): Promise<Collection> {
  const { supabase } = await requireUser()
  const db = supabase as any

  const { data, error } = await db
    .from('collections')
    .insert({ library_id: payload.libraryId, name: payload.name, description: payload.description ?? null })
    .select()
    .single()

  if (error) throw new Error(error.message)

  if (payload.books && payload.books.length > 0) {
    const items = payload.books.map((libraryItemId, index) => ({
      collection_id: data.id,
      library_item_id: libraryItemId,
      display_order: index,
    }))
    await db.from('collection_items').insert(items)
  }

  return data as unknown as Collection
}

/**
 * Add a library item to a collection
 */
export async function addBookToCollectionAction(
  collectionId: string,
  libraryItemId: string,
): Promise<Collection> {
  const { supabase } = await requireUser()
  const db = supabase as any

  const { count } = await db
    .from('collection_items')
    .select('*', { count: 'exact', head: true })
    .eq('collection_id', collectionId)

  await db.from('collection_items').insert({
    collection_id: collectionId,
    library_item_id: libraryItemId,
    display_order: count ?? 0,
  })

  const { data, error } = await db
    .from('collections')
    .select('*, collection_items(*, library_items(*))')
    .eq('id', collectionId)
    .single()

  if (error) throw new Error(error.message)
  return data as unknown as Collection
}

/**
 * Remove a library item from a collection
 */
export async function removeBookFromCollectionAction(
  collectionId: string,
  libraryItemId: string,
): Promise<Collection> {
  const { supabase } = await requireUser()
  const db = supabase as any

  await db
    .from('collection_items')
    .delete()
    .eq('collection_id', collectionId)
    .eq('library_item_id', libraryItemId)

  const { data, error } = await db
    .from('collections')
    .select('*, collection_items(*, library_items(*))')
    .eq('id', collectionId)
    .single()

  if (error) throw new Error(error.message)
  return data as unknown as Collection
}

/**
 * Update a collection's name and/or description
 */
export async function updateCollectionAction(
  collectionId: string,
  payload: { name?: string; description?: string },
): Promise<Collection> {
  const { supabase } = await requireUser()

  const { data, error } = await supabase
    .from('collections')
    .update(payload as any)
    .eq('id', collectionId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as unknown as Collection
}

/**
 * Delete a collection
 */
export async function deleteCollectionAction(collectionId: string): Promise<void> {
  const { supabase } = await requireUser()
  const { error } = await supabase.from('collections').delete().eq('id', collectionId)
  if (error) throw new Error(error.message)
}

/**
 * Create a playlist from a collection — not available in Supabase-backed version
 */
export async function createPlaylistFromCollectionAction(_collectionId: string): Promise<{ id: string }> {
  console.warn('[collectionActions] createPlaylistFromCollection is not available in the Supabase-backed version')
  return { id: '' }
}
