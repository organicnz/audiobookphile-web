'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function enrollMfa(prevState: any, formData: FormData) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return { error: 'Not authenticated', qrCode: null, secret: null, factorId: null }

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/mfa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ action: 'enroll' })
    })

    if (!res.ok) {
      const errorData = await res.json()
      return { error: errorData.error || 'Failed to enroll', qrCode: null, secret: null, factorId: null }
    }

    const { data } = await res.json()
    return {
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
      factorId: data.id,
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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return { error: 'Not authenticated', success: false }

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
      return { error: errorData.error || 'Invalid code', success: false }
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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return { error: 'Not authenticated', success: false }

  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/mfa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ action: 'unenroll', factorId })
    })

    if (!res.ok) {
      const errorData = await res.json()
      return { error: errorData.error || 'Failed to unenroll', success: false }
    }

    revalidatePath('/settings/security')
    return { success: true, error: null }
  } catch (err: any) {
    return { error: err.message, success: false }
  }
}
