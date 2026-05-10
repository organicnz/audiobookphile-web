'use server'

import { createClient } from '@/utils/supabase/server'

export async function changePassword(
  _oldPassword: string,
  newPassword: string
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({ password: newPassword })

  if (error) {
    throw new Error(error.message)
  }
}
