import { BookMedia, Library, LibraryItem, LibrarySettings, PodcastMedia } from '@/types/api'
import type { Database } from '@/types/supabase'

// ─── Supabase Row type aliases (local to this module) ───────────────────────

type LibraryRow = Database['public']['Tables']['libraries']['Row'] & {
  library_folders?: Array<Database['public']['Tables']['library_folders']['Row']>
  folders?: Array<Database['public']['Tables']['library_folders']['Row']>
}

type BooksRowWithJoins = Database['public']['Tables']['books']['Row'] & {
  book_authors?: Array<{
    authors: Database['public']['Tables']['authors']['Row'] | null
  }> | null
  book_series?: Array<{
    series: Database['public']['Tables']['series']['Row'] | null
    sequence: string | null
  }> | null
  // library_item_id is resolved via joins at runtime, not in the books Row itself
  library_item_id?: string | null
  // size is not in books Row but may be present via join context
  size?: number | null
}

type PodcastEpisodesRow = Database['public']['Tables']['podcast_episodes']['Row']

type LibraryItemRow = Database['public']['Tables']['library_items']['Row'] & {
  books?: BooksRowWithJoins | null
  podcast_episodes?: PodcastEpisodesRow[] | null
  // folder_id and scan_version are not in the DB schema but may be present from legacy/join paths
  folder_id?: string | null
  scan_version?: string | null
}

type LibrarySettingsJson = Database['public']['Tables']['libraries']['Row']['settings']

/**
 * Maps a raw Supabase library row (snake_case) to the canonical Library interface (camelCase).
 */
export function mapLibrary(row: LibraryRow): Library {
  if (!row) return row as unknown as Library

  return {
    id: row.id,
    name: row.name || 'Library',
    mediaType: (row.media_type as 'book' | 'podcast') || 'book',
    displayOrder: row.display_order ?? 0,
    icon: row.icon || 'books',
    createdAt: row.created_at ? new Date(row.created_at).getTime() : 0,
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : 0,
    settings: mapLibrarySettings(row.settings),
    folders: (row.library_folders || row.folders || []).map((f) => ({
      id: f.id,
      libraryId: f.library_id ?? '',
      fullPath: f.path || '',
      updatedAt: f.updated_at ? new Date(f.updated_at).getTime() : 0
    }))
  }
}

/**
 * Maps a raw Supabase library item row to the canonical LibraryItem interface.
 */
export function mapLibraryItem(row: LibraryItemRow): LibraryItem {
  if (!row) return row as unknown as LibraryItem

  return {
    id: row.id,
    ino: row.ino ?? '',
    libraryId: row.library_id ?? '',
    folderId: row.folder_id ?? undefined,
    path: row.path ?? '',
    relPath: row.rel_path ?? '',
    isFile: row.is_file ?? false,
    isMissing: row.is_missing ?? false,
    isInvalid: row.is_invalid ?? false,
    mediaType: (row.media_type as 'book' | 'podcast') ?? 'book',
    mtimeMs: row.mtime ? new Date(row.mtime).getTime() : 0,
    ctimeMs: row.ctime ? new Date(row.ctime).getTime() : 0,
    birthtimeMs: row.birthtime ? new Date(row.birthtime).getTime() : 0,
    addedAt: row.created_at ? new Date(row.created_at).getTime() : 0,
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : 0,
    lastScan: row.last_scan ? new Date(row.last_scan).getTime() : undefined,
    scanVersion: row.scan_version ?? undefined,
    // Add nested joins if they exist
    // Supabase returns a single object (not array) for FK joins via media_id → books.id
    media: row.books
      ? mapBook(Array.isArray(row.books) ? row.books[0] : row.books)
      : row.podcast_episodes?.length
        ? mapPodcast(row.podcast_episodes[0])
        : createSkeletonBook(row)
  }
}

function createSkeletonBook(row: Pick<LibraryItemRow, 'id' | 'title'>): BookMedia {
  return {
    mediaType: 'book',
    libraryItemId: row.id,
    tags: [],
    metadata: {
      title: row.title || 'Unknown',
      authors: [],
      narrators: [],
      series: [],
      genres: [],
      explicit: false,
      abridged: false
    }
  }
}

