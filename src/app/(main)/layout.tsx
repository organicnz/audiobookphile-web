import { MediaProvider } from '@/contexts/MediaContext'
import { MetadataProvider } from '@/contexts/MetadataContext'
import { TasksProvider } from '@/contexts/TasksContext'
import { UserProvider } from '@/contexts/UserContext'
import { getCurrentUser } from '@/lib/api'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  let userPayload
  try {
    userPayload = await getCurrentUser()
  } catch (err) {
    redirect('/login')
  }

  if (!userPayload || !userPayload.user) {
    redirect('/login')
  }

  const { user } = userPayload

  return (
    <UserProvider initialUser={{ id: user.id, email: user.email, profile: { id: user.id, username: user.username, user_type: user.type, default_library_id: userPayload.userDefaultLibraryId ?? null, created_at: null, updated_at: null, language: null, theme: null } }}>
      <TasksProvider>
        <MetadataProvider>
          <MediaProvider>{children}</MediaProvider>
        </MetadataProvider>
      </TasksProvider>
    </UserProvider>
  )
}
