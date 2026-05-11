'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type SaveNarratorApiResponse = {
  updated: number
}

export type DeleteNarratorApiResponse = {
  updated: number
}

export async function saveNarrator(libraryId: string, narratorId: string, newName: string): Promise<SaveNarratorApiResponse> {
  const supabase = await createClient()
  const { error } = await (supabase as any).from('narrators').update({ name: newName }).eq('id', narratorId)
  if (error) throw new Error(error.message)
  revalidatePath(`/library/${libraryId}/narrators`)
  return { updated: 1 }
}

export async function deleteNarrator(libraryId: string, narratorId: string): Promise<DeleteNarratorApiResponse> {
  const supabase = await createClient()
  const { error } = await (supabase as any).from('narrators').delete().eq('id', narratorId)
  if (error) throw new Error(error.message)
  revalidatePath(`/library/${libraryId}/narrators`)
  return { updated: 1 }
}
