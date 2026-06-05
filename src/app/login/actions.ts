'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', email, password })
    })

    if (!res.ok) {
      throw new Error('Authentication failed')
    }

    const { session } = await res.json()
    if (session) {
      const supabase = await createClient()
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token
      })
    }
  } catch (err) {
    redirect('/login?message=Could not authenticate user')
  }

  revalidatePath('/', 'layout')
  redirect('/home')
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'signup', email, password })
    })

    if (!res.ok) {
      throw new Error('Authentication failed')
    }

    const { session } = await res.json()
    if (session) {
      const supabase = await createClient()
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token
      })
    }
  } catch (err) {
    redirect('/login?message=Could not authenticate user')
  }

  revalidatePath('/', 'layout')
  redirect('/home')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
