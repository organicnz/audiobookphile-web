'use server'

import type { BookSearchResult, PodcastSearchResult } from '@/types/api'
import { cookies } from 'next/headers'

export async function fetchBookMetadata(_title: string, _author: string, _provider: string): Promise<BookSearchResult[]> {
  console.warn('[upload/actions] fetchBookMetadata is not available in the Supabase-backed version')
  return []
}

export async function fetchPodcastMetadata(_title: string): Promise<PodcastSearchResult[]> {
  console.warn('[upload/actions] fetchPodcastMetadata is not available in the Supabase-backed version')
  return []
}

export async function getCookie(): Promise<string> {
  // Returns empty string — ABS access_token cookie is no longer used
  const cookieStore = await cookies()
  const auth = cookieStore.get('access_token')
  return auth?.value ?? ''
}
