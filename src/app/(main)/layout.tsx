import { MediaProvider } from '@/contexts/MediaContext'
import { MetadataProvider } from '@/contexts/MetadataContext'
import { SocketProvider } from '@/contexts/SocketContext'
import { TasksProvider } from '@/contexts/TasksContext'
import { UserProvider } from '@/contexts/UserContext'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { UserLoginResponse } from '@/types/api'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { session },
    error
  } = await supabase.auth.getSession()
  const user = session?.user
  const token = session?.access_token || null

  if (!user) {
    redirect('/login')
  }

  const { getCurrentUser } = await import('@/lib/supabase-api')
  const realUser = await getCurrentUser()

  if (!realUser) {
    // If the auth session exists but no profile exists, we might need to sign out or redirect to onboarding
    console.error('Supabase session exists but no user profile found for', user.id)
    redirect('/login')
  }

  return (
    <SocketProvider accessToken={token}>
      <UserProvider initialUser={realUser}>
        <TasksProvider>
          <MetadataProvider>
            <MediaProvider>{children}</MediaProvider>
          </MetadataProvider>
        </TasksProvider>
      </UserProvider>
    </SocketProvider>
  )
}
