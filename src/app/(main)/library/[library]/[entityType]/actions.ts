'use server'

import type { Author, AuthorQuickMatchPayload } from '@/types/api'
import {
  quickMatchAuthor as apiQuickMatchAuthor,
  updateAuthor as apiUpdateAuthor,
  deleteAuthor as apiDeleteAuthor,
  submitAuthorImage as apiSubmitAuthorImage,
  removeAuthorImage as apiRemoveAuthorImage
} from '@/lib/api'

/**
 * Quick-match an author against Open Library / Google Books to fill in
 * description and fetch an author image.
 */
export async function quickMatchAuthorAction(
  authorId: string,
  payload: AuthorQuickMatchPayload
): Promise<{ updated: boolean; author: Author } | null> {
  try {
    return await apiQuickMatchAuthor(authorId, payload)
  } catch (err) {
    console.error('[quickMatchAuthor] failed:', err)
    return null
  }
}

export async function updateAuthorAction(
  authorId: string,
  editedAuthor: Partial<Author>
): Promise<{ updated: boolean; merged?: boolean; author: Author } | null> {
  try {
    return await apiUpdateAuthor(authorId, editedAuthor as any)
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export async function deleteAuthorAction(authorId: string) {
  try {
    await apiDeleteAuthor(authorId)
  } catch (error: any) {
    throw new Error(error.message)
  }
}

/**
 * Fetch and save an author image from a URL.
 */
export async function submitAuthorImageAction(authorId: string, url: string) {
  try {
    return await apiSubmitAuthorImage(authorId, { url } as any)
  } catch (err) {
    console.error('[submitAuthorImage] failed:', err)
    return null
  }
}

export async function removeAuthorImageAction(authorId: string) {
  try {
    await apiRemoveAuthorImage(authorId)
  } catch (error: any) {
    throw new Error(error.message)
  }
}
