/**
 * Supabase API module — server-side data access layer.
 *
 * All functions use the server Supabase client (cookie-based session) and
 * operate against the new schema.  No legacy tables (`books`, `legacy_users`)
 * or ABS-era types are referenced here.
 *
 * Requirements: 7.1–7.11, 8.6, 8.7, 9.4, 9.9, 10.1, 10.4, 11.1, 12.7–12.9
 */

import { ApiError, UnauthorizedError } from '@/lib/apiErrors'
import type {
    Author,
    Collection,
    Library,
    LibraryItem,
    LibraryItemExpanded,
    LibraryItemWithProgress,
    MediaProgress,
    Playlist,
    Profile,
    Series
} from '@/types/index'
import { createClient } from '@/utils/supabase/server'

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Throw UnauthorizedError when there is no authenticated session. */
async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new UnauthorizedError()
  return { supabase, user }
}

// ---------------------------------------------------------------------------
// Libraries
// ---------------------------------------------------------------------------

/** Return all libraries ordered by display_order. */
export async function getLibraries(): Promise<Library[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('libraries')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) throw new ApiError(error.message, 500, 'Internal Server Error')
  return data ?? []
}

/** Return a single library by id, or throw ApiError(404) if not found. */
export async function getLibrary(libraryId: string): Promise<Library> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('libraries')
    .select('*')
    .eq('id', libraryId)
    .maybeSingle()

  if (error) throw new ApiError(error.message, 500, 'Internal Server Error')
  if (!data) throw new ApiError(`Library ${libraryId} not found`, 404, 'Not Found')
  return data
}

// ---------------------------------------------------------------------------
// Library items
// ---------------------------------------------------------------------------

export interface LibraryItemsOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortDesc?: boolean
}

export interface LibraryItemsResult {
  results: LibraryItem[]
  total: number
  limit: number
  page: number
}

/**
 * Return a paginated list of library items for a given library.
 *
 * Defaults: page=0, limit=25, sortBy='added_at', sortDesc=true
 */
export async function getLibraryItems(
  libraryId: string,
  options: LibraryItemsOptions = {}
): Promise<LibraryItemsResult> {
  const supabase = await createClient()
  const page = options.page ?? 0
  const limit = options.limit ?? 25
  const sortBy = options.sortBy ?? 'added_at'
  const sortDesc = options.sortDesc ?? true

  const from = page * limit
  const to = from + limit - 1

  const { data, error, count } = await supabase
    .from('library_items')
    .select('*', { count: 'exact' })
    .eq('library_id', libraryId)
    .order(sortBy, { ascending: !sortDesc })
    .range(from, to)

  if (error) throw new ApiError(error.message, 500, 'Internal Server Error')

  return {
    results: data ?? [],
    total: count ?? 0,
    limit,
    page,
  }
}

/**
 * Return a single library item with all related entities joined, or throw
 * ApiError(404) if not found.
 */
export async function getLibraryItem(itemId: string): Promise<LibraryItemExpanded> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('library_items')
    .select(
      `*,
      audio_files(*),
      chapters(*),
      podcast_episodes(*),
      book_authors(authors(*)),
      book_series(series(*), sequence),
      book_narrators(narrators(*))`
    )
    .eq('id', itemId)
    .maybeSingle()

  if (error) throw new ApiError(error.message, 500, 'Internal Server Error')
  if (!data) throw new ApiError(`Library item ${itemId} not found`, 404, 'Not Found')
  return data as unknown as LibraryItemExpanded
}

// ---------------------------------------------------------------------------
// Media progress
// ---------------------------------------------------------------------------

/**
 * Return the current user's media progress for a library item (and optional
 * episode), or null if no progress row exists yet.
 */
