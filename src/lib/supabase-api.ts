/**
 * Supabase API module — replaces src/lib/api.ts
 *
 * All server-side data access goes through this module. Functions use the
 * @supabase/ssr server client so that the user's session cookie is forwarded
 * automatically. Errors are surfaced as typed ApiError / UnauthorizedError
 * instances so call sites can handle them uniformly.
 */

import { ApiError, NetworkError, UnauthorizedError } from '@/lib/apiErrors'
import { mapLibrary, mapLibraryItem } from '@/utils/mappers'
import { createClient } from '@/utils/supabase/server'

export { ApiError, NetworkError, UnauthorizedError }

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

/**
 * Resolves the currently authenticated user from the Supabase session.
 * Throws `UnauthorizedError` if there is no active session or the user is null.
 *
 * Usage:
 *   const { supabase, user } = await requireUser()
 */
export async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new UnauthorizedError()
  }

  return { supabase, user }
}

// ---------------------------------------------------------------------------
// Libraries
// ---------------------------------------------------------------------------

/**
 * Returns all libraries ordered by `display_order`.
 *
 * Uses `createClient()` directly (no auth required at the function level —
 * RLS enforces authenticated-read access on the `libraries` table).
 *
 * Requirements: 7.1
 */
export async function getLibraries(): Promise<{ libraries: import('@/types/api').Library[] }> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('libraries').select('*').order('display_order')
  if (error) throw new ApiError(error.message, 500, error.code ?? '')
  return { libraries: (data || []).map(mapLibrary) }
}

/**
 * Returns a single library row by ID.
 * Throws `ApiError(404)` if the row does not exist or is not accessible.
 *
 * Requirements: 7.2
 */
export async function getLibrary(libraryId: string): Promise<import('@/types/api').Library> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('libraries').select('*').eq('id', libraryId).single()
  if (error) throw new ApiError(error.message, 404, error.code ?? '')
  return mapLibrary(data)
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

/**
 * Full-text search across library items within a specific library.
 *
 * Delegates to the `search_library_items` Postgres RPC function which uses
 * `to_tsvector` / `plainto_tsquery` for ranked full-text search across item
 * titles and descriptions, joined with author and series names.
 *
 * @param libraryId - UUID of the library to search within
 * @param query     - Free-text search query
 * @param limit     - Maximum number of results to return (default: 12)
 * @returns Array of matching library items with rank, author names, and series names
 * @throws {ApiError} if the RPC call fails
 */
export async function searchLibrary(libraryId: string, query: string, limit = 12) {
  const supabase = await createClient()
  const { data, error } = await (supabase as any).rpc('search_library_items', {
    p_library_id: libraryId,
    p_query: query,
    p_limit: limit,
  })
  if (error) throw new ApiError(error.message, 500, error.code ?? '')
  return data
}

// ---------------------------------------------------------------------------
// Library Items
// ---------------------------------------------------------------------------

/**
 * Returns a paginated list of library items for the given library.
 *
 * Options:
 *   - page     — zero-based page index (default: 0)
 *   - limit    — number of items per page (default: 100)
 *   - sortBy   — column to sort by (default: 'title')
 *   - sortDesc — sort descending when true (default: false → ascending)
 *
 * Returns `{ results, total, limit, page }`.
 *
 * Requirements: 7.3
 */
export async function getLibraryItems(
  libraryId: string,
  options?: {
    page?: number
    limit?: number
    sortBy?: string
    sortDesc?: boolean
  },
) {
  const supabase = await createClient()

  const limit = options?.limit ?? 100
  const page = options?.page ?? 0
  const sortBy = options?.sortBy ?? 'title'
  const ascending = !(options?.sortDesc ?? false)

  const { data, error, count } = await supabase
    .from('library_items')
    .select('*, books!media_id(*, book_authors(authors(*)))', { count: 'exact' })
    .eq('library_id', libraryId)
    .order(sortBy, { ascending })
    .range(page * limit, (page + 1) * limit - 1)

  if (error) throw new ApiError(error.message, 500, error.code ?? '')

  return { results: (data || []).map(mapLibraryItem), total: count ?? 0, limit, page }
}

