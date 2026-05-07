import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // If logged in, redirect to the library page.
  // The library layout/middleware should handle picking the default library.
  redirect('/library')
}
