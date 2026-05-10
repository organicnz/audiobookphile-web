'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'

export async function signInWithGoogle() {
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

  redirect('/library')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
