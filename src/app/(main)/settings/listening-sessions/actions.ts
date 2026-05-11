'use server'

import { requireUser } from '@/lib/supabase-api'
import type { GetListeningSessionsResponse, GetOpenListeningSessionsResponse } from '@/types/api'
import { revalidatePath } from 'next/cache'

export interface ListeningSessionsQueryParams {
  page: number
  itemsPerPage: number
  sort: string
  desc: boolean
  user?: string
}

export async function getListeningSessionsData(params: ListeningSessionsQueryParams) {
  const { supabase, user } = await requireUser()

  const userId = params.user || user.id
  const ascending = !params.desc
  const from = params.page * params.itemsPerPage
  const to = from + params.itemsPerPage - 1

  const { data, count, error } = await supabase
    .from('media_progress')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order(params.sort === 'updatedAt' ? 'last_update' : params.sort, { ascending })
    .range(from, to)

  if (error) throw new Error(error.message)

  const total = count ?? 0
  const numPages = Math.ceil(total / params.itemsPerPage)

  return {
    sessions: (data || []) as unknown as GetListeningSessionsResponse['sessions'],
    total,
    numPages,
    page: params.page,
    itemsPerPage: params.itemsPerPage,
    userId: params.user || '',
  } as GetListeningSessionsResponse
}

export async function getOpenListeningSessionsData(): Promise<GetOpenListeningSessionsResponse> {
  // No concept of open sessions in Supabase-backed version
  return { sessions: [], shareSessions: [] } as unknown as GetOpenListeningSessionsResponse
}

export async function batchDeleteListeningSessions(sessionIds: string[]): Promise<void> {
  const { supabase } = await requireUser()
  const { error } = await supabase.from('media_progress').delete().in('id', sessionIds)
  if (error) throw new Error(error.message)
  revalidatePath('/settings/listening-sessions')
}

export async function deleteListeningSession(sessionId: string): Promise<void> {
  const { supabase } = await requireUser()
  const { error } = await supabase.from('media_progress').delete().eq('id', sessionId)
  if (error) throw new Error(error.message)
  revalidatePath('/settings/listening-sessions')
}

export async function closeListeningSession(_sessionId: string): Promise<void> {
  // No open sessions concept in Supabase-backed version
  console.warn('[listening-sessions] closeListeningSession is a no-op in the Supabase-backed version')
}
