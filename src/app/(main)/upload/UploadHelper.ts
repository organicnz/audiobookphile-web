import { sanitizeFileName, SupportedFileTypes } from '@/lib/fileUtils'
import type { Library } from '@/types/api'
import path from 'path'
import { ItemToUpload } from './useUploader'

export interface FileWithMetadata extends File {
  filetype?: string | false
  filepath?: string
  mime_type?: string
}

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'm4b':
    case 'm4a': return 'audio/mp4'
    case 'mp3': return 'audio/mpeg'
    case 'flac': return 'audio/flac'
    case 'ogg':
    case 'oga': return 'audio/ogg'
    case 'opus': return 'audio/opus'
    case 'wav': return 'audio/wav'
    case 'webm':
    case 'webma': return 'audio/webm'
    case 'aac': return 'audio/aac'
    case 'mkv':
    case 'mka': return 'audio/x-matroska'
    default: return 'application/octet-stream'
  }
}

interface UploadItemData {
  itemFiles: FileWithMetadata[]
  otherFiles: FileWithMetadata[]
  ignoredFiles: FileWithMetadata[]
}

export interface CleanedItem extends UploadItemData {
  index: number
  title: string
  author?: string
  series?: string
}

export interface ProcessedItems {
  items: CleanedItem[]
  ignoredFiles: FileWithMetadata[]
  error?: string
}

export interface UploadProgressInfo {
  percent: number
  loaded: number
  total: number
}

/**
 * Check file type based on extension
 */
function checkFileType(filename: string): string | false {
  if (filename.startsWith('.')) return false

  let ext = path.extname(filename)
  if (!ext) return false
  if (ext.startsWith('.')) ext = ext.slice(1)
  ext = ext.toLowerCase()

  for (const filetype in SupportedFileTypes) {
    if (SupportedFileTypes[filetype as keyof typeof SupportedFileTypes].includes(ext)) {
      return filetype
    }
  }
  return false
}

/**
 * Clean book data - extract title, author, series from file path
 */
function cleanBook(book: UploadItemData, index: number): CleanedItem {
  const audiobook: CleanedItem = {
    index,
    title: '',
    author: '',
    series: '',
    ...book
  }

  const firstBookFile = book.itemFiles[0]
  if (!firstBookFile?.filepath) {
    return audiobook
  }

  const firstBookPath = path.dirname(firstBookFile.filepath)
  const dirs = firstBookPath.split('/').filter((d) => !!d && d !== '.')

  if (dirs.length) {
    audiobook.title = dirs.pop() || ''
    if (dirs.length > 1) {
      audiobook.series = dirs.pop()
    }
    if (dirs.length) {
      audiobook.author = dirs.pop()
    }
  } else {
    audiobook.title = path.basename(firstBookFile.name, path.extname(firstBookFile.name))
  }

  return audiobook
}

/**
 * Clean podcast data - extract title from file path
 */
function cleanPodcast(item: UploadItemData, index: number): CleanedItem {
  const podcast: CleanedItem = {
    index,
    title: '',
    ...item
  }

  const firstAudioFile = item.itemFiles[0]
  if (!firstAudioFile?.filepath) return podcast

  const firstPath = path.dirname(firstAudioFile.filepath)
  const dirs = firstPath.split('/').filter((d) => !!d && d !== '.')

  if (dirs.length) {
    podcast.title = dirs.length > 1 ? dirs[1] : dirs[0]
  } else {
    podcast.title = path.basename(firstAudioFile.name, path.extname(firstAudioFile.name))
  }

  return podcast
}

/**
 * Clean item based on media type
 */
function cleanItem(item: UploadItemData, mediaType: string, index: number): CleanedItem {
  if (mediaType === 'podcast') return cleanPodcast(item, index)
  return cleanBook(item, index)
}

/**
 * Process items from FileList (file picker)
 */
export function getItemsFromFilelist(filelist: FileList, mediaType: Library['mediaType']): ProcessedItems {
  const ignoredFiles: FileWithMetadata[] = []
  const otherFiles: FileWithMetadata[] = []
  interface ItemMapEntry extends UploadItemData {
    path: string
  }
  const itemMap: Record<string, ItemMapEntry> = {}

  Array.from(filelist).forEach((file) => {
    const fileWithMeta = file as FileWithMetadata
    const filetype = checkFileType(file.name)

    if (!filetype) {
      ignoredFiles.push(fileWithMeta)
    } else {
      fileWithMeta.filetype = filetype
      fileWithMeta.filepath = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name
      fileWithMeta.mime_type = getMimeType(file.name)

      if (filetype === 'audio' || (filetype === 'ebook' && mediaType === 'book')) {
        let dir = fileWithMeta.filepath ? path.dirname(fileWithMeta.filepath) : ''
        if (dir === '.') dir = ''

        if (!itemMap[dir]) {
          itemMap[dir] = { path: dir, ignoredFiles: [], itemFiles: [], otherFiles: [] }
        }
        itemMap[dir].itemFiles.push(fileWithMeta)
      } else {
        otherFiles.push(fileWithMeta)
      }
    }
  })

  otherFiles.forEach((file) => {
    const dir = path.dirname(file.filepath || '')
    const findItem = Object.values(itemMap).find((b) => dir.startsWith(b.path))
    if (findItem) {
      findItem.otherFiles.push(file)
    } else {
      ignoredFiles.push(file)
    }
  })

  let items: CleanedItem[] = []
  let index = 1

  if (itemMap[''] && !otherFiles.length && mediaType === 'book' && !itemMap[''].itemFiles.some((f) => f.filetype !== 'audio')) {
    items = itemMap[''].itemFiles.map((audioFile) => {
      return cleanItem({ itemFiles: [audioFile], otherFiles: [], ignoredFiles: [] }, mediaType, index++)
    })
  } else {
    items = Object.values(itemMap).map((i) => cleanItem(i, mediaType, index++))
  }

  return { items, ignoredFiles }
}

