import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/upload
 *
 * Accepts a multipart form with audio/ebook files and metadata, uploads
 * each file to Supabase Storage under `audio-files/{libraryId}/{title}/`,
 * then creates a library_item row and associated book/audio_file rows.
 *
 * Form fields:
 *   title    - item title
 *   author   - author name (books only)
 *   series   - series name (books only)
 *   library  - library UUID
 *   folder   - folder ID (ignored — Supabase uses storage paths)
 *   0, 1, 2… - audio/ebook files
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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

  const title = formData.get('title') as string
  const author = (formData.get('author') as string) || ''
  const series = (formData.get('series') as string) || ''
  const libraryId = formData.get('library') as string

  if (!title || !libraryId) {
    return NextResponse.json({ error: 'Missing title or library' }, { status: 400 })
  }

  // Collect all numbered file entries
  const files: File[] = []
  for (const [key, value] of formData.entries()) {
    if (/^\d+$/.test(key) && value instanceof File) {
      files.push(value)
    }
  }

  if (files.length === 0) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 })
  }

  // Create the library_item row first
  const { data: libraryItem, error: itemError } = await supabase
    .from('library_items')
    .insert({
      library_id: libraryId,
      media_type: 'book',
      path: `${libraryId}/${title}`,
    })
    .select('id')
    .single()

  if (itemError || !libraryItem) {
    console.error('[upload] Failed to create library_item:', itemError)
    return NextResponse.json({ error: 'Failed to create library item' }, { status: 500 })
  }

  const libraryItemId = libraryItem.id

  // Create the book row
  const { data: book, error: bookError } = await supabase
    .from('books')
    .insert({
      library_item_id: libraryItemId,
      title,
    })
    .select('id')
    .single()

  if (bookError || !book) {
    console.error('[upload] Failed to create book:', bookError)
    // Clean up library_item
    await supabase.from('library_items').delete().eq('id', libraryItemId)
    return NextResponse.json({ error: 'Failed to create book record' }, { status: 500 })
  }

  // Handle author
  if (author) {
    const { data: authorRow } = await supabase
      .from('authors')
      .upsert({ name: author, library_id: libraryId }, { onConflict: 'name,library_id' })
      .select('id')
      .single()

    if (authorRow) {
      await supabase.from('book_authors').insert({
        book_id: book.id,
        author_id: authorRow.id,
      })
    }
  }

  // Handle series
  if (series) {
    const { data: seriesRow } = await supabase
      .from('series')
      .upsert({ name: series, library_id: libraryId }, { onConflict: 'name,library_id' })
      .select('id')
      .single()

    if (seriesRow) {
      await supabase.from('book_series').insert({
        book_id: book.id,
        series_id: seriesRow.id,
      })
    }
  }

  // Upload files to Supabase Storage and create audio_file rows
  const uploadErrors: string[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const storagePath = `${libraryItemId}/${file.name}`

    const { error: storageError } = await supabase.storage
      .from('audio-files')
      .upload(storagePath, file, { upsert: true })

    if (storageError) {
      console.error(`[upload] Storage error for ${file.name}:`, storageError)
      uploadErrors.push(file.name)
      continue
    }

    await supabase.from('audio_files').insert({
      library_item_id: libraryItemId,
      metadata_filename: file.name,
      metadata_ext: file.name.split('.').pop() || '',
      metadata_size: file.size,
      index: i,
    })
  }

  if (uploadErrors.length === files.length) {
    // All files failed — clean up
    await supabase.from('library_items').delete().eq('id', libraryItemId)
    return NextResponse.json({ error: 'All file uploads failed' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    libraryItemId,
    filesUploaded: files.length - uploadErrors.length,
    filesFailed: uploadErrors.length,
  })
}
