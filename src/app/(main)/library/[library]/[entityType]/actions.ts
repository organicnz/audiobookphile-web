'use server'

import type { Author, AuthorQuickMatchPayload } from '@/types/api';
import { createClient } from '@/utils/supabase/server';

export async function quickMatchAuthorAction(_authorId: string, _payload: AuthorQuickMatchPayload): Promise<{ updated: boolean; author: Author } | null> {
  console.warn('[entityType/actions] quickMatchAuthor is not available in the Supabase-backed version')
  return null
}

export async function updateAuthorAction(authorId: string, editedAuthor: Partial<Author>): Promise<{ updated: boolean; merged?: boolean; author: Author } | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('authors')
    .update({
      name: editedAuthor.name,
      description: (editedAuthor as any).description,
      image_path: (editedAuthor as any).imagePath,
    })
    .eq('id', authorId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return { updated: true, author: data as unknown as Author }
}

export async function deleteAuthorAction(authorId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('authors').delete().eq('id', authorId)
  if (error) throw new Error(error.message)
}

export async function submitAuthorImageAction(_authorId: string, _url: string) {
  console.warn('[entityType/actions] submitAuthorImage is not available in the Supabase-backed version')
  return null
}

export async function removeAuthorImageAction(authorId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('authors').update({ image_path: null }).eq('id', authorId)
  if (error) throw new Error(error.message)
}