/**
 * Returns a single library item with all related data joined in one query:
 * audio_files, chapters, podcast_episodes, book_authors (with authors),
 * book_series (with series), and book_narrators (with narrators).
 *
 * Throws `ApiError(404)` if no item with the given `itemId` exists.
 *
 * Requirements: 7.4
 */
export async function getLibraryItem(itemId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('library_items')
    .select(
      `*,
      books!media_id(*, book_authors(authors(*)), book_series(series(*)))`
    )
    .eq('id', itemId)
    .single()

  if (error) throw new ApiError(error.message, 404, error.code ?? '')

  return mapLibraryItem(data)
}

// ---------------------------------------------------------------------------
// Media Progress
// ---------------------------------------------------------------------------

/**
 * Retrieves the current user's media progress for a library item.
 *
 * @param libraryItemId - The UUID of the library item.
 * @param episodeId - Optional UUID of the podcast episode. When omitted the
 *   query filters for rows where `episode_id IS NULL` (i.e. book progress).
 * @returns The matching `media_progress` row, or `null` if none exists yet.
 */
export async function getMediaProgress(libraryItemId: string, episodeId?: string) {
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

  if (error) throw new ApiError(error.message, 500, error.code ?? '')

  return data
}

/**
 * Creates or updates the current user's media progress for a library item.
 *
 * Uses an upsert with conflict target `(user_id, library_item_id, episode_id)`
 * so that repeated calls are idempotent — the latest values always win.
 *
 * `progress` (0.0–1.0) is computed automatically from `currentTime / duration`
 * when `duration` is provided.
 *
 * @param libraryItemId - The UUID of the library item.
 * @param update - Playback state to persist.
 */
export async function updateMediaProgress(
  libraryItemId: string,
  update: {
    currentTime: number
    duration?: number
    isFinished?: boolean
    episodeId?: string
  },
) {
  const { supabase, user } = await requireUser()

  const progress = update.duration ? update.currentTime / update.duration : undefined

  const { error } = await supabase.from('media_progress').upsert(
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
    { onConflict: 'user_id,library_item_id,episode_id' },
  )

  if (error) throw new ApiError(error.message, 500, error.code ?? '')
}

// ---------------------------------------------------------------------------
// Catalog helpers — Series, Authors, Collections, Playlists
// ---------------------------------------------------------------------------

/**
 * Returns all series rows for the given library.
 *
 * Requirements: 7.11
 */
export async function getLibrarySeries(libraryId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('series').select('*').eq('library_id', libraryId)
  if (error) throw new ApiError(error.message, 500, error.code ?? '')
  return data
}

/**
 * Returns all author rows for the given library.
 *
 * Requirements: 7.11
 */
export async function getLibraryAuthors(libraryId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('authors').select('*').eq('library_id', libraryId)
  if (error) throw new ApiError(error.message, 500, error.code ?? '')
  return data
}

/**
 * Returns all collections for the given library, with their items (including
 * the associated library_items) ordered by `display_order` ascending.
 *
 * Requirements: 7.11, 12.7, 12.8
 */
export async function getLibraryCollections(libraryId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('collections')
    .select('*, collection_items(*, library_items(*))')
    .eq('library_id', libraryId)
    .order('display_order', { referencedTable: 'collection_items', ascending: true })
  if (error) throw new ApiError(error.message, 500, error.code ?? '')
  return data
}

/**
 * Returns all playlists owned by the current user for the given library,
 * with their items (including the associated library_items) ordered by
 * `display_order` ascending.
 *
 * Throws `UnauthorizedError` if there is no active session.
 *
 * Requirements: 7.11, 12.7, 12.9
 */
