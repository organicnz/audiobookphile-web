/**
 * Storage Sync Utilities
 *
 * Provides functions to detect and reconcile discrepancies between
 * Supabase/S3 Storage and the database (library_items, books, audio_files).
 *
 * Two categories of discrepancy:
 *   1. Orphaned storage files — files in a bucket with no matching DB record
 *   2. Missing storage files — DB records that reference non-existent files
 */

import { S3Client, ListObjectsV2Command, HeadObjectCommand } from '@aws-sdk/client-s3'
import type { SupabaseClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StorageObject {
  /** Full path/key within the bucket */
  key: string
  /** Size in bytes */
  size: number
  /** Last modified timestamp */
  lastModified: Date | null
  /** Which storage backend this object lives in */
  source: 'supabase' | 'b2'
}

export interface OrphanedGroup {
  /** The parent directory path, or the file path if it's at root */
  dirPath: string
  /** Inferred book title from the directory name */
  inferredTitle: string
  /** The files belonging to this group */
  files: {
    storagePath: string
    source: 'supabase' | 'b2'
    size: number
  }[]
}

export interface MissingFileItem {
  /** library_items.id */
  libraryItemId: string
  /** library_items.title */
  title: string
  /** The storage path that's referenced but missing */
  missingPath: string
  /** Which source was expected */
  source: 'supabase' | 'b2'
}

export interface SyncReport {
  /** Grouped orphaned files */
  orphanedGroups: OrphanedGroup[]
  /** DB records pointing to non-existent storage files */
  missingFiles: MissingFileItem[]
  /** Total files in storage */
  totalStorageFiles: number
  /** Total storage paths referenced in DB */
  totalDbPaths: number
  /** Timestamp of this report */
  generatedAt: string
}

// ---------------------------------------------------------------------------
// Supabase Storage listing
// ---------------------------------------------------------------------------

/**
 * Lists all objects in a Supabase Storage bucket.
 *
 * Supabase Storage uses a flat namespace with `/` as a virtual separator.
 * The `list` API returns files at a given path; we recursively walk
 * directories to get every object. Pagination is strictly respected.
 */
export async function listSupabaseStorageObjects(
  supabase: SupabaseClient,
  bucket: string,
  prefix = ''
): Promise<StorageObject[]> {
  const results: StorageObject[] = []

  let offset = 0
  let hasMore = true
  const limit = 1000

  while (hasMore) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, {
      limit,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    })

    if (error) {
      console.error(`[storageSync] Error listing ${bucket}/${prefix}:`, error.message)
      return results
    }

    if (!data || data.length === 0) {
      hasMore = false
      break
    }

    for (const item of data) {
      if (item.name === '.emptyFolderPlaceholder') continue

      const fullPath = prefix ? `${prefix}/${item.name}` : item.name

      if (item.id === null) {
        // It's a folder — recurse
        const nested = await listSupabaseStorageObjects(supabase, bucket, fullPath)
        results.push(...nested)
      } else {
        // It's a file
        results.push({
          key: fullPath,
          size: item.metadata?.size ?? 0,
          lastModified: item.updated_at ? new Date(item.updated_at) : null,
          source: 'supabase',
        })
      }
    }

    if (data.length < limit) {
      hasMore = false
    } else {
      offset += limit
    }
  }

  return results
}

// ---------------------------------------------------------------------------
// Backblaze B2 / S3 listing
// ---------------------------------------------------------------------------

/**
 * Lists all objects in Backblaze B2 using the S3-compatible API.
 * Returns an empty array if B2 is not configured.
 */
