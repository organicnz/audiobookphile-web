/**
 * Cover image fetching from metadata providers.
 *
 * Tries providers in order:
 *   1. iTunes Search API (highest quality for audiobooks)
 *   2. Open Library (free, no key)
 *   3. Google Books (free, no key for basic search)
 *
 * Returns the cover image data, or null if not found.
 */

export interface FetchedCover {
  buffer: ArrayBuffer
  contentType: string
  extension: string
}

/**
 * Extracts author and title from messy strings like "Author -- Title (Unabridged)"
 */
function parseRawTitle(rawTitle: string): { cleanTitle: string; extractedAuthor?: string } {
  let cleanTitle = rawTitle.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').trim()
  let extractedAuthor: string | undefined = undefined

  // If there's a strong delimiter, split it
  if (cleanTitle.includes(' -- ')) {
    const parts = cleanTitle.split(' -- ')
    if (parts.length === 2) {
      extractedAuthor = parts[0].trim()
      cleanTitle = parts[1].trim()
    }
  } else if (cleanTitle.includes(' - ')) {
    const parts = cleanTitle.split(' - ')
    if (parts.length === 2) {
      extractedAuthor = parts[0].trim()
      cleanTitle = parts[1].trim()
    }
  }

  return { cleanTitle, extractedAuthor }
}

function getExtensionFromType(contentType: string): string {
  if (contentType.includes('png')) return 'png'
  if (contentType.includes('webp')) return 'webp'
  if (contentType.includes('gif')) return 'gif'
  return 'jpg'
}

/**
 * Fetch a cover image for a book by title and/or author.
 */
export async function fetchBookCover(
  title: string,
  author?: string
): Promise<FetchedCover | null> {
  const { cleanTitle, extractedAuthor } = parseRawTitle(title)
  const searchAuthor = author || extractedAuthor

  // Try iTunes first
  const itunesCover = await fetchFromITunes(cleanTitle, searchAuthor)
  if (itunesCover) return itunesCover

  // Try Open Library next
  const olCover = await fetchFromOpenLibrary(cleanTitle, searchAuthor)
  if (olCover) return olCover

  // Fall back to Google Books
  const gbCover = await fetchFromGoogleBooks(cleanTitle, searchAuthor)
  if (gbCover) return gbCover

  return null
}

async function fetchFromITunes(title: string, author?: string): Promise<FetchedCover | null> {
  try {
    const queryTerm = author ? `${title} ${author}` : title
    const searchRes = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(queryTerm)}&media=audiobook&limit=1`,
      { signal: AbortSignal.timeout(8000) }
    )
    if (!searchRes.ok) return null

    const data = await searchRes.json()
    if (!data?.results?.length) return null

    const item = data.results[0]
    if (!item.artworkUrl100) return null

    // Upgrade to 600x600 resolution
    const imgUrl = item.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg')
    const imgRes = await fetch(imgUrl, { signal: AbortSignal.timeout(10000) })
    if (!imgRes.ok) return null

    const contentType = imgRes.headers.get('content-type') || 'image/jpeg'
    const buffer = await imgRes.arrayBuffer()
    if (buffer.byteLength < 5000) return null

    return { buffer, contentType, extension: getExtensionFromType(contentType) }
  } catch {
    return null
  }
}

async function fetchFromOpenLibrary(title: string, author?: string): Promise<FetchedCover | null> {
  try {
    const queryTerm = author ? `${title} ${author}` : title
    const query = new URLSearchParams({ q: queryTerm, limit: '5' })

    const searchRes = await fetch(
      `https://openlibrary.org/search.json?${query.toString()}`,
      { signal: AbortSignal.timeout(8000) }
    )
    if (!searchRes.ok) return null

    const data = await searchRes.json()
    const docs = data?.docs as any[]
    if (!docs?.length) return null

    const withCover = docs.find((d) => d.cover_i)
    if (!withCover?.cover_i) return null

    const coverId = withCover.cover_i
    const imgRes = await fetch(
      `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`,
      { signal: AbortSignal.timeout(10000) }
    )
    if (!imgRes.ok) return null

    const contentType = imgRes.headers.get('content-type') || 'image/jpeg'
    if (!contentType.includes('jpeg') && !contentType.includes('jpg') && !contentType.includes('png')) return null

    const buffer = await imgRes.arrayBuffer()
    if (buffer.byteLength < 5000) return null

    return { buffer, contentType, extension: getExtensionFromType(contentType) }
  } catch {
    return null
  }
}

async function fetchFromGoogleBooks(title: string, author?: string): Promise<FetchedCover | null> {
  try {
    const queryTerm = author ? `${title} ${author}` : title
    const searchRes = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(queryTerm)}&maxResults=5&printType=books`,
      { signal: AbortSignal.timeout(8000) }
    )
    if (!searchRes.ok) return null

    const data = await searchRes.json()
    const items = data?.items as any[]
    if (!items?.length) return null

    const withImage = items.find((item) => item.volumeInfo?.imageLinks?.thumbnail)
    if (!withImage) return null

    let imgUrl: string =
      withImage.volumeInfo.imageLinks.extraLarge ||
      withImage.volumeInfo.imageLinks.large ||
      withImage.volumeInfo.imageLinks.thumbnail

    imgUrl = imgUrl.replace('http://', 'https://').replace('&edge=curl', '')

    const imgRes = await fetch(imgUrl, { signal: AbortSignal.timeout(10000) })
    if (!imgRes.ok) return null

    const contentType = imgRes.headers.get('content-type') || 'image/jpeg'
    const buffer = await imgRes.arrayBuffer()
    if (buffer.byteLength < 5000) return null

    return { buffer, contentType, extension: getExtensionFromType(contentType) }
  } catch {
    return null
  }
}