export async function getMediaProgress(
  libraryItemId: string,
  episodeId?: string
): Promise<MediaProgress | null> {
  const { supabase, user } = await requireUser()

  let query = supabase
    .from('media_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('library_item_id', libraryItemId)

  if (episodeId) {
    query = query.eq('episode_id', episodeId)
  } else {
    query = query.is('episode_id', null)
  }

  const { data, error } = await query.maybeSingle()
  if (error) throw new ApiError(error.message, 500, 'Internal Server Error')
  return data
}

export interface MediaProgressUpdate {
  currentTime: number
  duration: number
  isFinished?: boolean
  episodeId?: string
}

/**
 * Upsert media progress for the current user.
 *
 * Conflict target: (user_id, library_item_id, episode_id).
 * `progress` is computed as currentTime / duration (clamped to [0, 1]).
 */
export async function updateMediaProgress(
  libraryItemId: string,
  update: MediaProgressUpdate
): Promise<MediaProgress> {
  const { supabase, user } = await requireUser()

  const progress =
    update.duration > 0
      ? Math.min(1, Math.max(0, update.currentTime / update.duration))
      : 0

  const { data, error } = await supabase
    .from('media_progress')
    .upsert(
      {
        user_id: user.id,
        library_item_id: libraryItemId,
        episode_id: update.episodeId ?? null,
        current_time_pos: update.currentTime,
        duration: update.duration,
        progress,
        is_finished: update.isFinished ?? false,
        last_update: new Date().toISOString(),
      },
      { onConflict: 'user_id,library_item_id,episode_id' }
    )
    .select()
    .single()

  if (error) throw new ApiError(error.message, 500, 'Internal Server Error')
  return data
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export interface SearchResult {
  id: string
  title: string
  media_type: string
  cover_path: string | null
  author_names: string[] | null
  series_names: string[] | null
  rank: number
}

/**
 * Full-text search across library items using the `search_library_items` RPC.
 */
export async function searchLibrary(
  libraryId: string,
  query: string,
  limit = 12
): Promise<SearchResult[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('search_library_items', {
    p_library_id: libraryId,
    p_query: query,
    p_limit: limit,
  })

  if (error) throw new ApiError(error.message, 500, 'Internal Server Error')
  return (data ?? []) as SearchResult[]
}

// ---------------------------------------------------------------------------
// Catalog helpers
// ---------------------------------------------------------------------------

/** Return all series for a library. */
export async function getLibrarySeries(libraryId: string): Promise<Series[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('series')
    .select('*')
    .eq('library_id', libraryId)
    .order('name', { ascending: true })

  if (error) throw new ApiError(error.message, 500, 'Internal Server Error')
  return data ?? []
}

/** Return all authors for a library. */
export async function getLibraryAuthors(libraryId: string): Promise<Author[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('authors')
    .select('*')
    .eq('library_id', libraryId)
    .order('name', { ascending: true })

  if (error) throw new ApiError(error.message, 500, 'Internal Server Error')
  return data ?? []
}

export type CollectionWithItems = Collection & {
  collection_items: { book_id: string; display_order: number }[]
}

/** Return all collections for a library, with their items ordered by display_order. */
export async function getLibraryCollections(libraryId: string): Promise<CollectionWithItems[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('collections')
    .select('*, collection_items(book_id, display_order)')
    .eq('library_id', libraryId)
    .order('name', { ascending: true })

  if (error) throw new ApiError(error.message, 500, 'Internal Server Error')
  return (data ?? []) as CollectionWithItems[]
}

export type PlaylistWithItems = Playlist & {
  playlist_items: { id: string; library_item_id: string; episode_id: string | null; display_order: number }[]
}

/** Return all playlists for the current user in a library. */
export async function getLibraryPlaylists(libraryId: string): Promise<PlaylistWithItems[]> {
  const { supabase, user } = await requireUser()
  const { data, error } = await supabase
    .from('playlists')
    .select('*, playlist_items(id, library_item_id, episode_id, display_order)')
    .eq('library_id', libraryId)
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  if (error) throw new ApiError(error.message, 500, 'Internal Server Error')
  return (data ?? []) as PlaylistWithItems[]
}

/** Return a single collection with items ordered by display_order, or throw ApiError(404). */
export async function getCollection(collectionId: string): Promise<CollectionWithItems> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('collections')
    .select('*, collection_items(book_id, display_order)')
    .eq('id', collectionId)
    .order('display_order', { referencedTable: 'collection_items', ascending: true })
    .maybeSingle()

  if (error) throw new ApiError(error.message, 500, 'Internal Server Error')
  if (!data) throw new ApiError(`Collection ${collectionId} not found`, 404, 'Not Found')
  return data as CollectionWithItems
}

/** Return a single series row, or throw ApiError(404). */
export async function getSeries(seriesId: string): Promise<Series> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('series')
    .select('*')
    .eq('id', seriesId)
    .maybeSingle()

  if (error) throw new ApiError(error.message, 500, 'Internal Server Error')
  if (!data) throw new ApiError(`Series ${seriesId} not found`, 404, 'Not Found')
  return data
}

/** Return a single playlist with items ordered by display_order, or throw ApiError(404). */
export async function getPlaylist(playlistId: string): Promise<PlaylistWithItems> {
  const { supabase, user } = await requireUser()
  const { data, error } = await supabase
    .from('playlists')
    .select('*, playlist_items(id, library_item_id, episode_id, display_order)')
    .eq('id', playlistId)
    .eq('user_id', user.id)
    .order('display_order', { referencedTable: 'playlist_items', ascending: true })
    .maybeSingle()

  if (error) throw new ApiError(error.message, 500, 'Internal Server Error')
  if (!data) throw new ApiError(`Playlist ${playlistId} not found`, 404, 'Not Found')
  return data as PlaylistWithItems
}

/** Return a single author row, or throw ApiError(404). */
export async function getAuthor(authorId: string): Promise<Author> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('authors')
    .select('*')
    .eq('id', authorId)
    .maybeSingle()

  if (error) throw new ApiError(error.message, 500, 'Internal Server Error')
  if (!data) throw new ApiError(`Author ${authorId} not found`, 404, 'Not Found')
  return data
}

// ---------------------------------------------------------------------------
// User / profile
// ---------------------------------------------------------------------------

export interface CurrentUser {
  id: string
  email: string | undefined
  profile: Profile
}

