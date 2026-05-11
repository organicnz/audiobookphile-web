import { LibraryProvider } from '@/contexts/LibraryContext'
import { getLibraries } from '@/lib/supabase-api'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import AppBar from '../../AppBar'
import LibraryLayoutWrapper from './LibraryLayoutWrapper'

export const metadata: Metadata = {
  title: 'audiobookshelf',
  description: 'audiobookshelf'
}

export default async function LibraryLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ library: string }>
}>) {
  const { library: currentLibraryId } = await params

  let libraries: import('@/types/api').Library[] = []
  try {
    const response = await getLibraries()
    libraries = response.libraries
  } catch (err) {
    console.error('Error getting library data', err)
    redirect('/')
  }

  const currentLibrary = libraries.find((library) => library.id === currentLibraryId)
  if (!currentLibrary) {
    console.error('Error getting library data')
    redirect('/')
  }

  return (
    <LibraryProvider library={currentLibrary}>
      <AppBar libraries={libraries} currentLibraryId={currentLibraryId} />
      <LibraryLayoutWrapper>{children}</LibraryLayoutWrapper>
    </LibraryProvider>
  )
}
