'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function enrollMfa(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp'
  })

  if (error) {
    return { error: error.message }
  }

  return { factorId: data.id, qrCode: data.totp.qr_code, enrolling: true }
}

export async function verifyEnrollment(prevState: any, formData: FormData) {
  const factorId = formData.get('factorId') as string
  const code = formData.get('code') as string

  if (!factorId || !code) {
    return { error: 'Missing required fields' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.mfa.challengeAndVerify({
    factorId,
    code
  })

  if (error) {
    return { error: 'Invalid code. Please try again.' }
  }

  revalidatePath('/settings/security')
  return { success: true }
}

export async function unenrollMfa(prevState: any, formData: FormData) {
  const factorId = formData.get('factorId') as string
  
  if (!factorId) {
    return { error: 'No factor ID provided' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.mfa.unenroll({
    factorId
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/settings/security')
  return { success: true }
}
