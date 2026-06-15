import { createClient } from '@/shared/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function RootPage() {
  let isAuthed = false
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      isAuthed = true
    }
  } catch {
    // Supabase env vars missing or client failed — safe fallback
  }
  
  if (isAuthed) {
    redirect('/library')
  } else {
    redirect('/login')
  }
}
