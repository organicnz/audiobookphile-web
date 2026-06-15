'use server'

import { removeGenre as apiRemoveGenre, renameGenre as apiRenameGenre } from '@/shared/lib/api/misc'
import { revalidatePath } from 'next/cache'

export type RemoveGenreApiResponse = {
  numItemsUpdated: number
}

export async function removeGenre(genre: string): Promise<RemoveGenreApiResponse> {
  const { numItemsUpdated } = await apiRemoveGenre(genre)
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
  const { genreMerged, numItemsUpdated } = await apiRenameGenre(genre, newGenreName)
  if (numItemsUpdated > 0) {
    revalidatePath('/settings/item-metadata-utils/genres')
  }
  return { genreMerged, numItemsUpdated }
}
