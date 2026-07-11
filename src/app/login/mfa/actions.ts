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

  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return { error: 'Not authenticated' }
  }

  try {
    const { data, error } = await supabase.functions.invoke('mfa', {
      body: { action: 'challengeAndVerify', factorId, code }
    })

    if (error) {
      return { error: error.message || 'Invalid code. Please try again.' }
    }
    if (data?.error) {
      return { error: data.error || 'Invalid code. Please try again.' }
    }

    // Force Next.js to update the browser's cookies with the new aal2 session
    await supabase.auth.refreshSession()
  } catch (err: any) {
    return { error: err.message || 'An error occurred during verification' }
  }

  revalidatePath('/', 'layout')
  redirect('/home')
}
