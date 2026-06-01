import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getStorageProvider } from '@/lib/storage/StorageProvider'

export async function GET(
  req: Request,
  { params }: { params: { id: string; fileId: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch the item
    const { data: item, error: itemError } = await supabase
      .from('library_items')
      .select('*, books(*)')
      .eq('id', params.id)
      .single()

    if (itemError || !item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    const book = Array.isArray(item.books) ? item.books[0] : item.books
    const audioFiles = book?.audio_files || []
    const file = audioFiles.find((f: any) => f.ino === params.fileId || f.id === params.fileId)

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

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
