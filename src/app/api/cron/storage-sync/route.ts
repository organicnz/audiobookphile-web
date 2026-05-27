import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/utils/supabase/service-role'
import { handleImportOrphans, handleMarkMissing } from '@/lib/storageSyncActions'

/**
 * GET /api/cron/storage-sync
 * 
 * Vercel Cron Job endpoint to automatically synchronize storage with the database.
 * This endpoint:
 * 1. Imports any newly added orphaned storage files into the database.
 * 2. Marks any DB records whose storage files are missing.
 * 
 * It requires `Authorization: Bearer <CRON_SECRET>` to prevent public access.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error('[cron/storage-sync] Unauthorized access attempt')
    return new Response('Unauthorized', { status: 401 })
  }

  console.log('[cron/storage-sync] Starting automatic storage synchronization...')

  try {
    const db = createServiceRoleClient()
    
    // 1. Import orphans
    console.log('[cron/storage-sync] Step 1: Importing orphans...')
    const importResult = await handleImportOrphans(db)
    
    // 2. Mark missing
    console.log('[cron/storage-sync] Step 2: Marking missing files...')
    const missingResult = await handleMarkMissing(db)

    console.log('[cron/storage-sync] Synchronization complete')

    return NextResponse.json({
      success: true,
      importResult,
      missingResult
    })
  } catch (error: any) {
    console.error('[cron/storage-sync] Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
