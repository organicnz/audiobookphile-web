'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function verifyMfa(prevState: unknown, formData: FormData) {
  const factorId = formData.get('factorId') as string
  const code = (formData.get('code') as string)?.trim()

  if (!factorId || !code) {
    return { error: 'Missing required fields' }
  }

  // Validate code format — must be 6 digits
  if (!/^\d{6}$/.test(code)) {
    return { error: 'Code must be exactly 6 digits' }
  }

  const supabase = await createClient()

  // Verify session exists before attempting MFA
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/login?message=Session expired. Please sign in again.')
  }

  // Use native Supabase MFA — no edge function roundtrip needed
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code })

  if (error) {
    return { error: error.message ?? 'Invalid code. Please try again.' }
  }

  revalidatePath('/', 'layout')
  redirect('/home')
}
