/**
 * Domain types derived from the Supabase-generated schema.
 *
 * All base types are aliases of `Tables<'table_name'>` from the generated
 * `supabase.ts` file so they stay in sync whenever the schema is regenerated.
 *
 * Requirements: 13.2, 13.3, 13.4
 */

import type { Tables } from './supabase'
import type { AudioFileModel, ChapterModel } from './schemas'

// ---------------------------------------------------------------------------
// Base table aliases
// ---------------------------------------------------------------------------

export type Library = Tables<'libraries'>
export type LibraryItem = Tables<'library_items'>
export type Author = Tables<'authors'>
export type Series = Tables<'series'>
export type AudioFile = AudioFileModel
export type Chapter = ChapterModel
export type PodcastEpisode = Tables<'podcast_episodes'>
export type MediaProgress = Tables<'media_progress'>
export type Profile = Tables<'profiles'>
export type Collection = Tables<'collections'>
export type Playlist = Tables<'playlists'>
export type Bookmark = any
export type Narrator = any

// ---------------------------------------------------------------------------
// Expanded / joined types
// ---------------------------------------------------------------------------

/**
 * A `LibraryItem` with all related entities joined in a single query.
 *
 * Matches the Supabase select string used in `getLibraryItem()`:
 *   `*, audio_files(*), chapters(*), podcast_episodes(*),
 *    book_authors(authors(*)), book_series(series(*)), book_narrators(narrators(*))`
 *
 * Requirement 13.3
 */
export type LibraryItemExpanded = LibraryItem & {
  audio_files: AudioFile[]
  chapters: Chapter[]
  podcast_episodes: PodcastEpisode[]
  /** Join rows from `book_authors` with the nested `authors` row. */
  book_authors: { authors: Author }[]
  /** Join rows from `book_series` with the nested `series` row and sequence. */
  book_series: { series: Series; sequence: string | null }[]
  /** Join rows from `book_narrators` with the nested `narrators` row. */
  book_narrators: { narrators: Narrator }[]
}

/**
 * A `LibraryItem` with the current user's media progress attached.
 *
 * `media_progress` is `null` when the user has not started the item yet.
 *
 * Requirement 13.4
 */
export type LibraryItemWithProgress = LibraryItem & {
  media_progress: MediaProgress | null
}
