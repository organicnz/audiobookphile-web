import { createClient } from './server'

export interface SupabaseProgressPayload {
  library_item_id: string
  episode_id?: string | null
  duration?: number
  progress?: number
  current_time_pos: number
  is_finished?: boolean
}

/**
 * Syncs media progress to the Supabase database.
 * This is intended to be called from Server Actions or Route Handlers.
 */
export async function syncProgressToSupabase(payload: SupabaseProgressPayload) {
  const supabase = await createClient()
  
  // Get the current authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    console.error('[Supabase] No authenticated user found for progress sync')
    return
  }

  const { error } = await supabase
    .from('media_progress')
    .upsert({
      user_id: user.id,
      library_item_id: payload.library_item_id,
      episode_id: payload.episode_id || null,
      current_time_pos: payload.current_time_pos,
      duration: payload.duration,
      progress: payload.progress,
      is_finished: payload.is_finished,
      last_update: new Date().toISOString()
    }, {
      onConflict: 'user_id,library_item_id,episode_id'
    })

  if (error) {
    console.error('[Supabase] Failed to upsert media progress:', error.message)
  }
}
