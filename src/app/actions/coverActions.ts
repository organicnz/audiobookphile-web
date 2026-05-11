'use server'

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
 * Server Action: Update cover from a URL — not available in Supabase-backed version
 */
export async function updateCoverFromUrlAction(_libraryItemId: string, _coverUrl: string) {
  console.warn('[coverActions] updateCoverFromUrl is not available in the Supabase-backed version')
  return null
}

/**
 * Server Action: Set cover from a local file — not available in Supabase-backed version
 */
export async function setCoverFromLocalFileAction(_libraryItemId: string, _filePath: string) {
  console.warn('[coverActions] setCoverFromLocalFile is not available in the Supabase-backed version')
  return null
}
