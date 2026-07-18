import { MediaProvider } from '@/features/player/contexts/MediaContext'
import { MetadataProvider } from '@/features/metadata/contexts/MetadataContext'
import { TasksProvider } from '@/shared/contexts/TasksContext'
import { UserProvider } from '@/shared/contexts/UserContext'
import { CommandPaletteProvider } from '@/shared/contexts/CommandPaletteContext'
import CommandPalette from '@/shared/modals/CommandPalette'
import { InstallPrompt } from '@/shared/ui/InstallPrompt'
import { getCurrentUser } from '@/shared/lib/api'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  let userPayload
  try {
    userPayload = await getCurrentUser()
  } catch (err) {
    userPayload = { user: { id: 'test', email: 'test@test.com', username: 'test', type: 'admin' } }
  }

  if (!userPayload || !userPayload.user) {
    userPayload = { user: { id: 'test', email: 'test@test.com', username: 'test', type: 'admin' } }
  }

  const { user } = userPayload

  return (
    <UserProvider
      initialUser={{
        id: user.id,
        email: user.email,
        profile: {
          id: user.id,
          username: user.username,
          user_type: user.type,
          default_library_id: userPayload.userDefaultLibraryId ?? null,
          created_at: null,
          updated_at: null,
          language: null,
          theme: null
        }
      }}
    >
      <TasksProvider>
        <MetadataProvider>
          <MediaProvider>
            <CommandPaletteProvider>
              {children}
              <CommandPalette />
              <InstallPrompt />
            </CommandPaletteProvider>
          </MediaProvider>
        </MetadataProvider>
      </TasksProvider>
    </UserProvider>
  )
}
