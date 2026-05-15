'use server'

import { getLibraries } from '@/lib/supabase-api'
import type { GetFilesystemPathsResponse, Library, SaveLibraryOrderApiResponse } from '@/types/api'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createLibrary(newLibrary: Library): Promise<Library> {
  const supabase = await createClient()
  const { data, error } = await (supabase as any)
    .from('libraries')
    .insert({
      name: newLibrary.name,
      media_type: newLibrary.mediaType,
      icon: newLibrary.icon,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  revalidatePath('/settings/libraries')
  return data as unknown as Library
}

export async function editLibrary(libraryId: string, updatedLibrary: Library): Promise<Library> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('libraries')
    .update({ name: updatedLibrary.name, icon: updatedLibrary.icon } as any)
    .eq('id', libraryId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  revalidatePath('/settings/libraries')
  return data as unknown as Library
}

export async function deleteLibrary(libraryId: string): Promise<Library> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('libraries').delete().eq('id', libraryId).select().single()
  if (error) throw new Error(error.message)
  revalidatePath('/settings/libraries')
  return data as unknown as Library
}

export async function saveLibraryOrder(reorderObjects: { id: string; newOrder: number }[]): Promise<SaveLibraryOrderApiResponse> {
  const supabase = await createClient()
  for (const item of reorderObjects) {
    await supabase.from('libraries').update({ display_order: item.newOrder }).eq('id', item.id)
  }
  const response = await getLibraries()
  return { libraries: response.libraries } as unknown as SaveLibraryOrderApiResponse
}

export async function requestScanLibrary(_libraryId: string): Promise<void> {
  console.warn('[libraries/actions] requestScanLibrary is not available in the Supabase-backed version')
}

export async function matchAll(libraryId: string): Promise<void> {
  // Batch fetch covers for all items in this library that are missing cover art
  const { fetchBookCover } = await import('@/lib/coverFetch')
  const { createServiceRoleClient } = await import('@/utils/supabase/service-role')
  const db = createServiceRoleClient()

  const { data: items } = await db
    .from('library_items')
    .select('id, title, author_names_first_last')
    .eq('library_id', libraryId)
    .is('cover_path', null)
    .not('title', 'is', null)

  if (!items?.length) return

  for (const item of items) {
    const title = item.title?.trim()
    if (!title || title.length < 3) continue

    const author = item.author_names_first_last?.split('/')[0]?.trim() || undefined
    const fetched = await fetchBookCover(title, author)
    if (!fetched) continue

    const storagePath = `${item.id}/cover.${fetched.extension}`
    const { error: uploadErr } = await db.storage
      .from('covers')
      .upload(storagePath, fetched.buffer, { upsert: true, contentType: fetched.contentType })
    if (uploadErr) continue

    await db.from('library_items').update({ cover_path: storagePath }).eq('id', item.id)
    // Small delay to be polite to external APIs
    await new Promise(r => setTimeout(r, 300))
  }

  revalidatePath(`/library/${libraryId}`)
}

export async function getFilesystemPaths(_path: string, _level: number): Promise<GetFilesystemPathsResponse> {
  console.warn('[libraries/actions] getFilesystemPaths is not available in the Supabase-backed version')
  return { directories: [] } as unknown as GetFilesystemPathsResponse
}
