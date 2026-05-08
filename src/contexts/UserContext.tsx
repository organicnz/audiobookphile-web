'use client'

import type { Profile } from '@/types/index'
import { createClient } from '@/utils/supabase/client'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

// ---------------------------------------------------------------------------
// Shape of the user data passed from the server (layout.tsx)
// Derived from auth.User + public.profiles
// ---------------------------------------------------------------------------

export interface AppUser {
  id: string
  email: string | undefined
  username: string
  userType: 'admin' | 'user' | string
  language: string
  theme: string
  defaultLibraryId: string | null
  // ---------------------------------------------------------------------------
  // Compatibility shims — keep existing components working during migration
  // ---------------------------------------------------------------------------
  /** @deprecated use userType */
  type: 'admin' | 'user' | 'root' | string
  /** @deprecated no ABS permissions in Supabase-native mode */
  permissions: {
    download: boolean
    update: boolean
    delete: boolean
    upload: boolean
    createEreader: boolean
    accessAllLibraries: boolean
    accessAllTags: boolean
    accessExplicitContent: boolean
    selectedTagsNotAccessible: boolean
  }
  /** @deprecated no ABS media progress in Supabase-native mode */
  mediaProgress: unknown[]
  /** @deprecated */
  bookmarks: unknown[]
  /** @deprecated */
  isActive: boolean
  /** @deprecated */
  isLocked: boolean
  /** @deprecated */
  librariesAccessible: string[]
  /** @deprecated */
  itemTagsSelected: string[]
  /** @deprecated */
  hasOpenIDLink: boolean
  /** @deprecated */
  token: string
}

export interface UserContextType {
  user: AppUser
  userIsAdmin: boolean
  userCanUpdate: boolean
  userCanDelete: boolean
  userCanDownload: boolean
  /** Raw profile row for settings pages */
  profile: Profile
  // ---------------------------------------------------------------------------
  // Compatibility shims — keep existing components working during migration
  // ---------------------------------------------------------------------------
  /** @deprecated use userIsAdmin */
  userIsAdminOrUp: boolean
  /** @deprecated no server settings in Supabase-native mode */
  serverSettings: Record<string, unknown>
  userDefaultLibraryId?: string
  /** @deprecated no e-reader devices in Supabase-native mode */
  ereaderDevices: unknown[]
  Source: string
  getMediaItemProgress: (mediaItemId: string) => undefined
}

export const UserContext = createContext<UserContextType | undefined>(undefined)

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export interface InitialUserData {
  id: string
  email: string | undefined
  profile: Profile
}

export function UserProvider({
  children,
  initialUser,
}: {
  children: ReactNode
  initialUser: InitialUserData
}) {
  const [userData, setUserData] = useState<InitialUserData>(initialUser)
  const supabase = createClient()

  // Keep in sync with auth state changes (token refresh, sign-out)
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        // MainLayout will redirect; nothing to do here
      }
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  // Re-sync when server re-renders with fresh data
  useEffect(() => {
    setUserData(initialUser)
  }, [initialUser])

  const { profile } = userData

  const appUser: AppUser = {
    id: userData.id,
    email: userData.email,
    username: profile.username ?? userData.email?.split('@')[0] ?? userData.id,
    userType: profile.user_type,
    language: profile.language,
    theme: profile.theme,
    defaultLibraryId: profile.default_library_id,
    // Compat shims
    type: profile.user_type,
    permissions: {
      download: true,
      update: userIsAdmin,
      delete: userIsAdmin,
      upload: userIsAdmin,
      createEreader: true,
      accessAllLibraries: true,
      accessAllTags: true,
      accessExplicitContent: true,
      selectedTagsNotAccessible: false,
    },
    mediaProgress: [],
    bookmarks: [],
    isActive: true,
    isLocked: false,
    librariesAccessible: [],
    itemTagsSelected: [],
    hasOpenIDLink: false,
    token: '',
  }

  const userIsAdmin = appUser.userType === 'admin'

  const contextValue: UserContextType = {
    user: appUser,
    profile,
    userIsAdmin,
    userCanUpdate: userIsAdmin,
    userCanDelete: userIsAdmin,
    userCanDownload: true,
    // Compatibility shims
    userIsAdminOrUp: userIsAdmin,
    serverSettings: {},
    userDefaultLibraryId: profile.default_library_id ?? undefined,
    ereaderDevices: [],
    Source: 'supabase',
    getMediaItemProgress: () => undefined,
  }

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
