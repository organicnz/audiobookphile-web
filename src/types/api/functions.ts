import { LibraryItem } from '.'
import { BookMedia, PodcastMedia, BookMetadata, PodcastMetadata, BookLibraryItem, PodcastLibraryItem } from "./models"

export function isBookMedia(media: BookMedia | PodcastMedia): media is BookMedia {
  return 'audioFiles' in media || 'numTracks' in media
}

export function isPodcastMedia(media: BookMedia | PodcastMedia): media is PodcastMedia {
  return 'episodes' in media || 'numEpisodes' in media
}

export function isBookMetadata(metadata: BookMetadata | PodcastMetadata): metadata is BookMetadata {
  return 'authors' in metadata || 'authorName' in metadata
}

export function isPodcastMetadata(metadata: BookMetadata | PodcastMetadata): metadata is PodcastMetadata {
  return 'author' in metadata && !('authors' in metadata)
}

export function isBookLibraryItem(item: LibraryItem): item is BookLibraryItem {
  return item.mediaType === 'book'
}

export function isPodcastLibraryItem(item: LibraryItem): item is PodcastLibraryItem {
  return item.mediaType === 'podcast'
}
