import { createClient } from './client'

const COVERS_BUCKET = 'covers'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']

export class StorageError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StorageError'
  }
}

/**
 * Validate a file before uploading to Supabase Storage.
 * Throws a StorageError if the file is invalid.
 */
function validateImageFile(file: File): void {
  if (file.size > MAX_FILE_SIZE) {
    throw new StorageError(`File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`)
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new StorageError(
      `Invalid file type "${file.type}". Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
    )
  }
}

/**
 * Upload a cover image to Supabase Storage.
 * @param file - The image file to upload
 * @param storagePath - The path within the covers bucket (e.g., "library-items/{itemId}/cover.jpg")
 * @returns The public URL of the uploaded image
 */
export async function uploadCoverImage(file: File, storagePath: string): Promise<string> {
  validateImageFile(file)

  const supabase = createClient()
  const { error } = await supabase.storage
    .from(COVERS_BUCKET)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (error) {
    throw new StorageError(`Failed to upload cover image: ${error.message}`)
  }

  return getCoverImageUrl(storagePath)
}

/**
 * Get the public URL for a cover image in Supabase Storage.
 * @param storagePath - The path within the covers bucket
 * @returns The public URL string
 */
export function getCoverImageUrl(storagePath: string): string {
  const supabase = createClient()
  const { data } = supabase.storage
    .from(COVERS_BUCKET)
    .getPublicUrl(storagePath)

  return data.publicUrl
}

/**
 * Delete a cover image from Supabase Storage.
 * @param storagePath - The path within the covers bucket
 */
export async function deleteCoverImage(storagePath: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.storage
    .from(COVERS_BUCKET)
    .remove([storagePath])

  if (error) {
    throw new StorageError(`Failed to delete cover image: ${error.message}`)
  }
}

/**
 * Replace a cover image — deletes the old one and uploads the new one.
 * @param file - The new image file
 * @param storagePath - The path within the covers bucket
 * @param oldPath - Optional path to the old image to delete first
 * @returns The public URL of the new image
 */
export async function replaceCoverImage(
  file: File,
  storagePath: string,
  oldPath?: string
): Promise<string> {
  if (oldPath && oldPath !== storagePath) {
    try {
      await deleteCoverImage(oldPath)
    } catch {
      // Non-critical: old file may not exist
    }
  }
  return uploadCoverImage(file, storagePath)
}
