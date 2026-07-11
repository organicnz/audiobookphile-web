'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function authAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const mode = formData.get('mode') as string
  const userType = formData.get('userType') as string

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: mode, 
        email, 
        ...(password && { password }),
        ...(userType && { userType })
      })
    })

    if (!res.ok) {
      const errorData = await res.json()
      return { error: errorData.error || 'Authentication failed', success: null }
    }

    const data = await res.json()

    if (mode === 'login' || mode === 'signup') {
      if (data.session) {
        const supabase = await createClient()
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        })
        
        const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
        if (aalData?.nextLevel === 'aal2') {
          redirect('/login/mfa')
        }
      }
      
      revalidatePath('/', 'layout')
      redirect('/home')
    } else if (mode === 'magic_link') {
      return { success: 'Magic link sent! Check your email.', error: null }
    } else if (mode === 'forgot_password') {
      return { success: 'Password reset instructions sent to your email.', error: null }
    }

    return { error: null, success: null }
  } catch (err: any) {
    if (err.message === 'NEXT_REDIRECT') {
      throw err // Let Next.js handle redirects
    }
    return { error: err.message || 'An error occurred', success: null }
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
