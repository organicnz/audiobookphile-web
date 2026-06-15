'use client'

import { useEffect, useState } from 'react'
import { BookLibraryItem, BookshelfView, PodcastLibraryItem } from '@/types/api'
import { createClient } from '@/shared/utils/supabase/client'
import BookShelfRow from '../../features/library/components/BookShelfRow'
import BookMediaCard from './media-card/BookMediaCard'
import PodcastMediaCard from './media-card/PodcastMediaCard'
import { useUser } from '@/shared/contexts/UserContext'

interface SimilarBooksShelfProps {
  libraryItem: BookLibraryItem | PodcastLibraryItem
}

export default function SimilarBooksShelf({ libraryItem }: SimilarBooksShelfProps) {
  const [similarItems, setSimilarItems] = useState<(BookLibraryItem | PodcastLibraryItem)[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasEmbedding, setHasEmbedding] = useState(true)

  const { serverSettings, user, ereaderDevices } = useUser()

  useEffect(() => {
    let isMounted = true
    const supabase = createClient()

    const fetchSimilarItems = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await (supabase as any).rpc('match_library_items', {
          item_id: libraryItem.id,
          match_threshold: 0.2,
          match_count: 10
        })

        if (error) {
          console.error('Failed to fetch similar items:', error)
          if (isMounted) setHasEmbedding(false)
          return
        }

        if (!data || data.length === 0) {
          if (isMounted) setHasEmbedding(false)
          return
        }

        const ids = data.map((d: any) => d.id)

        const { data: items, error: itemsErr } = await supabase
          .from('library_items')
          .select('*')
          .in('id', ids)

        if (itemsErr) {
          console.error('Failed to fetch similar library items details:', itemsErr)
          return
        }

        if (isMounted && items) {
          const sortedItems = items.sort((a: any, b: any) => {
            const indexA = ids.indexOf(a.id)
            const indexB = ids.indexOf(b.id)
            return indexA - indexB
          }) as unknown as (BookLibraryItem | PodcastLibraryItem)[]

          setSimilarItems(sortedItems)
          setHasEmbedding(true)
        }
      } catch (err) {
        console.error('Error in fetchSimilarItems:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchSimilarItems()

    return () => {
      isMounted = false
    }
  }, [libraryItem.id])

  if (isLoading) {
    return (
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4 opacity-50">Loading similar items...</h2>
      </div>
    )
  }

  if (!hasEmbedding || similarItems.length === 0) {
    return null
  }

  return (
    <div className="mt-12 relative z-10">
      <BookShelfRow title="Similar to this">
        {similarItems.map((item, index) => {
          const props = {
            libraryItem: item,
            bookshelfView: BookshelfView.STANDARD,
            dateFormat: serverSettings?.dateFormat || 'yyyy-MM-dd',
            timeFormat: serverSettings?.timeFormat || 'HH:mm',
            userPermissions: user.permissions || {},
            ereaderDevices: ereaderDevices || [],
            showSubtitles: false,
            entityIndex: index
          }

          if (item.mediaType === 'book') {
            return <BookMediaCard key={item.id} {...props as any} />
          }
          return <PodcastMediaCard key={item.id} {...props as any} />
        })}
      </BookShelfRow>
    </div>
  )
}
