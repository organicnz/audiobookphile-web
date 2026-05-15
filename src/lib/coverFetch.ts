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
 * Aggressively cleans up messy titles/authors for better API matching.
 * Handles patterns like:
 *   - [AB].Isaac.Asimov.Foundation.Audio.Books...
 *   - Author -- Title (Unabridged)
 *   - Title_With_Underscores
 */
function normalizeString(str: string): string {
  if (!str) return ''
  
  let cleaned = str
    // 1. Split CamelCase/PascalCase (e.g. TheThreeBody -> The Three Body)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // 2. Remove bracketed content [AB], [Unabridged], etc.
    .replace(/\[[^\]]*\]/g, ' ')
    // 3. Remove parenthesized content (Unabridged), (Part 1), etc.
    .replace(/\([^)]*\)/g, ' ')
    // 4. Replace dots, underscores, and dashes with spaces
    .replace(/[\._-]/g, ' ')
    // 5. Remove common audiobook suffixes that confuse search APIs
    .replace(/\b(audiobook|unabridged|abridged|collection|series|vol|volume|book|complete|part|chapter|of|v\d+)\b/gi, ' ')
    // 6. Clean up extra whitespace
    .replace(/\s+/g, ' ')
    .trim()

  return cleaned
}

function parseRawTitle(rawTitle: string): { cleanTitle: string; extractedAuthor?: string } {
  let title = rawTitle
  let author: string | undefined = undefined

  // Split by common delimiters if present
  if (title.includes(' -- ')) {
    const parts = title.split(' -- ')
    author = normalizeString(parts[0])
    title = normalizeString(parts[1])
  } else if (title.includes(' - ')) {
    const parts = title.split(' - ')
    author = normalizeString(parts[0])
    title = normalizeString(parts[1])
  } else {
    title = normalizeString(title)
  }

  return { cleanTitle: title, extractedAuthor: author }
}

function getExtensionFromType(contentType: string): string {
  if (contentType.includes('png')) return 'png'
  if (contentType.includes('webp')) return 'webp'
  if (contentType.includes('gif')) return 'gif'
  return 'jpg'
}

/**
 * Fetch a cover image for a book by title and/or author.
 * Uses a multi-pass strategy to maximize match chances.
 */
export async function fetchBookCover(
  title: string,
  author?: string
): Promise<FetchedCover | null> {
  const { cleanTitle, extractedAuthor } = parseRawTitle(title)
  const cleanAuthor = author ? normalizeString(author) : extractedAuthor

  // List of search strategies in order of specificity
  const strategies = [
    { title: cleanTitle, author: cleanAuthor }, // Most specific
    { title: cleanTitle }, // Title only (good for distinct titles)
  ]

  // If title is very long, add a truncated strategy
  const words = cleanTitle.split(' ')
  if (words.length > 5) {
    strategies.push({ title: words.slice(0, 4).join(' ') })
  }

  const providers = [fetchFromITunes, fetchFromOpenLibrary, fetchFromGoogleBooks]

  for (const strategy of strategies) {
    if (!strategy.title) continue
    
    for (const provider of providers) {
      try {
        const result = await provider(strategy.title, strategy.author)
        if (result) return result
      } catch (err) {
        console.warn(`[coverFetch] Provider failed for "${strategy.title}":`, err)
      }
    }
  }

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
    if (!data?.results?.length) {
      // If we used author and failed, try title only as a sub-fallback within this provider
      if (author) return fetchFromITunes(title)
      return null
    }

    const item = data.results[0]
    if (!item.artworkUrl100) return null

    // Upgrade to 600x600 resolution
    const imgUrl = item.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg')
    const imgRes = await fetch(imgUrl, { signal: AbortSignal.timeout(10000) })
    if (!imgRes.ok) return null

    const contentType = imgRes.headers.get('content-type') || 'image/jpeg'
    const buffer = await imgRes.arrayBuffer()
    if (buffer.byteLength < 3000) return null

    return { buffer, contentType, extension: getExtensionFromType(contentType) }
  } catch {
    return null
  }
}

async function fetchFromOpenLibrary(title: string, author?: string): Promise<FetchedCover | null> {
  try {
    const queryTerm = author ? `${title} ${author}` : title
    const query = new URLSearchParams({ q: queryTerm, limit: '3' })

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
    // Skip small/invalid response
    if (contentType.includes('text/html')) return null

    const buffer = await imgRes.arrayBuffer()
    if (buffer.byteLength < 3000) return null

    return { buffer, contentType, extension: getExtensionFromType(contentType) }
  } catch {
    return null
  }
}

async function fetchFromGoogleBooks(title: string, author?: string): Promise<FetchedCover | null> {
  try {
    const queryTerm = author ? `${title} ${author}` : title
    const searchRes = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(queryTerm)}&maxResults=3&printType=books`,
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
    if (buffer.byteLength < 3000) return null

    return { buffer, contentType, extension: getExtensionFromType(contentType) }
  } catch {
    return null
  }
}
