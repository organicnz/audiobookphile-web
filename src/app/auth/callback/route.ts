import { NextResponse } from 'next/server'
import { createClient } from '@/shared/utils/supabase/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)

  // Email links issued by GoTrue carry `token_hash` (+ type) for both the
  // PKCE and implicit flows. Some flows (browser-initiated PKCE) may also
  // arrive as `code`, which requires the code verifier stored in the
  // browser that initiated the OTP.
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = (searchParams.get('type') ?? 'magiclink') as EmailOtpType

  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get('next') ?? (type === 'recovery' ? '/reset-password' : '/')

  // Security check: Ensure 'next' is a relative URL to prevent Open Redirect attacks
  if (!next.startsWith('/')) {
    next = '/'
  }

  if (code || tokenHash) {
    const supabase = await createClient()

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        const destination = next === '/' ? '/library' : next
        return NextResponse.redirect(`${origin}${destination}`)
      }
    } else if (tokenHash) {
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      if (!error) {
        const destination = type === 'recovery' ? '/reset-password' : next === '/' ? '/library' : next
        return NextResponse.redirect(`${origin}${destination}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
