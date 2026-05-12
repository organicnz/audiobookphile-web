import { MediaProvider } from '@/contexts/MediaContext'
import { MetadataProvider } from '@/contexts/MetadataContext'
import { TasksProvider } from '@/contexts/TasksContext'
import { UserProvider } from '@/contexts/UserContext'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  // Validate the session — getUser() makes a network call to Supabase Auth
  // to verify the JWT rather than trusting the cookie value alone.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch the user's profile row from public.profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    // Profile missing — sign out and redirect so the user can re-authenticate
    redirect('/login')
  }

  return (
    <UserProvider initialUser={{ id: user.id, email: user.email, profile }}>
      <TasksProvider>
        <MetadataProvider>
          <MediaProvider>{children}</MediaProvider>
        </MetadataProvider>
      </TasksProvider>
    </UserProvider>
  )
}
