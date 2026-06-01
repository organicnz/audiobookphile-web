import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getStorageProvider } from '@/lib/storage/StorageProvider'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch the item
    const { data: item, error: itemError } = await supabase
      .from('library_items')
      .select('*, books(*)')
      .eq('id', id)
      .single()

    if (itemError || !item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    const book = Array.isArray(item.books) ? item.books[0] : item.books
    const audioFiles = book?.audio_files || []

    if (audioFiles.length === 0) {
      return NextResponse.json({ error: 'No audio files found' }, { status: 404 })
    }

    if (audioFiles.length > 1) {
      // In a serverless environment, zipping multiple large files on the fly is not feasible.
      // We instruct the user to download individual files instead.
      return NextResponse.json({ 
        error: 'Downloading multi-file items as a ZIP is not supported in this version. Please download individual files from the tracks list.' 
      }, { status: 400 })
    }

    const file = audioFiles[0]
    const storagePath = file.metadata?.path || file.storage_path || file.path
    if (!storagePath) {
      return NextResponse.json({ error: 'Storage path not found' }, { status: 404 })
    }

    // Generate signed URL
    const storage = getStorageProvider(supabase)
    const signedUrl = await storage.getSignedUrl(storagePath, 3600)

    // Redirect to the signed URL
    return NextResponse.redirect(signedUrl)
  } catch (error: any) {
    console.error('Download error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
