import { MediaProvider } from '@/contexts/MediaContext'
import { MetadataProvider } from '@/contexts/MetadataContext'
import { SocketProvider } from '@/contexts/SocketContext'
import { TasksProvider } from '@/contexts/TasksContext'
import { UserProvider } from '@/contexts/UserContext'
import { getCurrentUser } from '@/lib/supabase-api'
import { redirect } from 'next/navigation'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  let userData
  try {
    userData = await getCurrentUser()
  } catch {
    redirect('/login')
  }

  if (!userData) {
    redirect('/login')
  }

  return (
    <SocketProvider accessToken={null}>
      <UserProvider initialUser={userData}>
        <TasksProvider>
          <MetadataProvider>
            <MediaProvider>{children}</MediaProvider>
          </MetadataProvider>
        </TasksProvider>
      </UserProvider>
    </SocketProvider>
  )
}