/**
 * Return the authenticated user combined with their profile row.
 * Throws UnauthorizedError if not authenticated.
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  const { supabase, user } = await requireUser()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error) throw new ApiError(error.message, 500, 'Internal Server Error')
  if (!profile) throw new ApiError('Profile not found', 404, 'Not Found')

  return {
    id: user.id,
    email: user.email,
    profile,
  }
}

/**
 * Return all profile rows (admin-only — enforced by RLS policy on `profiles`).
 */
export async function getUsers(): Promise<Profile[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('profiles').select('*')

  if (error) throw new ApiError(error.message, 500, 'Internal Server Error')
  return data ?? []
}

// ---------------------------------------------------------------------------
// Cover upload / remove
// ---------------------------------------------------------------------------

/**
 * Upload a cover image for a library item.
 *
 * Stores the file at `covers/{libraryItemId}/cover.jpg` and updates
 * `library_items.cover_path` with the storage path.
 */
export async function uploadCover(libraryItemId: string, file: File): Promise<string> {
  const supabase = await createClient()
  const storagePath = `${libraryItemId}/cover.jpg`

  const { error: uploadError } = await supabase.storage
    .from('covers')
    .upload(storagePath, file, { upsert: true, contentType: file.type })

  if (uploadError) throw new ApiError(uploadError.message, 500, 'Internal Server Error')

  const { error: updateError } = await supabase
    .from('library_items')
    .update({ cover_path: storagePath })
    .eq('id', libraryItemId)

  if (updateError) throw new ApiError(updateError.message, 500, 'Internal Server Error')

  return storagePath
}

/**
 * Remove the cover image for a library item and clear `cover_path`.
 */
export async function removeCover(libraryItemId: string): Promise<void> {
  const supabase = await createClient()
  const storagePath = `${libraryItemId}/cover.jpg`

  const { error: removeError } = await supabase.storage
    .from('covers')
    .remove([storagePath])

  if (removeError) throw new ApiError(removeError.message, 500, 'Internal Server Error')

  const { error: updateError } = await supabase
    .from('library_items')
    .update({ cover_path: null })
    .eq('id', libraryItemId)

  if (updateError) throw new ApiError(updateError.message, 500, 'Internal Server Error')
}

// ---------------------------------------------------------------------------
// Personalized shelves
// ---------------------------------------------------------------------------

export interface PersonalizedShelves {
  recentlyAdded: LibraryItem[]
  inProgress: LibraryItemWithProgress[]
  recentlyFinished: LibraryItemWithProgress[]
}

/**
 * Return three personalized shelves for a library in parallel:
 *  - Recently added items (last 20, ordered by added_at desc)
 *  - In-progress items (not finished, ordered by last_update desc)
 *  - Recently finished items (is_finished = true, ordered by last_update desc)
 */
export async function getPersonalizedShelves(
  libraryId: string,
  userId: string
): Promise<PersonalizedShelves> {
  const supabase = await createClient()

  const [recentlyAddedResult, inProgressResult, recentlyFinishedResult] = await Promise.all([
    // Recently added
    supabase
      .from('library_items')
      .select('*')
      .eq('library_id', libraryId)
      .order('added_at', { ascending: false })
      .limit(20),

    // In-progress: join media_progress for this user
    supabase
      .from('library_items')
      .select('*, media_progress!inner(*)')
      .eq('library_id', libraryId)
      .eq('media_progress.user_id', userId)
      .eq('media_progress.is_finished', false)
      .order('last_update', { referencedTable: 'media_progress', ascending: false })
      .limit(20),

    // Recently finished
    supabase
      .from('library_items')
      .select('*, media_progress!inner(*)')
      .eq('library_id', libraryId)
      .eq('media_progress.user_id', userId)
      .eq('media_progress.is_finished', true)
      .order('last_update', { referencedTable: 'media_progress', ascending: false })
      .limit(20),
  ])

  if (recentlyAddedResult.error)
    throw new ApiError(recentlyAddedResult.error.message, 500, 'Internal Server Error')
  if (inProgressResult.error)
    throw new ApiError(inProgressResult.error.message, 500, 'Internal Server Error')
  if (recentlyFinishedResult.error)
    throw new ApiError(recentlyFinishedResult.error.message, 500, 'Internal Server Error')

  // Flatten media_progress array to single row for LibraryItemWithProgress shape
  const flattenProgress = (
    rows: (LibraryItem & { media_progress: MediaProgress[] })[]
  ): LibraryItemWithProgress[] =>
    rows.map(({ media_progress, ...item }) => ({
      ...item,
      media_progress: media_progress?.[0] ?? null,
    }))

  return {
    recentlyAdded: recentlyAddedResult.data ?? [],
    inProgress: flattenProgress(
      (inProgressResult.data ?? []) as (LibraryItem & { media_progress: MediaProgress[] })[]
    ),
    recentlyFinished: flattenProgress(
      (recentlyFinishedResult.data ?? []) as (LibraryItem & { media_progress: MediaProgress[] })[]
    ),
  }
}
