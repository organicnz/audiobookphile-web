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
  username: string | null
  userType: 'admin' | 'user' | string
  language: string
  theme: string
  defaultLibraryId: string | null
}

export interface UserContextType {
  user: AppUser
  userIsAdmin: boolean
  userCanUpdate: boolean
  userCanDelete: boolean
  userCanDownload: boolean
  /** Raw profile row for settings pages */
  profile: Profile
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
    username: profile.username,
    userType: profile.user_type,
    language: profile.language,
    theme: profile.theme,
    defaultLibraryId: profile.default_library_id,
  }

  const userIsAdmin = appUser.userType === 'admin'

  const contextValue: UserContextType = {
    user: appUser,
    profile,
    userIsAdmin,
    userCanUpdate: userIsAdmin,
    userCanDelete: userIsAdmin,
    userCanDownload: true,
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
