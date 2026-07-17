import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request
  })

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))

        // Manually sync cookie header for downstream Server Actions
        request.headers.set(
          'cookie',
          request.cookies
            .getAll()
            .map((c) => `${c.name}=${c.value}`)
            .join('; ')
        )

        supabaseResponse = NextResponse.next({
          request
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      }
    }
  })

  // refreshing the auth token
  await supabase.auth.getUser()

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
  const { pathname, search } = request.nextUrl
  supabaseResponse.headers.set('x-current-path', pathname + search)

  return supabaseResponse
}