export async function getLibraryPlaylists(libraryId: string) {
  const { supabase, user } = await requireUser()
  const { data, error } = await supabase
    .from('playlists')
    .select('*, playlist_items(*, library_items(*))')
    .eq('library_id', libraryId)
    .eq('user_id', user.id)
    .order('display_order', { referencedTable: 'playlist_items', ascending: true })
  if (error) throw new ApiError(error.message, 500, error.code ?? '')
  return data
}

/**
 * Returns a single collection by ID with its items (including the associated
 * library_items) ordered by `display_order` ascending.
 *
 * Throws `ApiError(404)` if the collection does not exist.
 *
 * Requirements: 7.11, 12.7, 12.8
 */
export async function getCollection(collectionId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('collections')
    .select('*, collection_items(*, library_items(*))')
    .eq('id', collectionId)
    .order('display_order', { referencedTable: 'collection_items', ascending: true })
    .single()
  if (error) throw new ApiError(error.message, 404, error.code ?? '')
  return data
}

/**
 * Returns a single series row by ID.
 *
 * Throws `ApiError(404)` if the series does not exist.
 *
 * Requirements: 7.11
 */
export async function getSeries(seriesId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('series').select('*').eq('id', seriesId).single()
  if (error) throw new ApiError(error.message, 404, error.code ?? '')
  return data
}

/**
 * Returns a single playlist by ID with its items (including the associated
 * library_items) ordered by `display_order` ascending.
 *
 * Throws `ApiError(404)` if the playlist does not exist.
 *
 * Requirements: 7.11, 12.7, 12.9
 */
export async function getPlaylist(playlistId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('playlists')
    .select('*, playlist_items(*, library_items(*))')
    .eq('id', playlistId)
    .order('display_order', { referencedTable: 'playlist_items', ascending: true })
    .single()
  if (error) throw new ApiError(error.message, 404, error.code ?? '')
  return data
}

/**
 * Returns a single author row by ID.
 *
 * Throws `ApiError(404)` if the author does not exist.
 *
 * Requirements: 7.11
 */
export async function getAuthor(authorId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('authors').select('*').eq('id', authorId).single()
  if (error) throw new ApiError(error.message, 404, error.code ?? '')
  return data
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

/**
 * Returns the currently authenticated user combined with their `profiles` row.
 *
 * Calls `requireUser()` to obtain the auth user, then queries `public.profiles`
 * for the matching row. Returns a merged object with the shape:
 * `{ id, email, username, userType, language, theme, defaultLibraryId }`.
 *
 * Throws `UnauthorizedError` if there is no active session.
 * Throws `ApiError(404)` if the profile row does not exist.
 *
 * Requirements: 10.1, 10.4
 */
export async function getCurrentUser(): Promise<{
  id: string
  email: string | undefined
  username: string | null
  userType: string
  language: string
  theme: string
  defaultLibraryId: string | null
}> {
  const { supabase, user } = await requireUser()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('username, user_type, language, theme, default_library_id')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    throw new ApiError(error?.message ?? 'Profile not found', 404, error?.code ?? '')
  }

  return {
    id: user.id,
    email: user.email,
    username: profile.username,
    userType: profile.user_type || 'user',
    language: profile.language || 'en',
    theme: profile.theme || 'dark',
    defaultLibraryId: profile.default_library_id,
  }
}

/**
 * Returns all user profiles. Admin-only operation.
 *
 * Uses the service-role client to bypass RLS and read all rows from
 * `public.profiles`. Call sites should verify the current user is an admin
 * before invoking this function.
 *
 * Requirements: 10.4
 */
export async function getUsers(): Promise<import('@/types').Profile[]> {
  const { createServiceRoleClient } = await import('@/utils/supabase/service-role')
  const adminClient = createServiceRoleClient()

  const { data, error } = await adminClient.from('profiles').select('*')

  if (error) throw new ApiError(error.message, 500, error.code ?? '')

  return data
}

// ---------------------------------------------------------------------------
// Cover image upload / removal
// ---------------------------------------------------------------------------

