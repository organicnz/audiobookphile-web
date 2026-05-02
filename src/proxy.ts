import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getServerStatus } from './lib/api'
import { isTokenExpired } from './lib/jwt'
import Logger from './lib/Logger'
import { Database } from '@/types/supabase'

/** Next.js App Router sends this on Server Action POSTs */
const NEXT_ACTION_HEADER = 'next-action'

function isNextServerActionRequest(request: NextRequest): boolean {
  return request.method === 'POST' && request.headers.has(NEXT_ACTION_HEADER)
}

export default async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const path = pathname + search

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh Supabase session
  console.log('[Proxy] refreshing session...')
  const { data: { user }, error } = await supabase.auth.getUser()
  console.log('[Proxy] getUser result:', { user: user?.id, error })

  const accessTokenCookie = request.cookies.get('access_token')?.value
  const refreshTokenCookie = request.cookies.get('refresh_token')?.value
  const languageCookie = request.cookies.get('language')?.value
  const themeCookie = request.cookies.get('theme')?.value

  // Validate JWT tokens - treat expired tokens as non-existent
  const hasValidAccessToken = !!(accessTokenCookie && !isTokenExpired(accessTokenCookie, 5))
  const hasValidRefreshToken = !!(refreshTokenCookie && !isTokenExpired(refreshTokenCookie, 5))

  Logger.debug('[proxy] handling request for:', path)

  // Helper to create URLs with correct host/port from request headers.
  const createUrl = (path: string) => {
    try {
      const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || request.nextUrl.host
      const protocol = request.headers.get('x-forwarded-proto') || (host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https')
      return new URL(path, `${protocol}://${host}`)
    } catch (error) {
      Logger.error('[proxy] failed to create URL:', { path, error })
      return new URL(path, request.nextUrl.origin)
    }
  }

  // Fetch server language if cookie doesn't exist
  let serverLanguage: string | null = null
  if (!languageCookie) {
    try {
      const statusResponse = await getServerStatus()
      if (statusResponse.language) {
        serverLanguage = statusResponse.language
      }
    } catch (error) {
      Logger.error('[proxy] failed to fetch server status for language:', error)
    }
  }

  // Set default theme if cookie doesn't exist
  const shouldSetDefaultTheme = !themeCookie

  // Helper function to set language and theme cookies on any response
  const applySettings = (response: NextResponse) => {
    if (serverLanguage) {
      response.cookies.set('language', serverLanguage, {
        httpOnly: false,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 365 * 24 * 60 * 60 // 1 year
      })
    }
    if (shouldSetDefaultTheme) {
      response.cookies.set('theme', 'dark', {
        httpOnly: false,
        secure: false,
        sameSite: 'lax',
        path: '/',
        maxAge: 365 * 24 * 60 * 60 // 1 year
      })
    }
    return response
  }

  const redirect = (url: URL): NextResponse => {
    Logger.debug(`[proxy] redirecting to: ${url}`)
    const response = NextResponse.redirect(url)
    // Transfer cookies from supabaseResponse to the redirect response
    supabaseResponse.cookies.getAll().forEach(cookie => {
      response.cookies.set(cookie.name, cookie.value, cookie)
    })
    return applySettings(response)
  }

  const finalize = (response: NextResponse): NextResponse => {
    Logger.debug(`[proxy] finalizing for: ${path}`)
    // Transfer cookies from supabaseResponse to the final response if it's not the same object
    if (response !== supabaseResponse) {
      supabaseResponse.cookies.getAll().forEach(cookie => {
        response.cookies.set(cookie.name, cookie.value, cookie)
      })
    }
    return applySettings(response)
  }

  const isShareRoute = pathname.startsWith('/share/')
  if (isShareRoute) {
    return finalize(supabaseResponse)
  }

  const isLoginRoute = pathname === '/login'
  if (isLoginRoute) {
    if (user || hasValidAccessToken) {
      Logger.debug('[proxy] request has valid session')
      return redirect(createUrl('/library'))
    }
    return finalize(supabaseResponse)
  }

  // Non-login routes
  if (!user && !hasValidAccessToken && !hasValidRefreshToken) {
    Logger.debug(`[proxy] no valid session found`)
    return redirect(createUrl('/login'))
  }

  // Handle legacy token refresh if needed (fallback)
  if (!user && !hasValidAccessToken && hasValidRefreshToken) {
    if (isNextServerActionRequest(request)) {
      Logger.debug('[proxy] server action with expired access token; continuing so apiRequest can refresh')
      supabaseResponse.headers.set('x-current-path', path)
      return finalize(supabaseResponse)
    }

    const refreshUrl = createUrl('/internal-api/refresh')
    if (pathname !== '/') {
      refreshUrl.searchParams.set('redirect', path)
    }
    return redirect(refreshUrl)
  }

  if (pathname === '/') {
    return redirect(createUrl('/library'))
  }

  supabaseResponse.headers.set('x-current-path', path)
  return finalize(supabaseResponse)
}

export const config = {
  matcher: ['/((?!api|internal-api|_next/static|_next/image|.*\\.png|.*\\.ico|.*\\.svg|.*\\.json).*)']
}
