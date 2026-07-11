import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const {
    data: aalData,
  } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

  const currentLevel = aalData?.currentLevel
  const nextLevel = aalData?.nextLevel

  // Define protected routes that require authentication
  const isProtectedRoute = 
    request.nextUrl.pathname.startsWith('/home') ||
    request.nextUrl.pathname.startsWith('/explore') ||
    request.nextUrl.pathname.startsWith('/create') ||
    request.nextUrl.pathname.startsWith('/circles') ||
    request.nextUrl.pathname.startsWith('/progress') ||
    request.nextUrl.pathname.startsWith('/settings')

  if (isProtectedRoute) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    if (nextLevel === 'aal2' && currentLevel !== 'aal2') {
      const url = request.nextUrl.clone()
      url.pathname = '/login/mfa'
      return NextResponse.redirect(url)
    }
  }

  // Redirect logged-in users away from auth pages
  if (user) {
    if (request.nextUrl.pathname === '/login') {
      // If they need MFA, send to MFA page, else to home
      const url = request.nextUrl.clone()
      if (nextLevel === 'aal2' && currentLevel !== 'aal2') {
        url.pathname = '/login/mfa'
      } else {
        url.pathname = '/home'
      }
      return NextResponse.redirect(url)
    }

    if (request.nextUrl.pathname === '/login/mfa') {
      // If they don't need MFA (or already did it), redirect to home
      if (nextLevel !== 'aal2' || currentLevel === 'aal2') {
        const url = request.nextUrl.clone()
        url.pathname = '/home'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
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
