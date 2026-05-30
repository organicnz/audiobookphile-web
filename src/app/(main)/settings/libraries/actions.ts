'use server'

import type { GetFilesystemPathsResponse, Library, SaveLibraryOrderApiResponse } from '@/types/api'
import {
  createLibrary as apiCreateLibrary,
  updateLibrary as apiUpdateLibrary,
  deleteLibrary as apiDeleteLibrary
} from '@/lib/api'
import { revalidatePath } from 'next/cache'

export async function createLibrary(newLibrary: Library): Promise<Library> {
  try {
    const library = await apiCreateLibrary(newLibrary as any)
    revalidatePath('/settings/libraries')
    return library as unknown as Library
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export async function editLibrary(libraryId: string, updatedLibrary: Library): Promise<Library> {
  try {
    const library = await apiUpdateLibrary(libraryId, updatedLibrary as any)
    revalidatePath('/settings/libraries')
    return library as unknown as Library
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export async function saveLibraryOrder(reorderObjects: { id: string; newOrder: number }[]): Promise<SaveLibraryOrderApiResponse> {
  try {
    for (const item of reorderObjects) {
      await apiUpdateLibrary(item.id, { displayOrder: item.newOrder } as any)
    }
    revalidatePath('/settings/libraries')
    return { libraries: [] } as unknown as SaveLibraryOrderApiResponse
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export async function deleteLibrary(libraryId: string): Promise<Library> {
  try {
    await apiDeleteLibrary(libraryId)
    revalidatePath('/settings/libraries')
    return {} as Library
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export async function requestScanLibrary(_libraryId: string): Promise<void> {
  console.warn('[libraries/actions] requestScanLibrary is not available in the Supabase-backed version')
}

export async function matchAll(_libraryId: string): Promise<void> {
  console.warn('[libraries/actions] matchAll is not available in the Edge API version yet')
}

export async function getFilesystemPaths(_path: string, _level: number): Promise<GetFilesystemPathsResponse> {
  console.warn('[libraries/actions] getFilesystemPaths is not available in the Supabase-backed version')
  return { directories: [] } as unknown as GetFilesystemPathsResponse
}
