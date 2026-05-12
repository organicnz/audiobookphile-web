import { createServiceRoleClient } from '@/utils/supabase/service-role'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/upload
 *
 * Accepts a multipart form with audio/ebook files and metadata, uploads
 * each file to Supabase Storage (audio-files bucket), then creates:
 *   books row → library_items row (media_id → books.id) → book_authors/book_series
 *
 * Auth: JWT from Authorization: Bearer header (sent by XHR via getCookie()).
 * DB writes: service role client (bypasses RLS; user is verified as admin/root first).
 *
 * Form fields:
 *   title     - item title (required)
 *   author    - author name (books only, optional)
 *   series    - series name (books only, optional)
 *   library   - library UUID (required)
 *   mediaType - 'book' | 'podcast' (default: 'book')
 *   folder    - ignored (Supabase uses storage paths)
 *   0, 1, 2…  - audio/ebook File objects
 */
export async function POST(request: NextRequest) {
  // ── 1. Verify the JWT from Authorization header ──────────────────────────
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify the token against Supabase Auth
  const anonClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user }, error: userError } = await anonClient.auth.getUser(token)

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── 2. Check admin/root role (service role bypasses RLS for this query) ──
  const db = createServiceRoleClient()

  const { data: profile } = await db
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'root'].includes(profile.user_type)) {
    return NextResponse.json({ error: 'Forbidden — admin or root required' }, { status: 403 })
  }

  // ── 3. Parse form data ────────────────────────────────────────────────────
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const title = (formData.get('title') as string | null)?.trim() ?? ''
  const author = (formData.get('author') as string | null)?.trim() ?? ''
  const series = (formData.get('series') as string | null)?.trim() ?? ''
  const libraryId = (formData.get('library') as string | null)?.trim() ?? ''
  const mediaType = (formData.get('mediaType') as string | null)?.trim() || 'book'

  if (!title) return NextResponse.json({ error: 'Missing title' }, { status: 400 })
  if (!libraryId) return NextResponse.json({ error: 'Missing library' }, { status: 400 })

  // Collect numbered file entries (0, 1, 2, …)
  const files: File[] = []
  for (const [key, value] of formData.entries()) {
    if (/^\d+$/.test(key) && value instanceof File && value.size > 0) {
      files.push(value)
    }
  }

  if (files.length === 0) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 })
  }

  // ── 4. Generate IDs ───────────────────────────────────────────────────────
  const bookId = crypto.randomUUID()
  const libraryItemId = crypto.randomUUID()
  const totalSize = files.reduce((sum, f) => sum + f.size, 0)

  // ── 5. Build audio_files JSONB (stored on books row) ─────────────────────
  const audioFilesJson = files.map((file, i) => ({
    index: i,
    ino: crypto.randomUUID(),
    metadata: {
      filename: file.name,
      ext: '.' + (file.name.split('.').pop()?.toLowerCase() ?? ''),
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

  // ── 6. Create book row first (library_items.media_id → books.id) ─────────
  const { error: bookError } = await db
    .from('books')
    .insert({ id: bookId, title, audio_files: audioFilesJson })

  if (bookError) {
    console.error('[upload] books insert failed:', bookError)
    return NextResponse.json({ error: `Failed to create book: ${bookError.message}` }, { status: 500 })
  }

  // ── 7. Create library_item row ────────────────────────────────────────────
  const { error: itemError } = await db
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
    console.error('[upload] library_items insert failed:', itemError)
    await db.from('books').delete().eq('id', bookId)
    return NextResponse.json({ error: `Failed to create library item: ${itemError.message}` }, { status: 500 })
  }

  // ── 8. Author ─────────────────────────────────────────────────────────────
  if (author) {
    const { data: existingAuthor } = await db
      .from('authors')
      .select('id')
      .eq('name', author)
      .eq('library_id', libraryId)
      .maybeSingle()

    let authorId = existingAuthor?.id
    if (!authorId) {
      authorId = crypto.randomUUID()
      const { error: authorError } = await db
        .from('authors')
        .insert({ id: authorId, name: author, library_id: libraryId })
      if (authorError) {
        console.warn('[upload] author insert failed (non-fatal):', authorError.message)
        authorId = undefined
      }
    }

    if (authorId) {
      await db.from('book_authors').insert({ book_id: bookId, author_id: authorId })
      await db.from('library_items').update({ author_names_first_last: author }).eq('id', libraryItemId)
    }
  }

  // ── 9. Series ─────────────────────────────────────────────────────────────
  if (series) {
    const { data: existingSeries } = await db
      .from('series')
      .select('id')
      .eq('name', series)
      .eq('library_id', libraryId)
      .maybeSingle()

    let seriesId = existingSeries?.id
    if (!seriesId) {
      seriesId = crypto.randomUUID()
      const { error: seriesError } = await db
        .from('series')
        .insert({ id: seriesId, name: series, library_id: libraryId })
      if (seriesError) {
        console.warn('[upload] series insert failed (non-fatal):', seriesError.message)
        seriesId = undefined
      }
    }

    if (seriesId) {
      await db.from('book_series').insert({ book_id: bookId, series_id: seriesId })
    }
  }

  // ── 10. Upload files to Supabase Storage ──────────────────────────────────
  const uploadErrors: string[] = []

  for (const file of files) {
    const storagePath = `${bookId}/${file.name}`
    const { error: storageError } = await db.storage
      .from('audio-files')
      .upload(storagePath, file, { upsert: true })

    if (storageError) {
      console.error(`[upload] storage upload failed for ${file.name}:`, storageError.message)
      uploadErrors.push(file.name)
    }
  }

  // If every file failed storage, roll back DB rows
  if (uploadErrors.length === files.length) {
    await db.from('library_items').delete().eq('id', libraryItemId)
    await db.from('books').delete().eq('id', bookId)
    return NextResponse.json({ error: 'All file uploads to storage failed', files: uploadErrors }, { status: 500 })
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
