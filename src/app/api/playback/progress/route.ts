import { apiError } from '@/utils/apiResponse'
import { UnauthorizedError, updateMediaProgress } from '@/lib/supabase-api'
import { NextRequest, NextResponse } from 'next/server'

/**
 * PATCH /api/playback/progress
 *
 * Upserts the current user's media progress for a library item or podcast
 * episode. The `progress` ratio (0.0–1.0) is computed automatically from
 * `currentTime / duration` when `duration` is provided.
 *
 * Request body:
 *   {
 *     itemId:      string   — UUID of the library item (required)
 *     episodeId?:  string   — UUID of the podcast episode (optional)
 *     currentTime: number   — playback position in seconds (required)
 *     duration?:   number   — total duration in seconds (optional)
 *     isFinished?: boolean  — whether playback has completed (optional)
 *   }
 *
 * Responses:
 *   200 { success: true }  — progress saved successfully
 *   400 { error: string }  — missing or invalid request body fields
 *   401 { error: string }  — unauthenticated request
 *   500 { error: string }  — unexpected server error
 *
 * Requirements: 9.4, 9.9
 */
export async function PATCH(request: NextRequest) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 'API_ERROR', 400)
  }

  const { itemId, episodeId, currentTime, duration, isFinished } = body as {
    itemId?: string
    episodeId?: string
    currentTime?: number
    duration?: number
    isFinished?: boolean
  }

  if (!itemId || typeof itemId !== 'string') {
    return apiError('itemId is required', 'API_ERROR', 400)
  }

  if (typeof currentTime !== 'number') {
    return apiError('currentTime must be a number', 'API_ERROR', 400)
  }

  try {
    await updateMediaProgress(itemId, {
      currentTime,
      duration,
      isFinished,
      episodeId,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return apiError('Unauthorized', 'API_ERROR', 401)
    }

    console.error('[PATCH /api/playback/progress]', err)
    return apiError('Internal server error', 'API_ERROR', 500)
  }
}
