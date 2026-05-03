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

  // TODO: Fetch additional user data/settings from Supabase database if needed
  // For now, we mock the UserLoginResponse to satisfy existing components
  const mockUser: UserLoginResponse = {
    user: {
      id: user.id,
      username: user.email?.split('@')[0] || 'user',
      type: 'user',
      token: '', // Supabase uses its own session tokens
      mediaProgress: [],
      seriesHideFromContinueListening: [],
      bookmarks: [],
      isActive: true,
      isLocked: false,
      createdAt: Date.now(),
      permissions: {
        download: true,
        update: true,
        delete: true,
        upload: true,
        createEreader: true,
        accessAllLibraries: true,
        accessAllTags: true,
        accessExplicitContent: true,
        selectedTagsNotAccessible: false
      },
      librariesAccessible: [],
      itemTagsSelected: [],
      hasOpenIDLink: false
    },
    serverSettings: {
      scannerParseSubtitle: false,
      scannerFindCovers: false,
      scannerCoverProvider: '',
      scannerPreferMatchedMetadata: false,
      scannerDisableWatcher: false,
      storeCoverWithItem: false,
      storeMetadataWithItem: false,
      metadataFileFormat: '',
      rateLimitLoginRequests: 0,
      rateLimitLoginWindow: 0,
      allowIframe: false,
      backupPath: '',
      backupSchedule: false,
      backupsToKeep: 0,
      maxBackupSize: 0,
      loggerDailyLogsToKeep: 0,
      loggerScannerLogsToKeep: 0,
      homeBookshelfView: 0,
      bookshelfView: 0,
      podcastEpisodeSchedule: '',
      sortingIgnorePrefix: false,
      sortingPrefixes: [],
      chromecastEnabled: false,
      dateFormat: '',
      timeFormat: '',
      language: 'en-us',
      allowedOrigins: [],
      logLevel: 0,
      version: '',
      buildNumber: '',
      authActiveAuthMethods: [],
      authOpenIDTokenSigningAlgorithm: '',
      authOpenIDButtonText: '',
      authOpenIDAutoLaunch: false,
      authOpenIDAutoRegister: false
    },
    userDefaultLibraryId: undefined,
    ereaderDevices: [],
    Source: 'supabase'
  }

  return (
    <SocketProvider accessToken={token}>
      <UserProvider initialUser={mockUser}>
        <TasksProvider>
          <MetadataProvider>
            <MediaProvider>{children}</MediaProvider>
          </MetadataProvider>
        </TasksProvider>
      </UserProvider>
    </SocketProvider>
  )
}
