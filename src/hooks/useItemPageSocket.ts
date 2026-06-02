'use client'

import type { BookLibraryItem, MediaItemShare, PodcastEpisodeDownload, PodcastLibraryItem, RssFeed } from '@/types/api'

// Stub hook — real-time socket updates are not available in the serverless architecture.
// Returns static empty state so call sites continue to compile and render without errors.

interface UseItemPageSocketOptions {
  libraryItemId: string
  mediaId?: string
  isPodcast: boolean
  onItemUpdated?: (libraryItem: BookLibraryItem | PodcastLibraryItem) => void
  initialRssFeed?: RssFeed | null
}

interface UseItemPageSocketReturn {
  rssFeed: RssFeed | null
  mediaItemShare: MediaItemShare | null
  episodesDownloading: PodcastEpisodeDownload[]
  episodeDownloadsQueued: PodcastEpisodeDownload[]
}

export function useItemPageSocket({ initialRssFeed = null }: UseItemPageSocketOptions): UseItemPageSocketReturn {
  return {
    rssFeed: initialRssFeed ?? null,
    mediaItemShare: null,
    episodesDownloading: [],
    episodeDownloadsQueued: []
  }
}
