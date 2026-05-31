import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'
import { cache } from 'react'
import { UserLoginResponse, ServerStatus } from '@/types/api'
import { ApiError, NetworkError, UnauthorizedError } from '../apiErrors'


export function getServerBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`

  let host = process.env.HOST || 'localhost'
  if (host === '0.0.0.0') {
    // Convert "all interfaces" address to localhost for internal API calls
    host = 'localhost'
  }
  return `http://${host}:${process.env.PORT || '3333'}`
}

/**
 * Client-facing origin from request headers (for redirects out of internal API routes).
 * The server may use an internal hostname; the browser must be sent to the URL it used.
 */
export function getClientBaseUrlFromRequest(request: Request): string {
  const headers = new Headers(request.headers)
  const host = headers.get('x-forwarded-host') || headers.get('host') || 'localhost'
  const protocol = headers.get('x-forwarded-proto') || (host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https')
  return `${protocol}://${host}`
}

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
 * Shared shape for `response.cookies` and `cookies()` from `next/headers` (both expose `.set`).
 * maxAgeSeconds is the env JWT lifetime; cookie maxAge is slightly shorter so the cookie expires
 * before the token is rejected (5 second buffer).
 */
function sessionCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: false,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: Math.max(maxAgeSeconds - 5, 5)
  }
}

function writeSessionCookies(store: SessionCookieSetter, accessToken: string, refreshToken: string | null) {
  store.set('access_token', accessToken, sessionCookieOptions(AccessTokenExpiry))
  if (refreshToken) {
    store.set('refresh_token', refreshToken, sessionCookieOptions(RefreshTokenExpiry))
  }
}

/**
 * The NextJS server sets its own cookies separate from the Audiobookshelf server
 * because the Abs Server cookies are not available to NextJS for server-side rendering.
 */
export function setTokenCookies(response: NextResponse, accessToken: string, refreshToken: string | null) {
  writeSessionCookies(response.cookies, accessToken, refreshToken)
}

/**
 * Exchange a refresh token for new session tokens (server-side).
 * Used by internal-api/refresh and download proxies that cannot rely on a redirect.
 */
export async function refreshSessionWithToken(refreshToken: string): Promise<SessionRefreshResult | null> {
  const baseUrl = getServerBaseUrl()
  const refreshResponse = await fetch(`${baseUrl}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-refresh-token': refreshToken
    }
  })

  if (!refreshResponse.ok) {
    return null
  }

  const data = (await refreshResponse.json()) as {
    userDefaultLibraryId?: string | null
    user?: { accessToken?: string; refreshToken?: string; type?: string }
  }

  const accessToken = data.user?.accessToken
  if (!accessToken) {
    return null
  }

  return {
    accessToken,
    refreshToken: data.user?.refreshToken ?? null,
    userDefaultLibraryId: data.userDefaultLibraryId ?? null,
    userType: data.user?.type ?? 'user'
  }
}

export async function getAccessToken() {
  return (await cookies()).get('access_token')?.value || null
}

async function redirectToSessionRefreshRoute() {
  const currentPath = (await headers()).get('x-current-path') ?? ''
  redirect(`/internal-api/refresh?redirect=${encodeURIComponent(currentPath || '')}`)
}

/**
 * Refresh via ABS, write Next.js cookies for this request (so server actions return Set-Cookie).
 * If cookies cannot be mutated (e.g. Server Component render), redirect to `/internal-api/refresh` like {@link getData}.
 */
async function applyRefreshedSessionOrRedirect(cookieStore: Awaited<ReturnType<typeof cookies>>, refreshToken: string): Promise<SessionRefreshTokens> {
  const session = await refreshSessionWithToken(refreshToken)
  if (!session) {
    throw new UnauthorizedError('Unauthorized')
  }
  try {
    writeSessionCookies(cookieStore, session.accessToken, session.refreshToken)
  } catch {
    await redirectToSessionRefreshRoute()
  }
  return {
    accessToken: session.accessToken,
    refreshToken: session.refreshToken
  }
}

async function parseApiResponseBody<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type')
  const contentLength = response.headers.get('content-length')

  if (response.status === 204 || contentLength === '0') {
    return undefined as T
  }

  if (contentType?.includes('application/json')) {
    const data = await response.json()
    return data as T
  }

  const text = await response.text()
  if (!text || text.trim() === '') {
    return undefined as T
  }

  try {
    const data = JSON.parse(text)
    return data as T
  } catch {
    return undefined as T
  }
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
    const cookieStore = await cookies()
    const baseUrl = getServerBaseUrl()
    const url = `${baseUrl}${endpoint}`

    const isFormData = options.body instanceof FormData

    const fetchHeaders = new Headers(options.headers as Record<string, string>)

    if (!isFormData && !fetchHeaders.has('Content-Type')) {
      fetchHeaders.set('Content-Type', 'application/json')
    }

    let accessToken: string | null = null
    let refreshToken: string | null = null
    let didProactiveRefresh = false

    if (!isPublic) {
      accessToken = cookieStore.get('access_token')?.value ?? null
      refreshToken = cookieStore.get('refresh_token')?.value ?? null

      if (!accessToken && refreshToken) {
        const session = await applyRefreshedSessionOrRedirect(cookieStore, refreshToken)
        accessToken = session.accessToken
        refreshToken = session.refreshToken ?? cookieStore.get('refresh_token')?.value ?? null
        didProactiveRefresh = true
      }

      // Fallback to Supabase session if no legacy token
      if (!accessToken) {
        const { createClient } = await import('@/utils/supabase/server')
        const supabase = await createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          accessToken = session.access_token
        }
      }

      if (!accessToken) {
        throw new UnauthorizedError('No authentication token found')
      }

      fetchHeaders.set('Authorization', `Bearer ${accessToken}`)
    }

    let response = await fetch(url, {
      ...options,
      headers: fetchHeaders
    })

    if (!isPublic && response.status === 401 && refreshToken && !didProactiveRefresh) {
      const session = await applyRefreshedSessionOrRedirect(cookieStore, refreshToken)
      fetchHeaders.set('Authorization', `Bearer ${session.accessToken}`)
      response = await fetch(url, {
        ...options,
        headers: fetchHeaders
      })
    }

    if (!response.ok) {
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
