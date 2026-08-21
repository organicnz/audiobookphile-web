import { EntityType } from '@/types/api'
import { Suspense } from 'react'

import BookshelfClient from './BookshelfClient'
import { getLibraryAuthors, getLibraryCollections, getLibraryItems, getLibraryPlaylists, getLibrarySeries } from '@/shared/lib/api'

async function fetchInitialData(entityType: EntityType, libraryId: string, searchParams: { [key: string]: string | string[] | undefined }) {
  const params = new URLSearchParams()
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value === undefined) return
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v))
    } else {
      params.append(key, value)
    }
  })
  const query = params.toString()
  // 50 is a safe default limit for initial load
  const fullQuery = query ? `${query}&` : ''
  let queryParams = `${fullQuery}limit=50&page=0&minified=1`
  if (entityType === 'items') {
    queryParams += '&include=rssfeed,numEpisodesIncomplete,share'
  }

  try {
    switch (entityType) {
      case 'items':
        return await getLibraryItems(libraryId, queryParams)
      case 'series':
        return await getLibrarySeries(libraryId, queryParams)
      case 'collections':
        return await getLibraryCollections(libraryId, queryParams)
      case 'playlists':
        return await getLibraryPlaylists(libraryId, queryParams)
      case 'authors':
        return await getLibraryAuthors(libraryId, queryParams)
      default:
        return null
    }
  } catch (error: any) {
    if (error.name === 'UnauthorizedError') {
      const { redirect } = require('next/navigation')
      redirect('/login')
    }
    console.error(`Failed to fetch initial data for ${entityType}:`, error)
    return null
  }
}

export default async function EntityPage({
  params,
  searchParams
}: {
  params: Promise<{ library: string; entityType: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { library, entityType: entityTypeString } = await params
  const resolvedSearchParams = await searchParams
  const entityType = entityTypeString as EntityType

  const initialData = await fetchInitialData(entityType, library, resolvedSearchParams)

  return (
    <div className="h-full w-full">
      <Suspense fallback={null}>
        <BookshelfClient key={entityType} entityType={entityType} initialData={initialData} />
      </Suspense>
    </div>
  )
}
