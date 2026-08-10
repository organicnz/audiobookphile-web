import { ApiError, NetworkError, UnauthorizedError } from '../apiErrors'
import { getServerBaseUrl, parseApiResponseBody } from './base'

/**
 * Browser-only authenticated API request.
 * Never import src/shared/utils/supabase/server from this module: it pulls
 * next/headers into the client bundle and breaks Turbopack builds.
 */
export async function apiRequest<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const baseUrl = getServerBaseUrl()
    const url = `${baseUrl}${endpoint}`

    const fetchHeaders = new Headers(options.headers as Record<string, string>)

    if (!(options.body instanceof FormData) && !fetchHeaders.has('Content-Type')) {
      fetchHeaders.set('Content-Type', 'application/json')
    }

    if (!fetchHeaders.has('apikey') && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      fetchHeaders.set('apikey', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    }

    const { createClient } = await import('@/shared/utils/supabase/client')
    const supabase = await createClient()

    const { data: sessionData } = await supabase.auth.getSession()
    let accessToken = sessionData.session?.access_token ?? null

    if (!accessToken) {
      const { data: userData } = await supabase.auth.getUser()
      if (userData.user) {
        const { data: refreshedSession } = await supabase.auth.getSession()
        accessToken = refreshedSession.session?.access_token ?? null
      }
    }

    if (!accessToken) {
      throw new UnauthorizedError('No authentication token found')
    }

    fetchHeaders.set('Authorization', `Bearer ${accessToken}`)

    const response = await fetch(url, {
      ...options,
      headers: fetchHeaders
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new UnauthorizedError('Unauthorized')
      }

      const errorMessage = await response.text()
      throw new ApiError(errorMessage || `HTTP ${response.status}: ${response.statusText}`, response.status, response.statusText)
    }

    return parseApiResponseBody<T>(response)
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ApiError) {
      throw error
    }
    console.error('API request failed:', error)
    throw new NetworkError('Network error', error)
  }
}
