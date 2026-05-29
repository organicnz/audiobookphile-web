import { BookMedia, Library, LibraryItem, LibrarySettings, PodcastMedia } from '@/types/api'

/**
 * Maps a raw Supabase library row (snake_case) to the canonical Library interface (camelCase).
 */
export function mapLibrary(row: any): Library {
  if (!row) return row

  return {
    id: row.id,
    name: row.name || 'Library',
    mediaType: (row.media_type as 'book' | 'podcast') || 'book',
    displayOrder: row.display_order ?? 0,
    icon: row.icon || 'books',
    createdAt: row.created_at ? new Date(row.created_at).getTime() : 0,
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : 0,
    settings: mapLibrarySettings(row.settings),
    folders: (row.library_folders || row.folders || []).map((f: any) => ({
      id: f.id,
      libraryId: f.library_id,
      fullPath: f.path || '',
      updatedAt: f.updated_at ? new Date(f.updated_at).getTime() : 0,
    })),
  }
}

/**
 * Maps a raw Supabase library item row to the canonical LibraryItem interface.
 */
export function mapLibraryItem(row: any): LibraryItem {
  if (!row) return row

  return {
    id: row.id,
    ino: row.ino,
    libraryId: row.library_id,
    folderId: row.folder_id,
    path: row.path,
    relPath: row.rel_path,
    isFile: row.is_file,
    isMissing: row.is_missing,
    isInvalid: row.is_invalid,
    mediaType: row.media_type,
    mtimeMs: row.mtime ? new Date(row.mtime).getTime() : 0,
    ctimeMs: row.ctime ? new Date(row.ctime).getTime() : 0,
    birthtimeMs: row.birthtime ? new Date(row.birthtime).getTime() : 0,
    addedAt: row.created_at ? new Date(row.created_at).getTime() : 0,
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : 0,
    lastScan: row.last_scan ? new Date(row.last_scan).getTime() : undefined,
    scanVersion: row.scan_version,
    // Add nested joins if they exist
    // Supabase returns a single object (not array) for FK joins via media_id → books.id
    media: row.books
      ? mapBook(Array.isArray(row.books) ? row.books[0] : row.books)
      : row.podcast_episodes?.length
        ? mapPodcast(row.podcast_episodes[0])
        : createSkeletonBook(row),
  }
}

function createSkeletonBook(row: any): BookMedia {
  return {
    libraryItemId: row.id,
    tags: [],
    metadata: {
      title: row.title || 'Unknown',
      authors: [],
      narrators: [],
      series: [],
      genres: [],
      explicit: false,
      abridged: false,
    },
  }
}

function mapBook(book: any): BookMedia {
  if (!book) return createSkeletonBook({})

  const audioFiles = book.audio_files || []

  // Map raw audio_files JSONB to AudioTrack shape for the tracks table
  const tracks = audioFiles.map((af: any, i: number) => ({
    ...af,
    metadata: af.metadata || { filename: '', ext: '', path: '', relPath: '', size: 0, mtimeMs: 0, ctimeMs: 0, birthtimeMs: 0 },
    index: af.index ?? i,
    startOffset: 0,
    duration: af.duration ?? 0,
    title: af.metadata?.filename ?? `Track ${i + 1}`,
    contentUrl: af.metadata?.path ?? '',
    mimeType: af.mimeType ?? 'audio/mpeg',
    codec: af.codec ?? '',
    timeBase: af.timeBase ?? '1/1000',
    channels: af.channels ?? 2,
    channelLayout: af.channelLayout ?? 'stereo',
    chapters: af.chapters ?? [],
    embeddedCoverArt: af.embeddedCoverArt ?? null,
    metaTags: af.metaTags ?? {},
    isDirectPlaySupported: true,
  }))

  return {
    id: book.id,
    libraryItemId: book.library_item_id ?? book.id,
    coverPath: book.cover_path,
    tags: book.tags || [],
    audioFiles,
    tracks,
    numTracks: tracks.length,
    numAudioFiles: audioFiles.length,
    chapters: book.chapters || [],
    metadata: {
      title: book.title || 'Unknown',
      subtitle: book.subtitle,
      authors: (book.book_authors || []).map((ba: any) => ({
        id: ba.authors?.id,
        name: ba.authors?.name || 'Unknown Author',
      })),
      narrators: book.narrators || [],
      series: (book.book_series || []).map((bs: any) => ({
        id: bs.series?.id,
        name: bs.series?.name || 'Unknown Series',
        sequence: bs.sequence,
      })),
      genres: book.genres || [],
      publishedYear: book.published_year,
      publishedDate: book.published_date,
      publisher: book.publisher,
      description: book.description,
      isbn: book.isbn,
      asin: book.asin,
      language: book.language,
      explicit: !!book.explicit,
      abridged: !!book.abridged,
    },
  }
}

function mapPodcast(podcast: any): PodcastMedia {
  if (!podcast) {
    return {
      metadata: {
        title: 'Unknown Podcast',
        author: 'Unknown',
        description: '',
        genres: [],
        explicit: false,
      },
      tags: [],
    }
  }
  
  return {
    id: podcast.id,
    libraryItemId: podcast.library_item_id,
    coverPath: podcast.cover_path,
    tags: podcast.tags || [],
    episodes: (podcast.podcast_episodes || []).map((ep: any) => ({
      ...ep,
      libraryItemId: ep.library_item_id,
      podcastId: ep.podcast_id,
      pubDate: ep.published_at ? new Date(ep.published_at).toISOString() : undefined,
      publishedAt: ep.published_at ? new Date(ep.published_at).getTime() : 0,
      addedAt: ep.created_at ? new Date(ep.created_at).getTime() : 0,
      updatedAt: ep.updated_at ? new Date(ep.updated_at).getTime() : 0,
    })),
    metadata: {
      title: podcast.title || 'Unknown',
      author: podcast.author,
      description: podcast.description,
      genres: podcast.genres || [],
      explicit: !!podcast.explicit,
    },
    numEpisodes: podcast.num_episodes,
  }
}

/**
 * Maps raw library settings to the canonical LibrarySettings interface.
 */
export function mapLibrarySettings(settings: any): LibrarySettings {
  if (!settings) {
    return {
      coverAspectRatio: 1,
      disableWatcher: false,
    } as LibrarySettings
  }

  return {
    coverAspectRatio: settings.cover_aspect_ratio ?? 1,
    disableWatcher: settings.disable_watcher ?? false,
    skipMatchingMediaWithAsin: settings.skip_matching_media_with_asin,
    skipMatchingMediaWithIsbn: settings.skip_matching_media_with_isbn,
    autoScanCronExpression: settings.auto_scan_cron_expression,
    audiobooksOnly: settings.audiobooks_only,
    hideSingleBookSeries: settings.hide_single_book_series,
    onlyShowLaterBooksInContinueSeries: settings.only_show_later_books_in_continue_series,
    metadataPrecedence: settings.metadata_precedence,
    markAsFinishedTimeRemaining: settings.mark_as_finished_time_remaining,
    markAsFinishedPercentComplete: settings.mark_as_finished_percent_complete,
    podcastSearchRegion: settings.podcast_search_region,
  }
}
