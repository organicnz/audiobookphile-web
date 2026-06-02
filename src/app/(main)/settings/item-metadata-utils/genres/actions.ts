'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type RemoveGenreApiResponse = {
  numItemsUpdated: number
}

export async function removeGenre(genre: string): Promise<RemoveGenreApiResponse> {
  const supabase = await createClient()
  // Remove genre from all books that have it in their genres array
  const { data: books } = await supabase.from('books').select('id, genres')
  let numItemsUpdated = 0
  for (const book of books ?? []) {
    const genres = book.genres as string[] | null
    if (Array.isArray(genres) && genres.includes(genre)) {
      const newGenres = genres.filter((g) => g !== genre)
      await supabase.from('books').update({ genres: newGenres }).eq('id', book.id)
      numItemsUpdated++
    }
  }
  if (numItemsUpdated > 0) {
    revalidatePath('/settings/item-metadata-utils/genres')
  }
  return { numItemsUpdated }
}

export type RenameGenreApiResponse = {
  genreMerged: boolean
  numItemsUpdated: number
}

export async function renameGenre(genre: string, newGenreName: string): Promise<RenameGenreApiResponse> {
  const supabase = await createClient()
  const { data: books } = await supabase.from('books').select('id, genres')
  let numItemsUpdated = 0
  let genreMerged = false
  for (const book of books ?? []) {
    const genres = book.genres as string[] | null
    if (Array.isArray(genres) && genres.includes(genre)) {
      const newGenres = genres.map((g) => (g === genre ? newGenreName : g))
      if (newGenres.includes(newGenreName) && newGenres.filter((g) => g === newGenreName).length > 1) {
        genreMerged = true
      }
      await supabase.from('books').update({ genres: [...new Set(newGenres)] }).eq('id', book.id)
      numItemsUpdated++
    }
  }
  if (numItemsUpdated > 0) {
    revalidatePath('/settings/item-metadata-utils/genres')
  }
  return { genreMerged, numItemsUpdated }
}
