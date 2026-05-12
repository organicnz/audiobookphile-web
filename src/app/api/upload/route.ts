import { createClient } from '@/utils/supabase/server'
import { createClient as createBrowserClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'


/**
 * POST /api/upload
 *
 * Accepts a multipart form with audio/ebook files and metadata, uploads
 * each file to Supabase Storage under `audio-files/{bookId}/{filename}`,
 * then creates a book row, library_item row (with media_id → book.id),
 * and optional author/series associations.
 *
 * Auth: reads the Supabase JWT from the Authorization: Bearer header
 * (sent by the XHR in UploadHelper.ts via getCookie() → session.access_token).
 *
 * Form fields:
 *   title    - item title
 *   author   - author name (books only)
 *   series   - series name (books only)
 *   library  - library UUID
 *   folder   - ignored (Supabase uses storage paths)
 *   0, 1, 2… - audio/ebook files
 */
export async function POST(request: NextRequest) {
  // Verify the JWT from the Authorization header
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Use the anon client with the user's JWT to get their identity
  const anonClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )

  const { data: { user }, error: userError } = await anonClient.auth.getUser(token)

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Use the server client (cookie-based) for DB operations — it has RLS context
  const supabase = await createClient()

  // Only admins/root can upload
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'root'].includes(profile.user_type)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const title = (formData.get('title') as string)?.trim()
  const author = (formData.get('author') as string)?.trim() || ''
  const series = (formData.get('series') as string)?.trim() || ''
  const libraryId = formData.get('library') as string
  const mediaType = (formData.get('mediaType') as string) || 'book'

  if (!title || !libraryId) {
    return NextResponse.json({ error: 'Missing title or library' }, { status: 400 })
  }

  // Collect all numbered file entries
  const files: File[] = []
  for (const [key, value] of formData.entries()) {
    if (/^\d+$/.test(key) && value instanceof File && value.size > 0) {
      files.push(value)
    }
  }

  if (files.length === 0) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 })
  }

  const bookId = crypto.randomUUID()
  const libraryItemId = crypto.randomUUID()
  const totalSize = files.reduce((sum, f) => sum + f.size, 0)

  // Build audio_files JSONB from the uploaded files
  const audioFilesJson = files.map((file, i) => ({
    index: i,
    ino: crypto.randomUUID(),
    metadata: {
      filename: file.name,
      ext: '.' + (file.name.split('.').pop() || ''),
      path: `audio-files/${bookId}/${file.name}`,
      relPath: file.name,
      size: file.size,
      mtimeMs: Date.now(),
      ctimeMs: Date.now(),
      birthtimeMs: Date.now(),
    },
    addedAt: Date.now(),
    updatedAt: Date.now(),
    trackNumFromMeta: null,
    discNumFromMeta: null,
    trackNumFromFilename: null,
    discNumFromFilename: null,
    manuallyVerified: false,
    invalid: false,
    exclude: false,
    error: null,
    format: null,
    duration: null,
    bitRate: null,
    language: null,
    codec: null,
    timeBase: null,
    channels: null,
    channelLayout: null,
    chapters: [],
    embeddedCoverArt: null,
    metaTags: {},
    mimeType: file.type || 'audio/mpeg',
  }))

  // 1. Create the book row first (library_items.media_id → books.id)
  const { error: bookError } = await supabase
    .from('books')
    .insert({
      id: bookId,
      title,
      audio_files: audioFilesJson,
    })

  if (bookError) {
    console.error('[upload] Failed to create book:', bookError)
    return NextResponse.json({ error: `Failed to create book: ${bookError.message}` }, { status: 500 })
  }

  // 2. Create the library_item row pointing to the book
  const { error: itemError } = await supabase
    .from('library_items')
    .insert({
      id: libraryItemId,
      library_id: libraryId,
      media_type: mediaType,
      media_id: bookId,
      path: `${libraryId}/${title}`,
      rel_path: title,
      title,
      size: totalSize,
      library_files: audioFilesJson.map((af) => ({
        ino: af.ino,
        metadata: af.metadata,
        addedAt: af.addedAt,
        updatedAt: af.updatedAt,
        isSupplementary: false,
      })),
    })

  if (itemError) {
    console.error('[upload] Failed to create library_item:', itemError)
    await supabase.from('books').delete().eq('id', bookId)
    return NextResponse.json({ error: `Failed to create library item: ${itemError.message}` }, { status: 500 })
  }

  // 3. Handle author
  if (author) {
    const authorId = crypto.randomUUID()
    const { data: existingAuthor } = await supabase
      .from('authors')
      .select('id')
      .eq('name', author)
      .eq('library_id', libraryId)
      .maybeSingle()

    const resolvedAuthorId = existingAuthor?.id ?? authorId

    if (!existingAuthor) {
      await supabase.from('authors').insert({
        id: authorId,
        name: author,
        library_id: libraryId,
      })
    }

    await supabase.from('book_authors').insert({
      book_id: bookId,
      author_id: resolvedAuthorId,
    })

    // Denormalize author name onto library_item for search
    await supabase
      .from('library_items')
      .update({ author_names_first_last: author })
      .eq('id', libraryItemId)
  }

  // 4. Handle series
  if (series) {
    const seriesId = crypto.randomUUID()
    const { data: existingSeries } = await supabase
      .from('series')
      .select('id')
      .eq('name', series)
      .eq('library_id', libraryId)
      .maybeSingle()

    const resolvedSeriesId = existingSeries?.id ?? seriesId

    if (!existingSeries) {
      await supabase.from('series').insert({
        id: seriesId,
        name: series,
        library_id: libraryId,
      })
    }

    await supabase.from('book_series').insert({
      book_id: bookId,
      series_id: resolvedSeriesId,
    })
  }

  // 5. Upload files to Supabase Storage
  const uploadErrors: string[] = []

  for (const file of files) {
    const storagePath = `${bookId}/${file.name}`
    const { error: storageError } = await supabase.storage
      .from('audio-files')
      .upload(storagePath, file, { upsert: true })

    if (storageError) {
      console.error(`[upload] Storage error for ${file.name}:`, storageError)
      uploadErrors.push(file.name)
    }
  }

  if (uploadErrors.length === files.length) {
    // All storage uploads failed — clean up DB rows
    await supabase.from('library_items').delete().eq('id', libraryItemId)
    await supabase.from('books').delete().eq('id', bookId)
    return NextResponse.json({ error: 'All file uploads to storage failed' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    libraryItemId,
    bookId,
    filesUploaded: files.length - uploadErrors.length,
    filesFailed: uploadErrors.length,
    failedFiles: uploadErrors,
  })
}
