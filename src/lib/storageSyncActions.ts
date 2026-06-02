import { createServiceRoleClient } from '@/utils/supabase/service-role'
import {
  listSupabaseStorageObjects,
  listB2Objects,
  getDbStoragePaths,
  computeSyncDiff,
  inferLibraryId,
  importOrphanedGroup,
  type SyncReport,
} from '@/lib/storageSync'

// ---------------------------------------------------------------------------
// Shared: build the sync report
// ---------------------------------------------------------------------------

export async function buildSyncReport(db: ReturnType<typeof createServiceRoleClient>): Promise<SyncReport> {
  console.log('[storage-sync] Building sync report...')

  // 1. List storage objects from both backends
  const [supabaseAudio, b2Objects] = await Promise.all([
    listSupabaseStorageObjects(db, 'audio'),
    listB2Objects(),
  ])

  const allStorageObjects = [...supabaseAudio, ...b2Objects]
  console.log(
    `[storage-sync] Found ${supabaseAudio.length} Supabase objects, ${b2Objects.length} B2 objects`
  )

  // 2. Extract all storage paths from the DB
  const dbPaths = await getDbStoragePaths(db)
  console.log(`[storage-sync] Found ${dbPaths.size} storage paths in DB`)

  // 3. Compute diff
  const report = computeSyncDiff(allStorageObjects, dbPaths)
  console.log(
    `[storage-sync] Report: ${report.orphanedGroups.length} orphaned groups, ${report.missingFiles.length} missing`
  )

  return report
}

// ---------------------------------------------------------------------------
// Action: import-orphans
// ---------------------------------------------------------------------------

export async function handleImportOrphans(db: ReturnType<typeof createServiceRoleClient>) {
  const report = await buildSyncReport(db)

  if (report.orphanedGroups.length === 0) {
    return {
      message: 'No orphaned files found — storage and DB are in sync.',
      imported: 0,
      status: 200,
    }
  }

  const libraryId = await inferLibraryId(db)
  if (!libraryId) {
    return { error: 'No libraries exist. Create a library first.', status: 400 }
  }

  const results: { dirPath: string; libraryItemId?: string; error?: string }[] = []

  for (const group of report.orphanedGroups) {
    const result = await importOrphanedGroup(db, group, libraryId)
    if ('error' in result) {
      results.push({ dirPath: group.dirPath, error: result.error })
    } else {
      results.push({ dirPath: group.dirPath, libraryItemId: result.libraryItemId })
    }
  }

  const successCount = results.filter((r) => r.libraryItemId).length
  const errorCount = results.filter((r) => r.error).length

  return {
    message: `Imported ${successCount} orphaned groups. ${errorCount} errors.`,
    imported: successCount,
    errors: errorCount,
    details: results,
    status: 200,
  }
}

// ---------------------------------------------------------------------------
// Action: mark-missing
// ---------------------------------------------------------------------------

export async function handleMarkMissing(db: ReturnType<typeof createServiceRoleClient>) {
  const report = await buildSyncReport(db)

  if (report.missingFiles.length === 0) {
    return {
      message: 'No missing files found — all DB records have valid storage files.',
      marked: 0,
      status: 200,
    }
  }

  // Deduplicate by libraryItemId (one item may have multiple missing files)
  const missingItemIds = [...new Set(report.missingFiles.map((m) => m.libraryItemId))]

  const { error } = await db
    .from('library_items')
    .update({
      is_missing: true,
      last_storage_check: new Date().toISOString(),
    })
    .in('id', missingItemIds)

  if (error) {
    return { error: `Failed to update items: ${error.message}`, status: 500 }
  }

  // Also mark items that are NOT missing as not missing (reset)
  const { data: allItems } = await db.from('library_items').select('id').eq('is_missing', true)
  const shouldBeMissing = new Set(missingItemIds)
  const toReset = (allItems || []).filter((item) => !shouldBeMissing.has(item.id)).map((i) => i.id)

  if (toReset.length > 0) {
    await db
      .from('library_items')
      .update({
        is_missing: false,
        last_storage_check: new Date().toISOString(),
      })
      .in('id', toReset)
  }

  return {
    message: `Marked ${missingItemIds.length} items as missing. Reset ${toReset.length} previously-missing items.`,
    marked: missingItemIds.length,
    reset: toReset.length,
    missingItems: report.missingFiles,
    status: 200,
  }
}

// ---------------------------------------------------------------------------
// Action: cleanup-orphans
// ---------------------------------------------------------------------------

export async function handleCleanupOrphans(db: ReturnType<typeof createServiceRoleClient>) {
  const report = await buildSyncReport(db)

  if (report.orphanedGroups.length === 0) {
    return {
      message: 'No orphaned files found — storage and DB are in sync.',
      deleted: 0,
      status: 200,
    }
  }

  // Flat map the groups to individual files for deletion
  const orphanedFiles = report.orphanedGroups.flatMap(group => group.files)

  // Separate by source
  const supabaseOrphans = orphanedFiles.filter((f) => f.source === 'supabase')
  const b2Orphans = orphanedFiles.filter((f) => f.source === 'b2')

  let deletedCount = 0
  const errors: string[] = []

  // Delete from Supabase Storage
  if (supabaseOrphans.length > 0) {
    const paths = supabaseOrphans.map((o) => o.storagePath)
    // Supabase Storage .remove() accepts up to 100 paths at a time
    for (let i = 0; i < paths.length; i += 100) {
      const batch = paths.slice(i, i + 100)
      const { error } = await db.storage.from('audio').remove(batch)
      if (error) {
        errors.push(`Supabase batch ${i}: ${error.message}`)
      } else {
        deletedCount += batch.length
      }
    }
  }

  // Delete from B2 (using S3 DeleteObject)
  if (b2Orphans.length > 0 && process.env.B2_ENDPOINT) {
    const { S3Client, DeleteObjectCommand } = await import('@aws-sdk/client-s3')
    const s3Client = new S3Client({
      endpoint: process.env.B2_ENDPOINT,
      region: process.env.B2_REGION || 'us-west-004',
      credentials: {
        accessKeyId: process.env.B2_KEY_ID!,
        secretAccessKey: process.env.B2_APP_KEY!,
      },
    })

    for (const orphan of b2Orphans) {
      try {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: process.env.B2_BUCKET_NAME!,
            Key: orphan.storagePath,
          })
        )
        deletedCount++
      } catch (err: any) {
        errors.push(`B2 ${orphan.storagePath}: ${err.message}`)
      }
    }
  }

  return {
    message: `Deleted ${deletedCount} orphaned files. ${errors.length} errors.`,
    deleted: deletedCount,
    errors: errors.length > 0 ? errors : undefined,
    status: 200,
  }
}
