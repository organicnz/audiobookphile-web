'use server'

import type { Library } from '@/types/api'
import {
  deleteUser as apiDeleteUser,
  getLibraries,
} from '@/shared/lib/api'
import { revalidatePath } from 'next/cache'

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
    return response.libraries as unknown as Library[]
  } catch (e) {
    return []
  }
}

export async function fetchTags(): Promise<string[]> {
  return [] // Tags are not fully implemented via API yet
}
