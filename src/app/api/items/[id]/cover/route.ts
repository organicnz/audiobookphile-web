import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()

  // 1. Try to get the actual path from the database
  const { data: item } = await supabase
    .from('library_items')
    .select('cover_path, books(cover_path)')
    .eq('id', id)
    .single()

  let storagePath = item?.cover_path || (item as any)?.books?.cover_path

  // 2. If no path is in DB, try common legacy defaults
  if (!storagePath) {
    const fallbacks = [`${id}/cover.jpg`, `${id}/cover.png`, `${id}/cover.webp`]
    for (const path of fallbacks) {
      const { data: publicUrlData } = await supabase.storage.from('covers').getPublicUrl(path)
      try {
        const headRes = await fetch(publicUrlData.publicUrl, { method: 'HEAD' })
        if (headRes.ok) {
          storagePath = path
          break
        }
      } catch { /* continue */ }
    }
  }

  if (storagePath) {
    const { data: publicUrlData } = await supabase.storage.from('covers').getPublicUrl(storagePath)
    try {
      const headRes = await fetch(publicUrlData.publicUrl, { method: 'HEAD' })
      if (headRes.ok) {
        return NextResponse.redirect(publicUrlData.publicUrl)
      }
    } catch { /* continue */ }
  }

  // Fallback: Placeholder
  return NextResponse.redirect(new URL('/images/book_placeholder.jpg', request.url))
}
