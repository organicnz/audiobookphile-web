import { apiError } from '@/utils/apiResponse'
/**
 * GET  /api/admin/storage-sync                         — Returns sync report
 * POST /api/admin/storage-sync?action=import-orphans    — Creates DB records for orphaned storage files
 * POST /api/admin/storage-sync?action=mark-missing      — Marks library items whose storage files are missing
 * POST /api/admin/storage-sync?action=cleanup-orphans   — Deletes orphaned storage files (no DB record)
 *
 * All endpoints are admin-only (requires user_type = 'admin' or 'root').
 */

import { createServiceRoleClient } from '@/utils/supabase/service-role'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import {
  buildSyncReport,
  handleImportOrphans,
  handleMarkMissing,
  handleCleanupOrphans,
} from '@/lib/storageSyncActions'

// ---------------------------------------------------------------------------
// Auth helper — verify admin/root
// ---------------------------------------------------------------------------

async function requireAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return { error: 'Unauthorized', status: 401 }
  }

  const anonClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const {
    data: { user },
    error: userError,
  } = await anonClient.auth.getUser(token)

  if (userError || !user) {
    return { error: 'Unauthorized', status: 401 }
  }

  const db = createServiceRoleClient()
  const { data: profile } = await db.from('profiles').select('user_type').eq('id', user.id).single()

  if (!profile || !['admin', 'root'].includes(profile.user_type ?? '')) {
    return { error: 'Forbidden — admin or root required', status: 403 }
  }

  return { user, db }
}

// ---------------------------------------------------------------------------
// GET — return sync report
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const report = await buildSyncReport(auth.db)
    return NextResponse.json(report)
  } catch (error: any) {
    console.error('[storage-sync] GET error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// POST — perform a sync action
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { db } = auth
  const action = request.nextUrl.searchParams.get('action')

  if (!action) {
    return apiError('Missing ?action= parameter. Valid: import-orphans, mark-missing, cleanup-orphans', 'API_ERROR', 400)
  }

  try {
    let result
    switch (action) {
      case 'import-orphans':
        result = await handleImportOrphans(db)
        break
      case 'mark-missing':
        result = await handleMarkMissing(db)
        break
      case 'cleanup-orphans':
        result = await handleCleanupOrphans(db)
        break
      default:
        return apiError(`Unknown action: ${action}. Valid: import-orphans, mark-missing, cleanup-orphans`, 'API_ERROR', 400)
    }

    const { status, ...body } = result
    return NextResponse.json(body, { status: status || 200 })
  } catch (error: any) {
    console.error(`[storage-sync] POST ${action} error:`, error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
