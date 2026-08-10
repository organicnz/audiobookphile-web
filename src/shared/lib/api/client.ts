import { NextResponse } from 'next/server'
import { ApiError, NetworkError, UnauthorizedError } from '../apiErrors'
import { getServerBaseUrl, getClientBaseUrlFromRequest, parseApiResponseBody } from './base'

/**
 * Send the browser to /login with an error hint and drop refresh cookie (session cannot continue).
 */
export function redirectToLogin(request: Request, errorMessage: string): NextResponse {
  const login = new URL('/login', getClientBaseUrlFromRequest(request))
  login.searchParams.set('error', errorMessage)
  const response = NextResponse.redirect(login)
  response.cookies.delete('refresh_token')
  return response
}

/**
 * User "Home" page is the default library page, or settings/account page if no libraries are set yet
 */
export function getUserDefaultUrlPath(userDefaultLibraryId: string | null, userType: string) {
  const isAdmin = ['admin', 'root'].includes(userType)
  return userDefaultLibraryId ? `/library/${userDefaultLibraryId}` : isAdmin ? '/settings' : '/account'
}

/**
 * Make an authenticated API request to the server
 * Throws UnauthorizedError, ApiError, or NetworkError on failure
 *
 * On 401 (or missing access token with a refresh cookie), exchanges the refresh token for new
 * session tokens, updates Next.js cookies when possible, and retries once. Server actions return updated cookies to the browser.
 */
export async function apiRequest<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const isPublic = publicEndpoints.includes(endpoint)
    const baseUrl = getServerBaseUrl()
    const url = `${baseUrl}${endpoint}`

    const isFormData = options.body instanceof FormData

    const fetchHeaders = new Headers(options.headers as Record<string, string>)

    if (!isFormData && !fetchHeaders.has('Content-Type')) {
      fetchHeaders.set('Content-Type', 'application/json')
    }

    if (!fetchHeaders.has('apikey') && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      fetchHeaders.set('apikey', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    }

    let accessToken: string | null = null

    if (!isPublic) {
      const { createClient } = await import('@/shared/utils/supabase/server')
      const supabase = await createClient()

      // First try to get the active session locally
      const { data: sessionData } = await supabase.auth.getSession()

      if (sessionData.session) {
        accessToken = sessionData.session.access_token
      } else {
        // Fallback to getUser which forces a refresh if the token is expired
        const { data: userData } = await supabase.auth.getUser()
        if (userData.user) {
          const { data: refreshedSession } = await supabase.auth.getSession()
          if (refreshedSession.session) {
            accessToken = refreshedSession.session.access_token
          }
        }
      }

      if (!accessToken) {
        console.error(`[apiRequest] Throwing UnauthorizedError for ${endpoint} because accessToken could not be retrieved from Supabase`)
        throw new UnauthorizedError('No authentication token found')
      }

      fetchHeaders.set('Authorization', `Bearer ${accessToken}`)
    }

    let response = await fetch(url, {
      ...options,
      headers: fetchHeaders
    })

    if (!response.ok) {
      console.error(`[apiRequest] Failed for ${url}: status ${response.status}`)
      if (response.status === 401) {
        throw new UnauthorizedError('Unauthorized')
      }

      const errorMessage = await response.text()
      throw new ApiError(errorMessage || `HTTP ${response.status}: ${response.statusText}`, response.status, response.statusText)
    }

    return parseApiResponseBody<T>(response)
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error && typeof error.digest === 'string' && error.digest.includes('NEXT_REDIRECT')) {
      throw error
    }
    if (error instanceof UnauthorizedError || error instanceof ApiError) {
      throw error
    }
    console.error('API request failed:', error)
    throw new NetworkError('Network error', error)
  }
}

const publicEndpoints = ['/status']
const RefreshTokenExpiry = parseInt(process.env.REFRESH_TOKEN_EXPIRY || '') || 7 * 24 * 60 * 60 // 7 days
const AccessTokenExpiry = parseInt(process.env.ACCESS_TOKEN_EXPIRY || '') || 12 * 60 * 60 // 12 hours

export type SessionRefreshTokens = {
  accessToken: string
  refreshToken: string | null
}

export type SessionRefreshResult = SessionRefreshTokens & {
  userDefaultLibraryId: string | null
  userType: string
}

type SessionCookieSetter = {
  set(name: string, value: string, options: any): void
}
