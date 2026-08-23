import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getCurrentUser } from '@/shared/lib/api'
import { MediaProvider } from '@/features/player/contexts/MediaContext'
import { MetadataProvider } from '@/features/metadata/contexts/MetadataContext'
import { TasksProvider } from '@/shared/contexts/TasksContext'
import { UserProvider } from '@/shared/contexts/UserContext'
import { CommandPaletteProvider } from '@/shared/contexts/CommandPaletteContext'
import CommandPalette from '@/shared/modals/CommandPalette'
import { InstallPrompt } from '@/shared/ui/InstallPrompt'

interface UserPayload {
  user: {
    id: string
    email: string
    username: string
    type: string
  }
  userDefaultLibraryId: string | null
}

export async function UserDataFetcher({ children }: { children: React.ReactNode }) {
  let userPayload: UserPayload | null = null
  try {
    const result = await getCurrentUser()
    if (result?.user) {
      userPayload = {
        user: {
          id: result.user.id,
          email: result.user.email ?? '',
          username: result.user.username ?? '',
          type: result.user.type ?? ''
        },
        userDefaultLibraryId: result.userDefaultLibraryId ?? null
      }
    }
  } catch {
    userPayload = null
  }

  if (!userPayload || !userPayload.user) {
    redirect('/login')
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
          theme: null,
          is_2fa_enabled: null,
          totp_secret: null
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
