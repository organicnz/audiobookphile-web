'use server'

import { updateNarrator as apiUpdateNarrator, deleteNarrator as apiDeleteNarrator } from '@/shared/lib/api'
import { revalidatePath } from 'next/cache'

export type SaveNarratorApiResponse = {
  updated: number
}

export type DeleteNarratorApiResponse = {
  updated: number
}

export async function saveNarrator(libraryId: string, narratorId: string, newName: string): Promise<SaveNarratorApiResponse> {
  try {
    await apiUpdateNarrator(narratorId, { name: newName })
    revalidatePath(`/library/${libraryId}/narrators`)
    return { updated: 1 }
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export async function deleteNarrator(libraryId: string, narratorId: string): Promise<DeleteNarratorApiResponse> {
  try {
    await apiDeleteNarrator(narratorId)
    revalidatePath(`/library/${libraryId}/narrators`)
    return { updated: 1 }
  } catch (error: any) {
    throw new Error(error.message)
  }
}
