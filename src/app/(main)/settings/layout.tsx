import { SettingsDrawerProvider } from '@/contexts/SettingsDrawerContext'
import { getCurrentUser } from '@/lib/api'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import '../../../assets/globals.css'
import AppBar from '../AppBar'
import SettingsLayoutWrapper from './SettingsLayoutWrapper'

export const metadata: Metadata = {
  title: 'audiobookshelf',
  description: 'audiobookshelf'
}

export default async function SettingsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  let currentUser
  try {
    currentUser = await getCurrentUser()
  } catch {
    redirect('/login')
  }

  if (!currentUser) {
    redirect('/login')
  }

  // Redirect to library page if user is not admin or root
  if (!['admin', 'root'].includes(currentUser.user.type)) {
    return redirect('/library')
  }

  return (
    <SettingsDrawerProvider>
      <AppBar />
      <SettingsLayoutWrapper>{children}</SettingsLayoutWrapper>
    </SettingsDrawerProvider>
  )
}
