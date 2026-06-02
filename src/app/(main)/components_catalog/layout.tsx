import { getLibraries } from '@/lib/api'
import type { Metadata } from 'next'
import '../../../assets/globals.css'
import { ComponentsCatalogProvider } from '../../../contexts/ComponentsCatalogContext'
import AppBar from '../AppBar'

export const metadata: Metadata = {
  title: 'audiobookshelf - Components Catalog',
  description: 'Components catalog for audiobookshelf client'
}

export default async function ComponentsCatalogLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  let libraries: import('@/types/api').Library[] = []
  try {
    const res = await getLibraries()
    libraries = res.libraries
  } catch {
    libraries = []
  }

  return (
    <>
      <AppBar libraries={libraries} />
      <ComponentsCatalogProvider libraries={libraries}>
        <div className="h-full max-h-screen w-full overflow-x-hidden overflow-y-auto">{children}</div>
      </ComponentsCatalogProvider>
    </>
  )
}
