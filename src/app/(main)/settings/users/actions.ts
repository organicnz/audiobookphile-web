'use server'

import { getLibraries } from '@/lib/supabase-api'
import { Library } from '@/types/api'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteUser(userId: string): Promise<void> {
  const { createServiceRoleClient } = await import('@/utils/supabase/service-role')
  const adminClient = createServiceRoleClient()
  const { error } = await adminClient.auth.admin.deleteUser(userId)
  if (error) throw new Error(error.message)
  revalidatePath('/settings/users')
}

export async function fetchLibraries(): Promise<Library[]> {
  const response = await getLibraries()
  return response.libraries
}

export async function fetchTags(): Promise<string[]> {
  // Tags are stored in books.tags (JSONB array); aggregate distinct values
  const supabase = await createClient()
  const { data } = await supabase.from('books').select('tags')
  const tagsSet = new Set<string>()
  data?.forEach((row) => {
    if (Array.isArray(row.tags)) row.tags.forEach((t) => tagsSet.add(String(t)))
  })
  return Array.from(tagsSet).sort()
}
