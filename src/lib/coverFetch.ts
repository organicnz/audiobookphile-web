/**
 * Cover image fetching from metadata providers.
 *
 * Tries providers in order:
 *   1. Open Library (free, no key)
 *   2. Google Books (free, no key for basic search)
 *
 * Returns the cover image as an ArrayBuffer, or null if not found.
 */

/**
 * Fetch a cover image for a book by title and/or author.
 * Returns the image as ArrayBuffer, or null if nothing found.
 */
export async function fetchBookCover(
  title: string,
  author?: string
): Promise<ArrayBuffer | null> {
  // Try Open Library first
  const olCover = await fetchFromOpenLibrary(title, author)
  if (olCover) return olCover

  // Fall back to Google Books
  const gbCover = await fetchFromGoogleBooks(title, author)
  if (gbCover) return gbCover

  return null
}

/**
 * Open Library cover fetch.
 * Searches by title+author, gets the first result's cover ID,
 * then fetches the large cover image.
 */
async function fetchFromOpenLibrary(
  title: string,
  author?: string
): Promise<ArrayBuffer | null> {
  try {
    // Clean the title by removing common filename artifacts like (Unabridged), [Audiobook], etc.
    const cleanTitle = title.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').trim()
    
    // Use a general query 'q' instead of strict 'title' to allow fuzzy matching
    // especially helpful when titles contain author names or messy metadata
    const queryTerm = author ? `${cleanTitle} ${author}` : cleanTitle
    const query = new URLSearchParams({ q: queryTerm, limit: '5' })

    const searchRes = await fetch(
      `https://openlibrary.org/search.json?${query.toString()}`,
      { signal: AbortSignal.timeout(8000) }
    )
    if (!searchRes.ok) return null

    const data = await searchRes.json()
    const docs = data?.docs as any[]
    if (!docs?.length) return null

    // Find first result with a cover
    const withCover = docs.find((d) => d.cover_i)
    if (!withCover?.cover_i) return null

    const coverId = withCover.cover_i
    const imgRes = await fetch(
      `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`,
      { signal: AbortSignal.timeout(10000) }
    )
    if (!imgRes.ok) return null

    // Open Library returns a 1x1 gif for missing covers
    const contentType = imgRes.headers.get('content-type') ?? ''
    if (!contentType.includes('jpeg') && !contentType.includes('jpg')) return null

    const buffer = await imgRes.arrayBuffer()
    // Reject tiny images (likely placeholder)
    if (buffer.byteLength < 5000) return null

    return buffer
  } catch {
    return null
  }
}

/**
 * Google Books cover fetch.
 * Searches by title+author, gets the first result's thumbnail URL,
 * then fetches the full-size image.
 */
async function fetchFromGoogleBooks(
  title: string,
  author?: string
): Promise<ArrayBuffer | null> {
  try {
    const cleanTitle = title.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').trim()
    
    // Drop the strict 'intitle:' and 'inauthor:' prefixes so Google's search engine 
    // can intelligently parse messy filenames like "Sagan, Carl -- The Demon-Haunted..."
    const q = author ? `${cleanTitle} ${author}` : cleanTitle
    const searchRes = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=5&printType=books`,
      { signal: AbortSignal.timeout(8000) }
    )
    if (!searchRes.ok) return null

    const data = await searchRes.json()
    const items = data?.items as any[]
    if (!items?.length) return null

    // Find first result with a thumbnail
    const withImage = items.find(
      (item) => item.volumeInfo?.imageLinks?.thumbnail
    )
    if (!withImage) return null

    // Upgrade to larger image: replace zoom=1 with zoom=3, or use extraLarge
    let imgUrl: string =
      withImage.volumeInfo.imageLinks.extraLarge ||
      withImage.volumeInfo.imageLinks.large ||
      withImage.volumeInfo.imageLinks.thumbnail

    // Force HTTPS and remove curl parameter
    imgUrl = imgUrl.replace('http://', 'https://').replace('&edge=curl', '')

    const imgRes = await fetch(imgUrl, { signal: AbortSignal.timeout(10000) })
    if (!imgRes.ok) return null

    const buffer = await imgRes.arrayBuffer()
    if (buffer.byteLength < 5000) return null

    return buffer
  } catch {
    return null
  }
}