function mapBook(book: BooksRowWithJoins): BookMedia {
  if (!book) {
    return createSkeletonBook({} as Pick<LibraryItemRow, 'id' | 'title'>)
  }

  const audioFiles = (book.audio_files as unknown[] | null) || []

  // Map raw audio_files JSONB to AudioTrack shape for the tracks table
  const tracks = (Array.isArray(audioFiles) ? audioFiles : [])
    .map((af: unknown, i: number) => {
      if (!af || typeof af !== 'object') return null
      const a = af as Record<string, unknown>
      const meta = a.metadata && typeof a.metadata === 'object' ? (a.metadata as Record<string, unknown>) : {}
      return {
        ...a,
        metadata: a.metadata || {
          filename: '',
          ext: '',
          path: '',
          relPath: '',
          size: 0,
          mtimeMs: 0,
          ctimeMs: 0,
          birthtimeMs: 0
        },
        index: (a.index as number) ?? i,
        startOffset: 0,
        duration: (a.duration as number) ?? 0,
        title: (meta?.filename as string) ?? `Track ${i + 1}`,
        contentUrl: (meta?.path as string) ?? '',
        mimeType: (a.mimeType as string) ?? 'audio/mpeg',
        codec: (a.codec as string) ?? '',
        timeBase: (a.timeBase as string) ?? '1/1000',
        channels: (a.channels as number) ?? 2,
        channelLayout: (a.channelLayout as string) ?? 'stereo',
        chapters: (a.chapters as unknown[]) ?? [],
        embeddedCoverArt: (a.embeddedCoverArt as string | null) ?? null,
        metaTags: (a.metaTags as Record<string, unknown>) ?? {},
        isDirectPlaySupported: true
      }
    })
    .filter(Boolean)

  return {
    mediaType: 'book' as const,
    id: book.id,
    libraryItemId: book.library_item_id ?? book.id,
    coverPath: book.cover_path ?? undefined,
    tags: (book.tags as string[]) || [],
    audioFiles: audioFiles as never,
    tracks: tracks.filter(Boolean) as never,
    numTracks: tracks.length,
    numAudioFiles: audioFiles.length,
    chapters: (book.chapters as never) || [],
    metadata: {
      title: book.title || 'Unknown',
      subtitle: book.subtitle ?? undefined,
      authors: (book.book_authors || []).map((ba) => ({
        id: ba.authors?.id ?? '',
        name: ba.authors?.name || 'Unknown Author'
      })),
      narrators: (book.narrators as string[]) || [],
      series: (book.book_series || []).map((bs) => ({
        id: bs.series?.id ?? '',
        name: bs.series?.name || 'Unknown Series',
        sequence: bs.sequence ?? undefined
      })),
      genres: (book.genres as string[]) || [],
      publishedYear: book.published_year ?? undefined,
      publishedDate: book.published_date ?? undefined,
      publisher: book.publisher ?? undefined,
      description: book.description ?? undefined,
      isbn: book.isbn ?? undefined,
      asin: book.asin ?? undefined,
      language: book.language ?? undefined,
      explicit: !!book.explicit,
      abridged: !!book.abridged
    }
  }
}

function mapPodcast(podcast: PodcastEpisodesRow): PodcastMedia {
  if (!podcast) {
    return {
      mediaType: 'podcast' as const,
      metadata: {
        title: 'Unknown Podcast',
        author: 'Unknown',
        description: '',
        genres: [],
        explicit: false
      },
      tags: []
    }
  }

  const p = podcast as PodcastEpisodesRow & Record<string, unknown>

  return {
    mediaType: 'podcast' as const,
    id: podcast.id,
    libraryItemId: p.library_item_id as string | undefined,
    coverPath: p.cover_path as string | undefined,
    tags: (p.tags as string[]) || [],
    episodes: ((p.podcast_episodes as unknown[]) || [])
      .map((ep: unknown) => {
        if (!ep || typeof ep !== 'object') return null
        const e = ep as Record<string, unknown>
        return {
          ...e,
          libraryItemId: e.library_item_id as string,
          podcastId: e.podcast_id as string,
          pubDate: e.published_at ? new Date(e.published_at as string).toISOString() : undefined,
          publishedAt: e.published_at ? new Date(e.published_at as string).getTime() : 0,
          addedAt: e.created_at ? new Date(e.created_at as string).getTime() : 0,
          updatedAt: e.updated_at ? new Date(e.updated_at as string).getTime() : 0
        }
      })
      .filter(Boolean) as never,
    metadata: {
      title: (p.title as string) || 'Unknown',
      author: p.author as string | undefined,
      description: podcast.description ?? undefined,
      genres: (p.genres as string[]) || [],
      explicit: !!(p.explicit as boolean | null)
    },
    numEpisodes: p.num_episodes as number | undefined
  }
}

/**
 * Maps raw library settings to the canonical LibrarySettings interface.
 */
export function mapLibrarySettings(settings: LibrarySettingsJson): LibrarySettings {
  if (!settings) {
    return {
      coverAspectRatio: 1,
      disableWatcher: false
    } as LibrarySettings
  }

  // Supabase types Json as a deep recursive type; cast to a plain record for field access
  const s = settings as Record<string, unknown>

  return {
    coverAspectRatio: ((s.cover_aspect_ratio as number) ?? 1) as 0 | 1,
    disableWatcher: (s.disable_watcher as boolean) ?? false,
    skipMatchingMediaWithAsin: s.skip_matching_media_with_asin as boolean | undefined,
    skipMatchingMediaWithIsbn: s.skip_matching_media_with_isbn as boolean | undefined,
    autoScanCronExpression: s.auto_scan_cron_expression as string | undefined,
    audiobooksOnly: s.audiobooks_only as boolean | undefined,
    hideSingleBookSeries: s.hide_single_book_series as boolean | undefined,
    onlyShowLaterBooksInContinueSeries: s.only_show_later_books_in_continue_series as boolean | undefined,
    metadataPrecedence: s.metadata_precedence as string[] | undefined,
    markAsFinishedTimeRemaining: s.mark_as_finished_time_remaining as number | undefined,
    markAsFinishedPercentComplete: s.mark_as_finished_percent_complete as number | undefined,
    podcastSearchRegion: s.podcast_search_region as string | undefined
  }
}
