'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function verifyMfa(prevState: any, formData: FormData) {
  const factorId = formData.get('factorId') as string
  const code = formData.get('code') as string

  if (!factorId || !code) {
    return { error: 'Missing required fields' }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return { error: 'Not authenticated' }
  }

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/mfa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ action: 'challengeAndVerify', factorId, code })
    })

    if (!res.ok) {
      const errorData = await res.json()
      return { error: errorData.error || 'Invalid code. Please try again.' }
    }

    // Force Next.js to update the browser's cookies with the new aal2 session
    await supabase.auth.refreshSession()
  } catch (err: any) {
    return { error: err.message || 'An error occurred during verification' }
  }

  revalidatePath('/', 'layout')
  redirect('/home')
}
