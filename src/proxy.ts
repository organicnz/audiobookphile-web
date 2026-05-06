import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import Logger from './lib/Logger'
import { Database } from '@/types/supabase'

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
          cookiesToSet.forEach(({ name, value }) => {
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

  // Refresh Supabase session — wrapped in try-catch so the page always loads
  try {
    await supabase.auth.getUser()
  } catch (error) {
    Logger.debug('[proxy] Supabase getUser failed, continuing without session')
  }

  // Set default theme cookie if missing
  const themeCookie = request.cookies.get('theme')?.value
  if (!themeCookie) {
    supabaseResponse.cookies.set('theme', 'dark', {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 365 * 24 * 60 * 60 // 1 year
    })
  }

  // Pass the current path to server components via header
  supabaseResponse.headers.set('x-current-path', path)

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!api|internal-api|_next/static|_next/image|.*\\.png|.*\\.ico|.*\\.svg|.*\\.json).*)']
}
