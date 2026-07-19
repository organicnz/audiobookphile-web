import type { LibraryItem } from '@/types/api'

/**
 * Build cover URL for a library item
 * @param libraryItemId
 * @param timestamp - Optional timestamp for cache busting (typically updatedAt)
 * @param raw - If true, requests raw cover without server-side processing
 * @returns Cover URL
 */
export function getLibraryItemCoverUrl(libraryItemId: string, timestamp?: number | null, raw: boolean = false): string {
  const params = new URLSearchParams()
  params.set('ts', String(timestamp || Date.now()))
  if (raw) {
    params.set('raw', '1')
  }
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:54321/functions/v1/api'
  return `${apiUrl}/items/${libraryItemId}/cover?${params.toString()}`
}

/**
 * Build URL for a library file (requires authentication)
 *
 * Authentication is handled via httpOnly cookies through the Next.js internal API proxy.
 * The browser automatically includes the access_token cookie with the request.
 * If the token expires, the Next.js proxy will refresh the session automatically.
 *
 * @param libraryItemId
 * @param fileIno - The file inode value
 * @returns Library file URL (authentication via cookies)
 */
export function getLibraryFileUrl(libraryItemId: string, fileIno: string): string {
  return `/internal-api/items/${libraryItemId}/file/${fileIno}`
}

/**
 * Get placeholder cover image URL
 */
export function getPlaceholderCoverUrl(): string {
  return '/images/book_placeholder.jpg'
}

export function getLibraryItemCoverSrc(libraryItem: { id: string; updatedAt?: number }, placeholder: string): string {
  // Always return the dynamic API URL so that the backend can attempt to fetch missing covers on the fly.
  // The API will return a 404 if it truly cannot find one, at which point the frontend will fall back to the placeholder via the `onError` handler in MediaCardCover.
  const timestamp = 'updatedAt' in libraryItem ? libraryItem.updatedAt : undefined
  return getLibraryItemCoverUrl(libraryItem.id, timestamp ?? null)
}

/**
 * Get cover aspect ratio from cover aspect ratio setting
 * coverAspectRatioSetting is 0 or 1
 * 0 = standard (1.6)
 * 1 = square (1)
 */
export function getCoverAspectRatio(coverAspectRatioSetting: 0 | 1 | undefined): number {
  if (coverAspectRatioSetting === 1) {
    return 1
  } else {
    return 1.6
  }
}