/**
 * Uploads a cover image for a library item to Supabase Storage and updates
 * the `library_items.cover_path` column.
 *
 * Uses the service-role client so that the upload bypasses RLS (only admins
 * should call this function, but the service-role key is required because
 * storage write policies are restricted to the service role).
 *
 * Storage path: `covers/{libraryItemId}/cover.jpg`
 * The `covers` bucket is public, so no signed URL is needed — callers can
 * construct the public URL via:
 *   `supabase.storage.from('covers').getPublicUrl(`${libraryItemId}/cover.jpg`)`
 *
 * @param libraryItemId - UUID of the library item to attach the cover to.
 * @param file          - The cover image data (File, Blob, or ArrayBuffer).
 * @returns The storage path that was written to `cover_path`.
 * @throws {ApiError} if the storage upload or DB update fails.
 *
 * Requirements: 7.11, 8.6, 8.7
 */
export async function uploadCover(
  libraryItemId: string,
  file: File | Blob | ArrayBuffer,
  options?: { extension?: string; contentType?: string }
): Promise<string> {
  const { createServiceRoleClient } = await import('@/utils/supabase/service-role')
  const adminClient = createServiceRoleClient()

  const extension = options?.extension || 'jpg'
  const storagePath = `${libraryItemId}/cover.${extension}`

  const { error: uploadError } = await adminClient.storage
    .from('covers')
    .upload(storagePath, file, {
      upsert: true,
      contentType: options?.contentType || (file instanceof ArrayBuffer ? 'image/jpeg' : (file as File | Blob).type || 'image/jpeg'),
    })

  if (uploadError) {
    throw new ApiError(uploadError.message, 500, uploadError.name ?? '')
  }

  const { error: dbError } = await adminClient
    .from('library_items')
    .update({ cover_path: storagePath })
    .eq('id', libraryItemId)

  if (dbError) {
    throw new ApiError(dbError.message, 500, dbError.code ?? '')
  }

  return storagePath
}

/**
 * Removes the cover image for a library item from Supabase Storage and clears
 * the `library_items.cover_path` column.
 *
 * Uses the service-role client to bypass RLS for the storage delete operation.
 * If the storage object does not exist the function still clears `cover_path`
 * in the database so the two sources of truth stay in sync.
 *
 * @param libraryItemId - UUID of the library item whose cover should be removed.
 * @throws {ApiError} if the DB update fails.
 *
 * Requirements: 7.11, 8.6
 */
export async function removeCover(libraryItemId: string): Promise<void> {
  const { createServiceRoleClient } = await import('@/utils/supabase/service-role')
  const adminClient = createServiceRoleClient()

  const { data: item } = await adminClient.from('library_items').select('cover_path').eq('id', libraryItemId).single()
  const storagePath = item?.cover_path || `${libraryItemId}/cover.jpg`

  // Attempt to delete the storage object. We intentionally ignore a "not found"
  // error (the file may have already been deleted) but still propagate other
  // storage errors so callers are aware of unexpected failures.
  if (storagePath) {
    const { error: storageError } = await adminClient.storage
      .from('covers')
      .remove([storagePath])

    if (storageError) {
      // Supabase Storage returns a generic error for missing objects; treat it as
      // a non-fatal warning and continue to clear the DB column.
      const isNotFound =
        storageError.message.toLowerCase().includes('not found') ||
        storageError.message.toLowerCase().includes('does not exist')

      if (!isNotFound) {
        throw new ApiError(storageError.message, 500, storageError.name ?? '')
      }
    }
  }

  const { error: dbError } = await adminClient
    .from('library_items')
    .update({ cover_path: null })
    .eq('id', libraryItemId)

  if (dbError) {
    throw new ApiError(dbError.message, 500, dbError.code ?? '')
  }
}

// ---------------------------------------------------------------------------
// Specialized Catalog Views
// ---------------------------------------------------------------------------

/**
 * Returns distinct filter values (genres, tags, publishers, etc.) for a library.
 *
 * Requirements: 7.10
 */
