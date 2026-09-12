import { sanitizeFileName } from '@/shared/lib/fileUtils'
import type { Library } from '@/types/api'
import { ItemToUpload } from './useUploader'
import {
  FileWithMetadata,
  CleanedItem,
  ProcessedItems,
  UploadProgressInfo,
  getMimeType,
  checkFileType,
  cleanBook,
  cleanPodcast,
  cleanItem,
  getItemsFromFilelist
} from './uploadTypes'
import { uploadMultipart, uploadSinglePart, uploadBackupArchive } from './uploadChunk'

export type { FileWithMetadata, CleanedItem, ProcessedItems, UploadProgressInfo }
export { getMimeType, checkFileType, cleanBook, cleanPodcast, cleanItem, getItemsFromFilelist, uploadBackupArchive }

/**
 * Uploads files directly to Supabase Storage or Backblaze B2 from the browser
 * (bypasses the Next.js API route body limit), then calls /api/upload/finalize
 * with just the metadata to create the DB records.
 */
export async function upload(
  item: ItemToUpload,
  libraryId: string,
  _folderId: string,
  mediaType: Library['mediaType'],
  cookie: string,
  onProgress?: (progress: UploadProgressInfo) => void
): Promise<void> {
  const bookId = item.bookId || crypto.randomUUID()
  const totalSize = item.itemFiles.reduce((sum, f) => sum + f.size, 0)
  let uploadedBytes = 0

  // 1. Upload each file (single-part or multipart based on presign response)
  const uploadedPaths: string[] = []

  for (const file of item.itemFiles) {
    const storagePath = `${bookId}/${sanitizeFileName(file.name)}`

    let uploadUrl = ''
    let providerPrefix = ''
    let multipartData: {
      uploadId: string
      partUrls: string[]
      partSize: number
    } | null = null

    try {
      const presignUrl = '/api/upload/presign'
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cookie}`
      }
      if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        headers['apikey'] = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }

      const presignRes = await fetch(presignUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          filename: storagePath,
          contentType: file.type || file.mime_type || getMimeType(file.name) || 'application/octet-stream',
          size: file.size
        })
      })

      if (presignRes.status === 200) {
        const data = await presignRes.json()
        providerPrefix = data.provider_prefix || ''
        if (data.multipart) {
          multipartData = {
            uploadId: data.uploadId,
            partUrls: data.partUrls,
            partSize: data.partSize
          }
          uploadUrl = '__multipart__'
        } else {
          uploadUrl = data.url
        }
      } else if (presignRes.status !== 501) {
        const errData = await presignRes.json().catch(() => ({}))
        throw new Error(errData.error || `Presign failed: ${presignRes.status}`)
      }
    } catch (e: any) {
      console.warn('Failed to get presigned URL:', e)
      if (e instanceof Error && e.message.includes('Presign failed')) {
        throw e
      }
    }

    if (!uploadUrl) {
      throw new Error(`Failed to obtain a valid presigned upload URL for ${file.name}`)
    }

    // Multipart upload path (B2 files > 50 MB)
    if (uploadUrl === '__multipart__' && multipartData) {
      const result = await uploadMultipart({
        file,
        uploadId: multipartData.uploadId,
        partUrls: multipartData.partUrls,
        partSize: multipartData.partSize,
        storagePath,
        cookie,
        providerPrefix,
        uploadedBytes,
        totalSize,
        onProgress
      })
      uploadedBytes += result.uploadedBytes
      uploadedPaths.push(result.path)
    } else {
      // Single-part upload path
      const result = await uploadSinglePart({
        file,
        uploadUrl,
        storagePath,
        providerPrefix,
        uploadedBytes,
        totalSize,
        onProgress
      })
      uploadedBytes += result.uploadedBytes
      uploadedPaths.push(result.path)
    }
  }

  // 2. Call /api/upload/finalize with metadata only (no files — tiny payload)
  const body = JSON.stringify({
    bookId,
    title: item.title,
    author: mediaType !== 'podcast' ? item.author || '' : '',
    series: mediaType !== 'podcast' ? item.series || '' : '',
    library: libraryId,
    mediaType: mediaType || 'book',
    uploadedPaths,
    files: item.itemFiles.map((f, i) => ({
      name: f.name,
      size: f.size,
      type: f.type || f.mime_type || getMimeType(f.name) || 'audio/mp4',
      storagePath: uploadedPaths[i]
    })),
    overwrite: item.overwrite
  })

  const baseUrl = '/api/upload/finalize'
  const finalizeHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${cookie}`
  }
  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    finalizeHeaders['apikey'] = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  }

  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: finalizeHeaders,
    body
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({
      error: `HTTP ${response.status}`
    }))
    const detail = err.detail ? ` — ${err.detail}` : ''
    throw new Error((err.error || `Upload failed with status ${response.status}`) + detail)
  }

  if (onProgress) {
    onProgress({ percent: 100, loaded: totalSize, total: totalSize })
  }
}
