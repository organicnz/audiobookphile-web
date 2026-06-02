import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function RootPage() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) redirect('/library')
  } catch {
    // Supabase env vars missing or client failed — safe fallback
  }
  redirect('/login')
}
