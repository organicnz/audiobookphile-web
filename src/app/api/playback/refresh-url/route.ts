import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { audioFileId } = await request.json()

  // Find the book containing this audio file (using ino as ID)
  const { data: book, error } = await supabase
    .from('books')
    .select('audio_files')
    .contains('audio_files', [{ ino: audioFileId }])
    .maybeSingle()

  if (error || !book) {
    return NextResponse.json({ error: 'Audio file not found' }, { status: 404 })
  }

  const audioFiles = (book.audio_files as any[]) || []
  const audioFile = audioFiles.find((f: any) => f.ino === audioFileId)

  if (!audioFile) {
    return NextResponse.json({ error: 'Audio file not found in book' }, { status: 404 })
  }

  // Generate a new signed URL with 3600s expiry
  // Use metadata.path as fallback if storage_path is missing
  const path = audioFile.storage_path || audioFile.metadata?.path
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from('audio')
    .createSignedUrl(path, 3600)

  if (signedUrlError || !signedUrlData) {
    return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 })
  }

  return NextResponse.json({ signedUrl: signedUrlData.signedUrl })
}
