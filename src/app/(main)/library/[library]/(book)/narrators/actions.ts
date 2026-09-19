'use server'

import { revalidatePath } from 'next/cache'
import { deleteNarrator as apiDeleteNarrator, updateNarrator as apiUpdateNarrator } from '@/shared/lib/api'

export type SaveNarratorApiResponse = {
  updated: number
}

export type DeleteNarratorApiResponse = {
  updated: number
}

export async function saveNarrator(
  libraryId: string,
  narratorId: string,
  newName: string
): Promise<SaveNarratorApiResponse> {
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
