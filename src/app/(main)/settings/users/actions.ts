'use server'

import { revalidatePath } from 'next/cache'
import { deleteUser as apiDeleteUser, getLibraries } from '@/shared/lib/api'
import type { Library } from '@/types/api'

export async function deleteUser(userId: string): Promise<void> {
  try {
    await apiDeleteUser(userId)
    revalidatePath('/settings/users')
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export async function fetchLibraries(): Promise<Library[]> {
  try {
    const response = await getLibraries()
    return response.libraries as any as Library[]
  } catch (e) {
    return []
  }
}

export async function fetchTags(): Promise<string[]> {
  return [] // Tags are not fully implemented via API yet
}