export async function listB2Objects(): Promise<StorageObject[]> {
  if (!process.env.B2_ENDPOINT || !process.env.B2_BUCKET_NAME) {
    return []
  }

  const s3Client = new S3Client({
    endpoint: process.env.B2_ENDPOINT,
    region: process.env.B2_REGION || 'us-west-004',
    credentials: {
      accessKeyId: process.env.B2_KEY_ID!,
      secretAccessKey: process.env.B2_APP_KEY!,
    },
  })

  const results: StorageObject[] = []
  let continuationToken: string | undefined

  do {
    const command = new ListObjectsV2Command({
      Bucket: process.env.B2_BUCKET_NAME,
      MaxKeys: 1000,
      ContinuationToken: continuationToken,
    })

    const response = await s3Client.send(command)

    for (const obj of response.Contents ?? []) {
      if (obj.Key) {
        results.push({
          key: obj.Key,
          size: obj.Size ?? 0,
          lastModified: obj.LastModified ?? null,
          source: 'b2',
        })
      }
    }

    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined
  } while (continuationToken)

  return results
}

/**
 * Checks if a specific object exists in B2.
 */
export async function checkB2ObjectExists(key: string): Promise<boolean> {
  if (!process.env.B2_ENDPOINT || !process.env.B2_BUCKET_NAME) {
    return false
  }

  const s3Client = new S3Client({
    endpoint: process.env.B2_ENDPOINT,
    region: process.env.B2_REGION || 'us-west-004',
    credentials: {
      accessKeyId: process.env.B2_KEY_ID!,
      secretAccessKey: process.env.B2_APP_KEY!,
    },
  })

  try {
    await s3Client.send(
      new HeadObjectCommand({
        Bucket: process.env.B2_BUCKET_NAME,
        Key: key,
      })
    )
    return true
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// DB path extraction
// ---------------------------------------------------------------------------

/**
 * Extracts all storage paths referenced in the database.
 * Uses pagination to retrieve all records and avoids non-existent tables.
 * Returns a map of storagePath → { libraryItemId, title }.
 */
export async function getDbStoragePaths(
  supabase: SupabaseClient
): Promise<Map<string, { libraryItemId: string; title: string }>> {
  const pathMap = new Map<string, { libraryItemId: string; title: string }>()

  let from = 0
  let hasMore = true
  const limit = 1000

  while (hasMore) {
    const { data: items, error } = await supabase
      .from('library_items')
      .select(`
        id,
        title,
        books!inner (
          id,
          title,
          audio_files
        )
      `)
      .range(from, from + limit - 1)

    if (error) {
      console.error('[storageSync] Error fetching db paths:', error.message)
      break
    }

    if (!items || items.length === 0) {
      hasMore = false
      break
    }

    for (const item of items) {
      const bookData = Array.isArray(item.books) ? item.books[0] : item.books
      if (!bookData) continue

      const audioFilesList = Array.isArray(bookData.audio_files) ? bookData.audio_files : []

      for (const af of audioFilesList) {
        const path = af.metadata?.path || af.storage_path || af.path
        if (path) {
          pathMap.set(path, {
            libraryItemId: item.id,
            title: item.title || bookData.title || 'Unknown',
          })
        }
      }
    }

    if (items.length < limit) {
      hasMore = false
    } else {
      from += limit
    }
  }

  return pathMap
}

// ---------------------------------------------------------------------------
// Sync diff computation
// ---------------------------------------------------------------------------

/**
 * Computes the diff between storage and DB.
 *
 * - `orphanedGroups`: files in storage with no matching DB path reference, grouped by directory
 * - `missingFiles`: DB records referencing paths that don't exist in storage
 */
export function computeSyncDiff(
  storageObjects: StorageObject[],
  dbPaths: Map<string, { libraryItemId: string; title: string }>
): SyncReport {
  const storageKeys = new Set(storageObjects.map((obj) => obj.key))
  
  const orphanGroupsMap = new Map<string, OrphanedGroup>()

  for (const obj of storageObjects) {
    if (!dbPaths.has(obj.key)) {
      // Group by directory
      const parts = obj.key.split('/')
      let dirPath = ''
      let inferredTitle = ''

      if (parts.length > 1) {
        parts.pop() // remove filename
        dirPath = parts.join('/')
        inferredTitle = parts[parts.length - 1] // last directory name
      } else {
        dirPath = obj.key
        inferredTitle = obj.key.replace(/\.[^.]+$/, '')
      }

      if (!orphanGroupsMap.has(dirPath)) {
        orphanGroupsMap.set(dirPath, {
          dirPath,
          inferredTitle,
          files: []
        })
      }

      orphanGroupsMap.get(dirPath)!.files.push({
        storagePath: obj.key,
        source: obj.source,
        size: obj.size
      })
    }
  }

  const orphanedGroups = Array.from(orphanGroupsMap.values())

  // Missing: in DB but not in storage
  const missingFiles: MissingFileItem[] = []
  for (const [path, info] of dbPaths) {
    if (!storageKeys.has(path)) {
      missingFiles.push({
        libraryItemId: info.libraryItemId,
        title: info.title,
        missingPath: path,
        source: process.env.B2_ENDPOINT ? 'b2' : 'supabase',
      })
    }
  }

  return {
    orphanedGroups,
    missingFiles,
    totalStorageFiles: storageObjects.length,
    totalDbPaths: dbPaths.size,
    generatedAt: new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Import helpers
// ---------------------------------------------------------------------------

/**
 * Infers a library ID for an orphaned group.
 */
export async function inferLibraryId(supabase: SupabaseClient): Promise<string | null> {
  const { data: libraries } = await supabase
    .from('libraries')
    .select('id, media_type')
    .order('display_order')

  if (!libraries || libraries.length === 0) return null
  if (libraries.length === 1) return libraries[0].id

  const bookLib = libraries.find((l) => l.media_type === 'book')
  return bookLib?.id || libraries[0].id
}

/**
 * Creates DB records for an orphaned storage group.
 * Grouping files avoids creating multiple books for the same audiobook.
 */
export async function importOrphanedGroup(
  supabase: SupabaseClient,
  group: OrphanedGroup,
  libraryId: string
): Promise<{ libraryItemId: string } | { error: string }> {
  const libraryItemId = crypto.randomUUID()
  const title = group.inferredTitle || 'Untitled Import'
  
  const totalSize = group.files.reduce((acc, f) => acc + f.size, 0)

  // Build audio_files JSONB
  const audioFilesJson = group.files.map((file, index) => {
    const filename = file.storagePath.split('/').pop() || 'unknown'
    return {
      index,
      ino: crypto.randomUUID(),
      metadata: {
        filename,
        ext: '.' + (filename.split('.').pop()?.toLowerCase() ?? ''),
        path: file.storagePath,
        relPath: file.storagePath.replace(group.dirPath + '/', ''),
        size: file.size,
        mtimeMs: Date.now(),
        ctimeMs: Date.now(),
        birthtimeMs: Date.now(),
      },
      addedAt: Date.now(),
      updatedAt: Date.now(),
      duration: null,
      mimeType: guessMimeType(filename),
    }
  })

  const bookId = crypto.randomUUID()
  const { error: bookError } = await supabase
    .from('books')
    .insert({ id: bookId, title, audio_files: audioFilesJson })

  if (bookError) {
    return { error: `Failed to create book: ${bookError.message}` }
  }

  const { error: itemError } = await supabase.from('library_items').insert({
    id: libraryItemId,
    library_id: libraryId,
    media_type: 'book',
    media_id: bookId,
    title,
    size: totalSize,
    path: group.dirPath,
    rel_path: group.dirPath.split('/').pop() || '',
    is_missing: false,
    last_storage_check: new Date().toISOString(),
    library_files: audioFilesJson.map((af) => ({
      ino: af.ino,
      metadata: af.metadata,
      addedAt: af.addedAt,
      updatedAt: af.updatedAt,
      isSupplementary: false,
    })),
  })

  if (itemError) {
    await supabase.from('books').delete().eq('id', bookId)
    return { error: `Failed to create library item: ${itemError.message}` }
  }

  return { libraryItemId }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function guessMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const mimeMap: Record<string, string> = {
    mp3: 'audio/mpeg',
    m4a: 'audio/mp4',
    m4b: 'audio/mp4',
    ogg: 'audio/ogg',
    opus: 'audio/opus',
    flac: 'audio/flac',
    wav: 'audio/wav',
    aac: 'audio/aac',
    wma: 'audio/x-ms-wma',
    mp4: 'audio/mp4',
  }
  return mimeMap[ext || ''] || 'audio/mpeg'
}
