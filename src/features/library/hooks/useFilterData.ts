import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchLibraryFilterDataAction } from '@/features/library/actions/libraryActions'
import { isBookLibraryItem, isPodcastLibraryItem, LibraryFilterData, LibraryItem } from '@/types/api'
import { useCallback, useMemo } from 'react'
import { useSocketEvent } from '@/shared/contexts/SocketContext'

/**
 * Add unique strings to an array and sort alphabetically.
 */
function addUniqueStrings(
  existing: string[],
  newItems: string[] | undefined,
  sortFn: (a: string, b: string) => number = (a, b) => a.localeCompare(b)
): string[] {
  if (!newItems?.length) return existing
  const itemsToAdd = newItems.filter((item) => !existing.includes(item))
  if (itemsToAdd.length === 0) return existing
  return [...existing, ...itemsToAdd].sort(sortFn)
}

/**
 * Add unique objects by id to an array and sort by name.
 */
function addUniqueById<T extends { id: string; name: string }>(existing: T[], newItems: T[] | undefined): T[] {
  if (!newItems?.length) return existing
  const existingIds = new Set(existing.map((item) => item.id))
  const itemsToAdd = newItems.filter((item) => !existingIds.has(item.id))
  if (itemsToAdd.length === 0) return existing
  return [...existing, ...itemsToAdd].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
}

export function useFilterData(libraryId: string | undefined) {
  const queryClient = useQueryClient()
  const queryKey = useMemo(() => ['filterData', libraryId], [libraryId])

  const query = useQuery({
    queryKey,
    queryFn: () => fetchLibraryFilterDataAction(libraryId!),
    enabled: !!libraryId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  const updateFilterDataWithItem = useCallback(
    (libraryItem: LibraryItem) => {
      if (!libraryId || libraryItem.libraryId !== libraryId) return

      queryClient.setQueryData<LibraryFilterData>(queryKey, (prev) => {
        if (!prev) return prev
        const updated = { ...prev }

        if (isBookLibraryItem(libraryItem)) {
          const { metadata, tags } = libraryItem.media
          updated.authors = addUniqueById(updated.authors, metadata.authors)
          updated.series = addUniqueById(updated.series, metadata.series)
          updated.genres = addUniqueStrings(updated.genres, metadata.genres)
          updated.tags = addUniqueStrings(updated.tags, tags)
          updated.narrators = addUniqueStrings(updated.narrators, metadata.narrators)
          updated.publishers = addUniqueStrings(updated.publishers, metadata.publisher ? [metadata.publisher] : undefined)
          updated.languages = addUniqueStrings(updated.languages, metadata.language ? [metadata.language] : undefined)

          if (metadata.publishedYear && !isNaN(parseInt(metadata.publishedYear, 10))) {
            const year = parseInt(metadata.publishedYear, 10)
            const decade = (Math.floor(year / 10) * 10).toString()
            updated.publishedDecades = addUniqueStrings(updated.publishedDecades, [decade], (a, b) => parseInt(a, 10) - parseInt(b, 10))
          }
        } else if (isPodcastLibraryItem(libraryItem)) {
          const { metadata, tags } = libraryItem.media
          updated.genres = addUniqueStrings(updated.genres, metadata.genres)
          updated.tags = addUniqueStrings(updated.tags, tags)
          updated.languages = addUniqueStrings(updated.languages, metadata.language ? [metadata.language] : undefined)
        }

        return updated
      })
    },
    [libraryId, queryClient, queryKey]
  )

  const removeSeriesFromFilterData = useCallback(
    (seriesId: string) => {
      queryClient.setQueryData<LibraryFilterData>(queryKey, (prev) => {
        if (!prev) return prev
        return {
          ...prev,
          series: prev.series.filter((s) => s.id !== seriesId)
        }
      })
    },
    [queryClient, queryKey]
  )

  // Register socket listeners for real-time updates directly in the hook
  useSocketEvent<LibraryItem>('item_added', updateFilterDataWithItem)
  useSocketEvent<LibraryItem>('item_updated', updateFilterDataWithItem)
  useSocketEvent<LibraryItem[]>('items_added', (items) => items.forEach(updateFilterDataWithItem))
  useSocketEvent<LibraryItem[]>('items_updated', (items) => items.forEach(updateFilterDataWithItem))
  useSocketEvent<{ id: string; libraryId: string }>('series_removed', (data) => {
    if (data.libraryId === libraryId) {
      removeSeriesFromFilterData(data.id)
    }
  })

  return {
    filterData: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    updateFilterDataWithItem,
    removeSeriesFromFilterData
  }
}
