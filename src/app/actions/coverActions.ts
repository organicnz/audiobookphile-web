'use server'

import { fetchBookCover } from '@/lib/coverFetch'
import { removeCover, uploadCover } from '@/lib/supabase-api'

/**
 * Server Action: Upload a cover image file for a library item
 */
export async function uploadCoverAction(libraryItemId: string, base64Data: string, fileName: string) {
  const buffer = Buffer.from(base64Data, 'base64')
  const file = new File([buffer], fileName, { type: 'image/jpeg' })
  return uploadCover(libraryItemId, file)
}

/**
 * Server Action: Remove the current cover from a library item
 */
export async function removeCoverAction(libraryItemId: string) {
  return removeCover(libraryItemId)
}

/**
 * Server Action: Update cover from a URL — fetches the image and stores it in Supabase Storage
 */
export async function updateCoverFromUrlAction(libraryItemId: string, coverUrl: string) {
  try {
    const res = await fetch(coverUrl, { signal: AbortSignal.timeout(10000) })
    if (!res.ok) throw new Error(`Failed to fetch cover: ${res.status}`)
    const buffer = await res.arrayBuffer()
    if (buffer.byteLength < 1000) throw new Error('Cover image too small')
    return uploadCover(libraryItemId, buffer)
  } catch (err) {
    console.error('[coverActions] updateCoverFromUrl failed:', err)
    return null
  }
}

/**
 * Server Action: Auto-fetch cover from metadata providers (Open Library, Google Books)
 */
export async function autoFetchCoverAction(
  libraryItemId: string,
  title: string,
  author?: string
): Promise<string | null> {
  try {
    const fetched = await fetchBookCover(title, author)
    if (!fetched) return null
    return uploadCover(libraryItemId, fetched.buffer, { extension: fetched.extension, contentType: fetched.contentType })
  } catch (err) {
    console.error('[coverActions] autoFetchCover failed:', err)
    return null
  }
}

/**
 * Server Action: Set cover from a local file — not available in Supabase-backed version
 */
export async function setCoverFromLocalFileAction(_libraryItemId: string, _filePath: string) {
  console.warn('[coverActions] setCoverFromLocalFile is not available in the Supabase-backed version')
  return null
}
