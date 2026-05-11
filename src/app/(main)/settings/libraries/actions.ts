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

export async function matchAll(_libraryId: string): Promise<void> {
  console.warn('[libraries/actions] matchAll is not available in the Supabase-backed version')
}

export async function getFilesystemPaths(_path: string, _level: number): Promise<GetFilesystemPathsResponse> {
  console.warn('[libraries/actions] getFilesystemPaths is not available in the Supabase-backed version')
  return { directories: [] } as unknown as GetFilesystemPathsResponse
}