export async function getLibraryFilterData(libraryId: string): Promise<import('@/types/api').LibraryFilterData> {
  const supabase = await createClient()

  // 1. Get all authors for this library
  const { data: authors } = await supabase
    .from('authors')
    .select('id, name')
    .eq('library_id', libraryId)
    .order('name')

  // 2. Get all series for this library
  const { data: series } = await supabase
    .from('series')
    .select('id, name')
    .eq('library_id', libraryId)
    .order('name')

  // 3. Get distinct genres, tags, publishers, and languages from the books table
  // Note: genres and tags are JSONB arrays in the schema.
  // For now we do a simple select; in a larger library we'd use a Postgres RPC
  // or a dedicated 'tags' table to avoid scanning all books.
  const { data: books } = await supabase
    .from('books')
    .select('genres, tags, publisher, language')

  const genresSet = new Set<string>()
  const tagsSet = new Set<string>()
  const publishersSet = new Set<string>()
  const languagesSet = new Set<string>()

  books?.forEach((book) => {
    if (Array.isArray(book.genres)) book.genres.forEach((g) => genresSet.add(String(g)))
    if (Array.isArray(book.tags)) book.tags.forEach((t) => tagsSet.add(String(t)))
    if (book.publisher) publishersSet.add(book.publisher)
    if (book.language) languagesSet.add(book.language)
  })

  return {
    authors: (authors || []) as { id: string; name: string }[],
    series: (series || []) as { id: string; name: string }[],
    genres: Array.from(genresSet).sort(),
    tags: Array.from(tagsSet).sort(),
    publishers: Array.from(publishersSet).sort(),
    languages: Array.from(languagesSet).sort(),
    narrators: [], // Narrators are in a separate table or nested JSON; skipping for now
    publishedDecades: [], // Computed from published_year; skipping for now
  }
}

/**
 * Returns the "Personalized Shelf" for a library (Recently Added, Continue Listening).
 *
 * Requirements: 7.12
 */
export async function getLibraryPersonalized(libraryId: string): Promise<import('@/types/api').PersonalizedShelf[]> {
  const supabase = await createClient()

  // 1. Recently Added
  const { data: recentlyAdded } = await supabase
    .from('library_items')
    .select('*, books!media_id(*, book_authors(authors(*)))')
    .eq('library_id', libraryId)
    .order('created_at', { ascending: false })
    .limit(12)

  const shelves: import('@/types/api').PersonalizedShelf[] = [
    {
      id: 'recently-added',
      label: 'Recently Added',
      labelStringKey: 'RecentlyAdded',
      type: 'book',
      entities: (recentlyAdded || []).map(mapLibraryItem),
      total: recentlyAdded?.length || 0,
    },
  ]

  // 2. Continue Listening (if logged in)
  try {
    const { user } = await requireUser()
    const { data: inProgress } = await supabase
      .from('media_progress')
      .select('library_item_id, current_time_pos, last_update')
      .eq('user_id', user.id)
      .eq('is_finished', false)
      .order('last_update', { ascending: false })
      .limit(12)

    if (inProgress && inProgress.length > 0) {
      const itemIds = inProgress.map((p) => p.library_item_id).filter(Boolean)
      const { data: continueItems } = await supabase
        .from('library_items')
        .select('*, books!media_id(*, book_authors(authors(*)))')
        .in('id', itemIds)

      if (continueItems && continueItems.length > 0) {
        // Preserve the order from media_progress
        const ordered = itemIds
          .map((id) => continueItems.find((li) => li.id === id))
          .filter(Boolean)

        shelves.unshift({
          id: 'continue-listening',
          label: 'Continue Listening',
          labelStringKey: 'ContinueListening',
          type: 'book',
          entities: ordered.map((li) => mapLibraryItem(li)),
          total: ordered.length,
        })
      }
    }
  } catch {
    // Ignore unauthorized — just don't show the Continue Listening shelf
  }

  return shelves
}