/**
 *
 * Uploads files directly to Supabase Storage from the browser (bypasses
 * the Next.js API route body limit), then calls /api/upload with just the
 * metadata to create the DB records.
 *
 * @param item
 * @param libraryId
 * @param folderId
 * @param mediaType
 * @param cookie  - Supabase session access_token for /api/upload auth
 * @param onProgress
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

  // Use the direct storage hostname to bypass the Kong API gateway size limits
  // Ref: https://supabase.com/docs/guides/storage/uploads/resumable-uploads
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const projectId = new URL(supabaseUrl).hostname.split('.')[0]
  const tusEndpoint = `https://${projectId}.storage.supabase.co/storage/v1/upload/resumable`

  // 1. Upload each file via TUS resumable protocol (required for files > 6MB)
  const uploadedPaths: string[] = []

  for (const file of item.itemFiles) {
    const storagePath = `${bookId}/${sanitizeFileName(file.name)}`

    // Attempt to get a presigned URL for B2 or Supabase (based on size)
    let uploadUrl = ''
    let providerPrefix = ''
    try {
      const presignUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/upload-presign` : '/api/upload/presign'
      const presignRes = await fetch(presignUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cookie}`,
        },
        body: JSON.stringify({
          filename: storagePath,
          contentType: file.type || file.mime_type || 'application/octet-stream',
          size: file.size,
        }),
      })

      if (presignRes.status === 200) {
        const data = await presignRes.json()
        uploadUrl = data.url
        providerPrefix = data.provider_prefix || ''
      } else if (presignRes.status !== 501) {
        throw new Error(`Presign failed: ${presignRes.status}`)
      }
    } catch (e) {
      console.warn('Failed to get presigned URL:', e)
    }

    await new Promise<void>((resolve, reject) => {
      // Choose upload method
      // We rely on our Edge Function presign endpoint which returns a presigned URL.
      // Standard XHR PUT supports upserts perfectly and works fine for our max 25MB Supabase threshold
      // as well as unlimited B2 uploads.
      
      const xhr = new XMLHttpRequest()
      xhr.open('PUT', uploadUrl, true)

      // Explicitly set Content-Type for the audio file (must match presign)
      const contentType = file.type || file.mime_type || 'application/octet-stream'
      xhr.setRequestHeader('Content-Type', contentType)
      
      // Supabase requires x-upsert to overwrite files, but B2 (S3) strictly rejects unsigned headers
      if (providerPrefix !== 'b2://') {
        xhr.setRequestHeader('x-upsert', 'true')
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const chunkLoaded = uploadedBytes + event.loaded
          onProgress({
            percent: Math.round((chunkLoaded / totalSize) * 100),
            loaded: chunkLoaded,
            total: totalSize,
          })
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          uploadedBytes += file.size
          uploadedPaths.push(providerPrefix + storagePath)
          resolve()
        } else {
          reject(new Error(`Failed to upload ${file.name}: HTTP ${xhr.status} ${xhr.responseText}`))
        }
      }

      xhr.onerror = () => reject(new Error(`Network error uploading ${file.name}`))
      xhr.ontimeout = () => reject(new Error(`Upload timed out for ${file.name}`))

      // Generous timeout for large files
      xhr.timeout = 3600000
      xhr.send(file)
    })
  }

  // 2. Call /api/upload with metadata only (no files — tiny payload)
  const body = JSON.stringify({
    bookId,
    title: item.title,
    author: mediaType !== 'podcast' ? (item.author || '') : '',
    series: mediaType !== 'podcast' ? (item.series || '') : '',
    library: libraryId,
    mediaType: mediaType || 'book',
    uploadedPaths,
    files: item.itemFiles.map((f, i) => ({
      name: f.name,
      size: f.size,
      type: f.type,
      storagePath: uploadedPaths[i],
    })),
  })

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/upload-finalize` : '/api/upload'
  
  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cookie}`,
    },
    body,
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
    throw new Error(err.error || `Upload failed with status ${response.status}`)
  }

  if (onProgress) {
    onProgress({ percent: 100, loaded: totalSize, total: totalSize })
  }
}

/**
 * Stream a backup archive to server /api/backups/upload
 * Uses the same strategy as file upload to support large files
 */
export async function uploadBackupArchive(file: File, accessToken: string, onProgress?: (progress: UploadProgressInfo) => void): Promise<void> {
  const form = new FormData()
  form.set('file', file)

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/backups/upload', true)
    xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`)

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress({
          percent: Math.round((event.loaded / event.total) * 100),
          loaded: event.loaded,
          total: event.total
        })
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        if (onProgress && file.size > 0) {
          onProgress({
            percent: 100,
            loaded: file.size,
            total: file.size
          })
        }
        resolve()
      } else {
        const msg = xhr.responseText?.trim() || `Upload failed with status ${xhr.status}`
        reject(new Error(msg))
      }
    }

    xhr.onerror = () => {
      reject(new Error('Upload failed due to network error'))
    }

    xhr.send(form)
  })
}
