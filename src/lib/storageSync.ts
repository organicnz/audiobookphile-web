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

export interface SyncReportItem {
  /** Storage path of the file */
  storagePath: string
  /** Source of the file */
  source: 'supabase' | 'b2'
  /** Size in bytes */
  size: number
  /** Inferred title from path (e.g. filename without extension) */
  inferredTitle?: string
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
  /** Files in storage with no DB record */
  orphanedFiles: SyncReportItem[]
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
 * directories to get every object.
 */
export async function listSupabaseStorageObjects(
  supabase: SupabaseClient,
  bucket: string,
  prefix = ''
): Promise<StorageObject[]> {
  const results: StorageObject[] = []

  const { data, error } = await supabase.storage.from(bucket).list(prefix, {
    limit: 1000,
    offset: 0,
    sortBy: { column: 'name', order: 'asc' },
  })

  if (error) {
    console.error(`[storageSync] Error listing ${bucket}/${prefix}:`, error.message)
    return results
  }

  if (!data) return results

  for (const item of data) {
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
 *
 * Checks two sources:
 *   1. `audio_files.storage_path` — normalized audio file table
 *   2. `books.audio_files` JSONB — legacy/denormalized audio file data
 *      (paths stored as `metadata.path` or `storage_path` within each object)
 *
 * Returns a map of storagePath → { libraryItemId, title }.
 */
export async function getDbStoragePaths(
  supabase: SupabaseClient
): Promise<Map<string, { libraryItemId: string; title: string }>> {
  const pathMap = new Map<string, { libraryItemId: string; title: string }>()

  // 1. Check normalized audio_files table
  const { data: audioFiles, error: afError } = await supabase
    .from('audio_files')
    .select('storage_path, library_item_id')

  if (!afError && audioFiles) {
    // We need titles — batch-fetch the item titles
    const itemIds = [...new Set(audioFiles.map((af) => af.library_item_id))]
    const { data: items } = await supabase
      .from('library_items')
      .select('id, title')
      .in('id', itemIds)

    const titleMap = new Map((items || []).map((i) => [i.id, i.title]))

    for (const af of audioFiles) {
      if (af.storage_path) {
        pathMap.set(af.storage_path, {
          libraryItemId: af.library_item_id,
          title: titleMap.get(af.library_item_id) || 'Unknown',
        })
      }
    }
  }

  // 2. Check books.audio_files JSONB (legacy path format)
  const { data: books, error: booksError } = await supabase
    .from('books')
    .select('id, title, audio_files')
    .not('audio_files', 'is', null)

  if (!booksError && books) {
    // Find the library_item that references each book
    const bookIds = books.map((b) => b.id)
    const { data: linkedItems } = await supabase
      .from('library_items')
      .select('id, title, media_id')
      .in('media_id', bookIds)

    const bookToItem = new Map(
      (linkedItems || []).map((li) => [li.media_id, { id: li.id, title: li.title }])
    )

    for (const book of books) {
      const audioFilesList = Array.isArray(book.audio_files) ? book.audio_files : []
      const linkedItem = bookToItem.get(book.id)

      for (const af of audioFilesList) {
        const path = af.metadata?.path || af.storage_path || af.path
        if (path) {
          pathMap.set(path, {
            libraryItemId: linkedItem?.id || book.id,
            title: linkedItem?.title || book.title || 'Unknown',
          })
        }
      }
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
 * - `orphanedFiles`: files in storage with no matching DB path reference
 * - `missingFiles`: DB records referencing paths that don't exist in storage
 */
export function computeSyncDiff(
  storageObjects: StorageObject[],
  dbPaths: Map<string, { libraryItemId: string; title: string }>
): SyncReport {
  const storageKeys = new Set(storageObjects.map((obj) => obj.key))
  const storageMap = new Map(storageObjects.map((obj) => [obj.key, obj]))

  // Orphaned: in storage but not in DB
  const orphanedFiles: SyncReportItem[] = []
  for (const obj of storageObjects) {
    if (!dbPaths.has(obj.key)) {
      // Infer title from path: e.g. "uuid/My Book.mp3" → "My Book"
      const filename = obj.key.split('/').pop() || obj.key
      const inferredTitle = filename.replace(/\.[^.]+$/, '')

      orphanedFiles.push({
        storagePath: obj.key,
        source: obj.source,
        size: obj.size,
        inferredTitle,
      })
    }
  }

  // Missing: in DB but not in storage
  const missingFiles: MissingFileItem[] = []
  for (const [path, info] of dbPaths) {
    if (!storageKeys.has(path)) {
      missingFiles.push({
        libraryItemId: info.libraryItemId,
        title: info.title,
        missingPath: path,
        // Best guess — if B2 is configured and the path doesn't start with
        // a known Supabase bucket prefix, assume B2
        source: process.env.B2_ENDPOINT ? 'b2' : 'supabase',
      })
    }
  }

  return {
    orphanedFiles,
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
 * Infers a library ID for an orphaned file.
 *
 * If there is exactly one library, uses that. Otherwise returns the first
 * library with media_type = 'book'. Returns null if no libraries exist.
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
 * Creates DB records for an orphaned storage file.
 *
 * Creates a minimal `library_items` row pointing to the storage path.
 * The item is marked with `is_missing = false` (the file exists) but
 * with minimal metadata that can be enriched later.
 */
export async function importOrphanedFile(
  supabase: SupabaseClient,
  orphan: SyncReportItem,
  libraryId: string
): Promise<{ libraryItemId: string } | { error: string }> {
  const libraryItemId = crypto.randomUUID()
  const title = orphan.inferredTitle || 'Untitled Import'
  const filename = orphan.storagePath.split('/').pop() || 'unknown'

  // Build minimal audio_files JSONB
  const audioFilesJson = [
    {
      index: 0,
      ino: crypto.randomUUID(),
      metadata: {
        filename,
        ext: '.' + (filename.split('.').pop()?.toLowerCase() ?? ''),
        path: orphan.storagePath,
        relPath: filename,
        size: orphan.size,
        mtimeMs: Date.now(),
        ctimeMs: Date.now(),
        birthtimeMs: Date.now(),
      },
      addedAt: Date.now(),
      updatedAt: Date.now(),
      duration: null,
      mimeType: guessMimeType(filename),
    },
  ]

  // Insert into books table (legacy schema)
  const bookId = crypto.randomUUID()
  const { error: bookError } = await supabase
    .from('books')
    .insert({ id: bookId, title, audio_files: audioFilesJson })

  if (bookError) {
    return { error: `Failed to create book: ${bookError.message}` }
  }

  // Insert into library_items
  const { error: itemError } = await supabase.from('library_items').insert({
    id: libraryItemId,
    library_id: libraryId,
    media_type: 'book',
    media_id: bookId,
    title,
    size: orphan.size,
    path: orphan.storagePath,
    rel_path: filename,
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
    // Rollback book
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
