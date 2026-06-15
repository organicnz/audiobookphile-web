'use server'

import { removeTag as apiRemoveTag, renameTag as apiRenameTag } from '@/shared/lib/api/misc'
import { revalidatePath } from 'next/cache'

export type RemoveTagApiResponse = {
  numItemsUpdated: number
}

export async function removeTag(tag: string): Promise<RemoveTagApiResponse> {
  const { numItemsUpdated } = await apiRemoveTag(tag)
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
  const { tagMerged, numItemsUpdated } = await apiRenameTag(tag, newTagName)
  if (numItemsUpdated > 0) {
    revalidatePath('/settings/item-metadata-utils/tags')
  }
  return { tagMerged, numItemsUpdated }
}
