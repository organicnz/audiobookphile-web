import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_ROUTES = [
  '/home', '/explore', '/create', '/circles', '/communities',
  '/progress', '/settings', '/studio', '/creator', '/live',
  '/content', '/monetization', '/admin',
]

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — must run before any auth checks
  const { data: { user } } = await supabase.auth.getUser()
  const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  const currentLevel = aalData?.currentLevel
  const nextLevel = aalData?.nextLevel

  const { pathname } = request.nextUrl
  const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r))

  // Unauthenticated on protected route → login
  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // Authenticated but MFA required → MFA page
  if (isProtected && user && nextLevel === 'aal2' && currentLevel !== 'aal2') {
    const url = request.nextUrl.clone()
    url.pathname = '/login/mfa'
    return NextResponse.redirect(url)
  }

  // Admin route — check is_admin flag from DB
  if (pathname.startsWith('/admin') && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      const url = request.nextUrl.clone()
      url.pathname = '/home'
      return NextResponse.redirect(url)
    }
  }

  // Authenticated on login → home or ?next=
  if (user && pathname === '/login') {
    if (nextLevel === 'aal2' && currentLevel !== 'aal2') {
      const url = request.nextUrl.clone()
      url.pathname = '/login/mfa'
      return NextResponse.redirect(url)
    }
    const next = request.nextUrl.searchParams.get('next') ?? '/home'
    const url = request.nextUrl.clone()
    url.pathname = next
    url.search = ''
    return NextResponse.redirect(url)
  }

  // MFA page — redirect away if MFA already satisfied or not needed
  if (user && pathname === '/login/mfa') {
    if (nextLevel !== 'aal2' || currentLevel === 'aal2') {
      const url = request.nextUrl.clone()
      url.pathname = '/home'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
