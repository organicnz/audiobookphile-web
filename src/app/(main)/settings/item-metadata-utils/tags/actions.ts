'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type RemoveTagApiResponse = {
  numItemsUpdated: number
}

export async function removeTag(tag: string): Promise<RemoveTagApiResponse> {
  const supabase = await createClient()
  const { data: books } = await supabase.from('books').select('id, tags')
  let numItemsUpdated = 0
  for (const book of books ?? []) {
    const tags = book.tags as string[] | null
    if (Array.isArray(tags) && tags.includes(tag)) {
      const newTags = tags.filter((t) => t !== tag)
      await supabase.from('books').update({ tags: newTags }).eq('id', book.id)
      numItemsUpdated++
    }
  }
  if (numItemsUpdated > 0) {
    revalidatePath('/settings/item-metadata-utils/tags')
  }
  return { numItemsUpdated }
}

export type RenameTagApiResponse = {
  tagMerged: boolean
  numItemsUpdated: number
}

export async function renameTag(tag: string, newTagName: string): Promise<RenameTagApiResponse> {
  const supabase = await createClient()
  const { data: books } = await supabase.from('books').select('id, tags')
  let numItemsUpdated = 0
  let tagMerged = false
  for (const book of books ?? []) {
    const tags = book.tags as string[] | null
    if (Array.isArray(tags) && tags.includes(tag)) {
      const newTags = tags.map((t) => (t === tag ? newTagName : t))
      if (newTags.filter((t) => t === newTagName).length > 1) {
        tagMerged = true
      }
      await supabase.from('books').update({ tags: [...new Set(newTags)] }).eq('id', book.id)
      numItemsUpdated++
    }
  }
  if (numItemsUpdated > 0) {
    revalidatePath('/settings/item-metadata-utils/tags')
  }
  return { tagMerged, numItemsUpdated }
}
