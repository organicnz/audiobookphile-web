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
  const { error } = await supabase.auth.mfa.challengeAndVerify({
    factorId,
    code
  })

  if (error) {
    return { error: 'Invalid code. Please try again.' }
  }

  revalidatePath('/', 'layout')
  redirect('/home')
}
