import { updateSession } from '@/shared/utils/supabase/middleware'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Next.js 16 Proxy (formerly Middleware)
 *
 * As of Next.js 16, the `middleware.ts` convention has been renamed to `proxy.ts`.
 * This function handles Supabase session updates and token refreshing for all
 * matched routes, ensuring authentication state is persisted across requests.
 *
 * For the root path `/`, it additionally checks auth state and redirects to
 * `/library` (authenticated) or `/login` (unauthenticated or error).
 *
 * @see https://nextjs.org/docs/messages/middleware-to-proxy
 */
export async function proxy(request: NextRequest) {
  console.log(`[Proxy] Handling request: ${request.nextUrl.pathname}`)

  // Handle Preflight OPTIONS requests globally for cross-platform apps
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': '*', // Note: For production with credentials, a specific origin might be required, but '*' is fine without credentials or handled by next.config.ts
        'Access-Control-Allow-Methods': 'GET,DELETE,PATCH,POST,PUT,OPTIONS',
        'Access-Control-Allow-Headers':
          'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
      }
    })
  }

  // If Supabase env vars are missing, skip session update and redirect root to /login
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if (request.nextUrl.pathname === '/') {
      return NextResponse.redirect(new URL('/login', request.nextUrl.origin))
    }
    return NextResponse.next()
  }

  // Intercept Audiobookphile mobile app login requests
  if (request.nextUrl.pathname === '/login' && request.method === 'POST') {
    return NextResponse.rewrite(new URL('/api/login', request.url))
  }

  const response = await updateSession(request)

  if (request.nextUrl.pathname !== '/') {
    return response
  }

  // Root path: determine auth state and redirect accordingly
  try {
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {
          // Read-only in this context — session writes handled by updateSession above
        }
      }
    })
    const {
      data: { user }
    } = await supabase.auth.getUser()
    const dest = user ? '/library' : '/login'
    return NextResponse.redirect(new URL(dest, request.nextUrl.origin))
  } catch {
    return NextResponse.redirect(new URL('/login', request.nextUrl.origin))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
}
