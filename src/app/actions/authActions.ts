'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Resolves the canonical site URL at request time.
 *
 * Priority:
 *  1. NEXT_PUBLIC_SITE_URL  – explicitly set in Vercel env vars (production)
 *  2. NEXT_PUBLIC_VERCEL_URL – automatically injected by Vercel for every deployment
 *  3. localhost:3000         – local dev fallback
 *
 * NEXT_PUBLIC_ vars are inlined at build time, so we read them inside the
 * function to pick up the value that was present when the build ran.
 */
function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) return explicit

  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL
  if (vercelUrl) return `https://${vercelUrl}`

  return 'http://localhost:3000'
}

export async function signInWithGoogle() {
  const siteUrl = getSiteUrl()
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/auth/callback?next=/library`,
    },
  })

  if (error) {
    console.error('Google sign in error:', error.message)
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function signUp(email: string, password: string) {
  const siteUrl = getSiteUrl()
  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback?next=/library`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function forgotPassword(email: string) {
  const siteUrl = getSiteUrl()
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function resetPassword(password: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
