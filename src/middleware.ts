import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/shared/utils/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

const PUBLIC_ROUTES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/share',
  '/ping',
  '/sentry-test',
  '/auth', // auth endpoints
  '/api', // client-api and webhooks
  '/internal-api', // internal apis have their own auth logic
  '/callback', // oauth callbacks
]

export async function middleware(request: NextRequest) {
  // Update session and headers (e.g. x-current-path)
  const response = await updateSession(request)

  const { pathname } = request.nextUrl

  // Allow static files, Next.js internal paths, and public routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico' ||
    PUBLIC_ROUTES.some((route) => pathname.startsWith(route)) ||
    pathname === '/' // assuming index is either landing page or handles its own redirect
  ) {
    return response
  }

  // Check auth for protected routes
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {} // Next.js middleware doesn't allow setting cookies directly in this context without a response object, but we already updated session above
      }
    }
  )

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    // If no user, redirect to login with redirect param
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return response
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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
