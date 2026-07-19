import { createClient } from '@/shared/utils/supabase/server'
import 'server-only'

export interface MediaProgressRow {
  id: string
  library_item_id: string
  duration: number | null
  progress: number | null
  is_finished: boolean | null
  finished_at: string | null
  last_update: string | null
  started_at: string | null
  title: string | null
}

export interface PlaybackSessionRow {
  id: string
  display_title: string | null
  display_author: string | null
  time_listening: number | null
  session_date: string | null
  updated_at: string
}

export interface UserStatsData {
  mediaProgress: MediaProgressRow[]
  recentSessions: PlaybackSessionRow[]
}

/**
 * Fetch all data needed for the user stats page server-side.
 * Uses RLS — only returns rows belonging to the authenticated user.
 */
export async function getUserStatsData(): Promise<UserStatsData> {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return { mediaProgress: [], recentSessions: [] }
  }

  // Fetch media progress joined with library_items for title
  const { data: progressData } = await supabase
    .from('media_progress')
    .select(
      `
      id,
      library_item_id,
      duration,
      progress,
      is_finished,
      finished_at,
      last_update,
      started_at,
      library_items ( title )
    `
    )
    .eq('user_id', user.id)
    .order('last_update', { ascending: false })

  // Fetch recent playback sessions
  const { data: sessionsData } = await supabase
    .from('playback_sessions')
    .select('id, display_title, display_author, time_listening, session_date, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(10)

  const mediaProgress: MediaProgressRow[] = (progressData ?? []).map((row) => ({
    id: row.id,
    library_item_id: row.library_item_id,
    duration: row.duration ?? null,
    progress: row.progress ?? null,
    is_finished: row.is_finished ?? null,
    finished_at: row.finished_at ?? null,
    last_update: row.last_update ?? null,
    started_at: row.started_at ?? null,
    title: (row.library_items as { title: string | null } | null)?.title ?? null
  }))

  const recentSessions: PlaybackSessionRow[] = (sessionsData ?? []).map((row) => ({
    id: row.id,
    display_title: row.display_title ?? null,
    display_author: row.display_author ?? null,
    time_listening: row.time_listening ?? null,
    session_date: row.session_date ?? null,
    updated_at: row.updated_at
  }))

  return { mediaProgress, recentSessions }
}
