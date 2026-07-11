'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function enrollMfa(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return { error: 'Not authenticated', qrCode: null, secret: null, factorId: null }

  try {
    const { data: responseData, error } = await supabase.functions.invoke('mfa', {
      body: { action: 'enroll' }
    })

    if (error) {
      return { error: error.message || 'Failed to enroll', qrCode: null, secret: null, factorId: null }
    }
    if (responseData?.error) {
      return { error: responseData.error || 'Failed to enroll', qrCode: null, secret: null, factorId: null }
    }

    return {
      qrCode: responseData.data.totp.qr_code,
      secret: responseData.data.totp.secret,
      factorId: responseData.data.id,
      error: null
    }
  } catch (err: any) {
    return { error: err.message, qrCode: null, secret: null, factorId: null }
  }
}

export async function verifyAndEnableMfa(prevState: any, formData: FormData) {
  const factorId = formData.get('factorId') as string
  const code = formData.get('code') as string

  if (!factorId || !code) {
    return { error: 'Missing code or factor ID', success: false }
  }

  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return { error: 'Not authenticated', success: false }

  try {
    const { data, error } = await supabase.functions.invoke('mfa', {
      body: { action: 'challengeAndVerify', factorId, code }
    })

    if (error) {
      return { error: error.message || 'Invalid code', success: false }
    }
    if (data?.error) {
      return { error: data.error || 'Invalid code', success: false }
    }

    // Force Next.js to update the browser's cookies with the new aal2 session
    await supabase.auth.refreshSession()

    revalidatePath('/settings/security')
    return { success: true, error: null }
  } catch (err: any) {
    return { error: err.message, success: false }
  }
}

export async function unenrollMfa(prevState: any, formData: FormData) {
  const factorId = formData.get('factorId') as string

  if (!factorId) {
    return { error: 'Missing factor ID', success: false }
  }

  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return { error: 'Not authenticated', success: false }

  try {
    const { data, error } = await supabase.functions.invoke('mfa', {
      body: { action: 'unenroll', factorId }
    })

    if (error) {
      return { error: error.message || 'Failed to unenroll', success: false }
    }
    if (data?.error) {
      return { error: data.error || 'Failed to unenroll', success: false }
    }

    revalidatePath('/settings/security')
    return { success: true, error: null }
  } catch (err: any) {
    return { error: err.message, success: false }
  }
}

