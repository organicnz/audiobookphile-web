import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchLibraryItemsAction,
  fetchAuthorsAction,
  fetchSeriesAction,
  fetchCollectionsAction,
  fetchPlaylistsAction
} from '@/features/library/actions/libraryActions'
import { EntityType, BookshelfEntity, LibraryItem, MediaItemShare, RssFeed } from '@/types/api'
import { useSocketEvent } from '@/shared/contexts/SocketContext'
import { useCallback } from 'react'

interface UseInfiniteBookshelfProps {
  libraryId: string
  entityType: EntityType
  query: string
  limit: number
}

export function useInfiniteBookshelf({ libraryId, entityType, query, limit }: UseInfiniteBookshelfProps) {
  const queryClient = useQueryClient()

  const queryKey = ['bookshelf', libraryId, entityType, query]

  const queryFn = async ({ pageParam = 0 }) => {
    const queryParams = `${query}${query ? '&' : ''}limit=${limit}&page=${pageParam}&minified=1`

    let response: any
    switch (entityType) {
      case 'items':
        response = await fetchLibraryItemsAction(libraryId, queryParams)
        break
      case 'authors':
        response = await fetchAuthorsAction(libraryId, queryParams)
        break
      case 'series':
        response = await fetchSeriesAction(libraryId, queryParams)
        break
      case 'collections':
        response = await fetchCollectionsAction(libraryId, queryParams)
        break
      case 'playlists':
        response = await fetchPlaylistsAction(libraryId, queryParams)
        break
    }

    const results = response.results || response.authors || []
    const total = response.total ?? results.length

    return {
      results,
      total,
      nextPage: results.length === limit ? pageParam + 1 : undefined
    }
  }

  const infiniteQuery = useInfiniteQuery({
    queryKey,
    queryFn,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage
  })

  // Real-time updates via Socket.io
  const updateItemInCache = useCallback(
    (updater: (item: BookshelfEntity) => BookshelfEntity) => {
      queryClient.setQueriesData({ queryKey: ['bookshelf', libraryId] }, (oldData: any) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            results: page.results.map(updater)
          }))
        }
      })
    },
    [queryClient, libraryId]
  )

  useSocketEvent<MediaItemShare>('share_open', (share) => {
    if (entityType !== 'items') return
    updateItemInCache((item) => {
      const li = item as LibraryItem
      if (li.media?.id === share.mediaItemId) {
        return { ...li, mediaItemShare: share }
      }
      return item
    })
  })

  useSocketEvent<MediaItemShare>('share_closed', (share) => {
    if (entityType !== 'items') return
    updateItemInCache((item) => {
      const li = item as LibraryItem
      if (li.media?.id === share.mediaItemId) {
        return { ...li, mediaItemShare: undefined }
      }
      return item
    })
  })

  useSocketEvent<RssFeed>('rss_feed_open', (feed) => {
    updateItemInCache((item) => {
      if (item.id === feed.entityId) {
        return { ...item, rssFeed: feed }
      }
      return item
    })
  })

  useSocketEvent<RssFeed>('rss_feed_closed', (feed) => {
    updateItemInCache((item) => {
      if (item.id === feed.entityId) {
        return { ...item, rssFeed: undefined }
      }
      return item
    })
  })

  return infiniteQuery
}
