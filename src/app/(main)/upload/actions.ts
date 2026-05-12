'use server'

import type { BookSearchResult, PodcastSearchResult } from '@/types/api'

export async function fetchBookMetadata(_title: string, _author: string, _provider: string): Promise<BookSearchResult[]> {
  console.warn('[upload/actions] fetchBookMetadata is not available in the Supabase-backed version')
  return []
}

export async function fetchPodcastMetadata(_title: string): Promise<PodcastSearchResult[]> {
  console.warn('[upload/actions] fetchPodcastMetadata is not available in the Supabase-backed version')
  return []
}

export async function getCookie(): Promise<string> {
  // Returns the Supabase session access token for authenticating upload requests
  const { createClient } = await import('@/utils/supabase/server')
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ?? ''
}
