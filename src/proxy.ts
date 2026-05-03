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
          // Synchronize cookies across the request and the response
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
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
  const { data: { user }, error } = await supabase.auth.getUser()

  const accessTokenCookie = request.cookies.get('access_token')?.value
  const refreshTokenCookie = request.cookies.get('refresh_token')?.value
  const languageCookie = request.cookies.get('language')?.value
  const themeCookie = request.cookies.get('theme')?.value

  // Validate JWT tokens - treat expired tokens as non-existent
  const hasValidAccessToken = !!(accessTokenCookie && !isTokenExpired(accessTokenCookie, 5))
  const hasValidRefreshToken = !!(refreshTokenCookie && !isTokenExpired(refreshTokenCookie, 5))

  Logger.debug('[proxy] handling request for:', path)

  // Helper to create URLs for redirects using the existing request URL context
  const getRedirectUrl = (newPath: string) => {
    const url = request.nextUrl.clone()
    url.pathname = newPath
    
    // Force HTTPS when behind Cloudflare to avoid protocol-mismatch loops
    if (!url.host.includes('localhost') && !url.host.includes('127.0.0.1')) {
      url.protocol = 'https:'
    }
    
    return url
  }

  // Fetch server language if cookie doesn't exist
  let serverLanguage: string | null = null
  if (!languageCookie) {
    try {
      const statusPromise = getServerStatus()
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000))
      const statusResponse = await Promise.race([statusPromise, timeoutPromise])
      if (statusResponse && 'language' in statusResponse && statusResponse.language) {
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

  const finalize = (response: NextResponse): NextResponse => {
    // Transfer cookies from supabaseResponse to the final response if it's not the same object
    if (response !== supabaseResponse) {
      supabaseResponse.cookies.getAll().forEach(cookie => {
        response.cookies.set(cookie.name, cookie.value, cookie)
      })
    }
    return applySettings(response)
  }

  function redirect(url: string | URL, source: string): NextResponse {
    const targetUrl = typeof url === 'string' ? new URL(url, request.url) : url
    
    // Prevent redirecting to the exact same path to avoid infinite loops
    if (targetUrl.pathname === request.nextUrl.pathname && targetUrl.search === request.nextUrl.search) {
      Logger.debug(`[proxy] skipping self-referential redirect to: ${targetUrl.pathname}${targetUrl.search} (source: ${source})`)
      return finalize(supabaseResponse)
    }

    Logger.debug(`[proxy] redirecting to: ${targetUrl.href} (reason: ${source})`)
    const response = NextResponse.redirect(targetUrl)
    response.headers.set('x-proxy-redirect-reason', source)
    response.headers.set('Cache-Control', 'no-store, max-age=0')

    // Copy cookies from the current supabaseResponse to the redirect response
    if (supabaseResponse) {
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
    if (hasValidAccessToken) {
      return redirect(getRedirectUrl('/library'), 'login-to-library')
    }
    return finalize(supabaseResponse)
  }

  // Non-login routes
  if (!user && !hasValidAccessToken && !hasValidRefreshToken) {
    Logger.debug(`[proxy] no valid session found; redirecting to login`)
    return redirect(getRedirectUrl('/login'), 'no-session-redirect')
  }

  // Handle legacy token refresh if needed (fallback)
  if (!user && !hasValidAccessToken && hasValidRefreshToken) {
    if (isNextServerActionRequest(request)) {
      Logger.debug('[proxy] server action with expired access token; continuing so apiRequest can refresh')
      supabaseResponse.headers.set('x-current-path', path)
      return finalize(supabaseResponse)
    }

    const refreshUrl = getRedirectUrl('/internal-api/refresh')
    if (pathname !== '/') {
      refreshUrl.searchParams.set('redirect', path)
    }
    return redirect(refreshUrl, 'fallback-refresh')
  }

  if (pathname === '/') {
    return redirect(getRedirectUrl('/library'), 'root-to-library')
  }

  supabaseResponse.headers.set('x-current-path', path)
  return finalize(supabaseResponse)
}

export const config = {
  matcher: ['/((?!api|internal-api|_next/static|_next/image|.*\\.png|.*\\.ico|.*\\.svg|.*\\.json).*)']
}
