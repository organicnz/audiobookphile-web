/**
 * Supabase service-role client.
 *
 * This client is initialised with `SUPABASE_SERVICE_ROLE_KEY` which bypasses
 * Row Level Security entirely. It MUST only be used in server-side code
 * (Route Handlers, Server Actions, API module functions). Never import this
 * file from client components or expose the key to the browser.
 */

import type { Database } from '@/types/supabase'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Returns a Supabase client that uses the service role key.
 * Bypasses RLS — use only for admin operations (uploads, user management, etc.).
 */
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
  }
  if (!serviceRoleKey) {
    throw new Error('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY')
  }

  return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      // Disable automatic session persistence — this is a server-only client.
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
