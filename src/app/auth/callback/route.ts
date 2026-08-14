import { NextResponse } from 'next/server'
import { createClient } from '@/shared/utils/supabase/server'
import type { EmailOtpType } from '@supabase/supabase-js'

const APP_DEEP_LINK_SCHEME = 'audiobookphile://'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)

  // Email links issued by GoTrue carry `token_hash` (+ type) for both the
  // PKCE and implicit flows. Some flows (browser-initiated PKCE) may also
  // arrive as `code`, which requires the code verifier stored in the
  // browser that initiated the OTP. Server-side clients that don't opt into
  // PKCE (e.g. the iOS app's magic-link flow through the edge API) are
  // redirected with `access_token` + `refresh_token` directly in the query.
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = (searchParams.get('type') ?? 'magiclink') as EmailOtpType
  const accessToken = searchParams.get('access_token')
  const refreshToken = searchParams.get('refresh_token')

  // If the iOS app requested the magic link (client=ios), complete the
  // exchange here and bounce the session to the app via its custom URL
  // scheme instead of a browser redirect.
  const client = searchParams.get('client')
  const server = searchParams.get('server')

  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get('next') ?? (type === 'recovery' ? '/reset-password' : '/')

  // Security check: Ensure 'next' is a relative URL to prevent Open Redirect attacks
  if (!next.startsWith('/')) {
    next = '/'
  }

  if (code || tokenHash || (accessToken && refreshToken)) {
    const supabase = await createClient()

    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error && data.session) {
        if (client === 'ios') {
          return bounceToApp(data.session.access_token, data.session.refresh_token, data.session.user.id, server)
        }
        const destination = next === '/' ? '/library' : next
        return NextResponse.redirect(`${origin}${destination}`)
      }
    } else if (tokenHash) {
      const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      if (!error && data.session) {
        if (client === 'ios') {
          return bounceToApp(data.session.access_token, data.session.refresh_token, data.session.user.id, server)
        }
        const destination = type === 'recovery' ? '/reset-password' : next === '/' ? '/library' : next
        return NextResponse.redirect(`${origin}${destination}`)
      }
    } else if (accessToken && refreshToken) {
      // Implicit flow: GoTrue redirects with the session tokens in the URL.
      const { data, error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      if (!error && data.session) {
        if (client === 'ios') {
          return bounceToApp(data.session.access_token, data.session.refresh_token, data.session.user.id, server)
        }
        const destination = type === 'recovery' ? '/reset-password' : next === '/' ? '/library' : next
        return NextResponse.redirect(`${origin}${destination}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}

function bounceToApp(accessToken: string, refreshToken: string | null, userId: string, server?: string | null) {
  const url = new URL('auth/callback', APP_DEEP_LINK_SCHEME)
  url.searchParams.set('accessToken', accessToken)
  url.searchParams.set('refreshToken', refreshToken ?? '')
  url.searchParams.set('userId', userId)
  if (server) {
    url.searchParams.set('server', server)
  }
  return NextResponse.redirect(url.toString())
}
