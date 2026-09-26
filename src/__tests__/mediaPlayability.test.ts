import { describe, expect, it } from 'bun:test'
import { getBookTrackCount, isLibraryItemPlayable } from '@/shared/lib/mediaPlayability'
import type { BookMedia, LibraryItem } from '@/types/api'

function book(overrides: Partial<BookMedia> = {}): BookMedia {
  return {
    mediaType: 'book',
    metadata: {
      title: 'Test Book',
      authors: [],
      narrators: [],
      series: [],
      genres: [],
      explicit: false,
    },
    tags: [],
    ...overrides,
  }
}

function item(media: BookMedia | undefined, overrides: Record<string, unknown> = {}) {
  return {
    id: 'item-1',
    libraryId: 'lib-1',
    media,
    isMissing: false,
    isInvalid: false,
    ...overrides,
  } as unknown as LibraryItem
}

describe('getBookTrackCount', () => {
  it('counts detail-payload audioFiles', () => {
    const media = book({ audioFiles: [{ index: 0 }, { index: 1 }] as never })
    expect(getBookTrackCount(media)).toBe(2)
  })

  it('falls back to numTracks on shelf payloads (no audioFiles)', () => {
    // The shelf projection omits audio_files and carries only the
    // trigger-maintained num_tracks counter. Before this, numTracks came back
    // 0 and Play was hidden for every playable book.
    expect(getBookTrackCount(book({ numTracks: 57 }))).toBe(57)
  })

  it('prefers a populated audioFiles array over a stale counter', () => {
    const media = book({ audioFiles: [{ index: 0 }] as never, numTracks: 99 })
    expect(getBookTrackCount(media)).toBe(1)
  })

  it('falls back to a known duration when the arrays are absent', () => {
    expect(getBookTrackCount(book({ duration: 69071 }))).toBe(1)
  })

  it('returns 0 for a book with no media evidence at all', () => {
    expect(getBookTrackCount(book())).toBe(0)
  })

  it('returns 0 for null/undefined media and for podcasts', () => {
    expect(getBookTrackCount(null)).toBe(0)
    expect(getBookTrackCount(undefined)).toBe(0)
    expect(getBookTrackCount({ mediaType: 'podcast', metadata: {} } as never)).toBe(0)
  })
})

describe('isLibraryItemPlayable', () => {
  it('is true for a detail-payload book with tracks', () => {
    const media = book({ audioFiles: [{ index: 0 }] as never })
    expect(isLibraryItemPlayable(item(media))).toBe(true)
  })

  it('is true for a shelf-payload book (numTracks only) — the regression that hid Play', () => {
    expect(isLibraryItemPlayable(item(book({ numTracks: 12 })))).toBe(true)
  })

  it('is false when the backend flagged the item as missing', () => {
    const media = book({ numTracks: 5 })
    expect(isLibraryItemPlayable(item(media, { isMissing: true }))).toBe(false)
  })

  it('is false when the backend flagged the item as invalid', () => {
    const media = book({ numTracks: 5 })
    expect(isLibraryItemPlayable(item(media, { isInvalid: true }))).toBe(false)
  })

  it('is false for a book with no track evidence at all', () => {
    expect(isLibraryItemPlayable(item(book()))).toBe(false)
  })

  it('is true for a podcast with episodes', () => {
    const podcast = { mediaType: 'podcast', metadata: { title: 'Pod' }, episodes: [{ id: 'e1' }] }
    expect(isLibraryItemPlayable(item(podcast as never))).toBe(true)
  })

  it('is true for a book that only has a recentEpisode to resume', () => {
    const li = item(book(), { recentEpisode: { id: 'e1' } })
    expect(isLibraryItemPlayable(li)).toBe(true)
  })
})
