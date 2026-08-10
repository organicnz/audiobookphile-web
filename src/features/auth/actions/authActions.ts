'use server'

import { createClient } from '@/shared/utils/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Resolves the canonical site URL at request time.
 *
 * Priority:
 *  1. NEXT_PUBLIC_SITE_URL          – explicitly set in Vercel env vars
 *  2. VERCEL_PROJECT_PRODUCTION_URL – auto-injected by Vercel (primary domain, no protocol)
 *  3. NEXT_PUBLIC_VERCEL_URL        – auto-injected by Vercel (deployment URL, no protocol)
 *  4. localhost:3000                 – local dev fallback
 */
function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) return explicit

  // VERCEL_PROJECT_PRODUCTION_URL is the primary production domain (e.g. audiobookphile.vercel.app)
  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (productionUrl) return `https://${productionUrl}`

  // NEXT_PUBLIC_VERCEL_URL is the deployment-specific URL — less ideal but beats localhost
  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL
  if (vercelUrl) return `https://${vercelUrl}`

  return 'http://localhost:3000' // dev-only fallback
}

export async function signInWithGoogle() {
  const siteUrl = getSiteUrl()
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/auth/callback?next=/library`
    }
  })

  if (error) {
    console.error('Google sign in error:', error.message)
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }
}

/**
 * Sign up — DISABLED (invitation-only).
 * Public self-registration is not allowed. New users must be invited by an admin.
 */
export async function signUp(_email: string, _password: string) {
  return {
    error: 'Public registration is disabled. Please contact an administrator for an invitation.'
  }
}

export async function forgotPassword(email: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const res = await fetch(`${supabaseUrl}/functions/v1/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    return { error: errorData.error || 'Failed to send reset email.' }
  }

  return { success: true }
}

export async function resetPassword(password: string) {
  const supabase = await createClient()
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session?.access_token) {
    return {
      error: 'Your password reset session has expired or is invalid. Please request a new reset link.'
    }
  }

  // Update directly via authenticated SSR client
  const { error: ssrError } = await supabase.auth.updateUser({ password })
  if (ssrError) {
    return { error: ssrError.message }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const res = await fetch(`${supabaseUrl}/functions/v1/api/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`
    },
    body: JSON.stringify({ password, accessToken: session.access_token })
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    return { error: errorData.error || 'Failed to reset password.' }
  }

  return { success: true }
}

export async function signInWithMagicLink(email: string) {
  const siteUrl = getSiteUrl()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/api/auth/magic-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(anonKey ? { apikey: anonKey } : {})
      },
      body: JSON.stringify({
        email,
        redirectTo: `${siteUrl}/auth/callback?next=/library`
      })
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      return { error: errorData.error || 'Failed to send magic link.' }
    }

    return { success: true }
  } catch (err) {
    console.error('[signInWithMagicLink] Network error:', err)
    return {
      error: 'Unable to connect. Please check your connection and try again.'
    }
  }
}

export async function inviteUserByEmail(email: string, username?: string, userType?: string) {
  const supabase = await createClient()
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (!session?.access_token) {
    return { error: 'You must be logged in as an admin to invite users.' }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const res = await fetch(`${supabaseUrl}/functions/v1/api/auth/invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`
    },
    body: JSON.stringify({ email, username, userType: userType || 'user' })
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    return { error: errorData.error || 'Failed to invite user.' }
  }

  const data = await res.json()
  return { success: true, user: data.user }
}

export async function signOut() {
  const supabase = await createClient()
  const {
    data: { session }
  } = await supabase.auth.getSession()

  if (session?.access_token) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    await fetch(`${supabaseUrl}/functions/v1/api/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    }).catch(console.error)
  }

  await supabase.auth.signOut()
  redirect('/login')
}
