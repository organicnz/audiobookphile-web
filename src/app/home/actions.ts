'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function submitCheckIn() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('check_ins')
    .insert({
      user_id: user.id,
      mood: 'Good', // Simplification for now
      urge_level: 0,
      journal: 'Daily check-in completed from web.',
    })

  if (error) {
    console.error('Error submitting check-in:', error)
    throw new Error('Could not submit check-in')
  }

  revalidatePath('/home')
  revalidatePath('/progress')
}
