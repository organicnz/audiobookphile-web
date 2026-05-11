import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()

  // Check if cover exists in Supabase Storage
  const storagePath = `${id}/cover.jpg`
  const { data: publicUrlData } = await supabase.storage
    .from('covers')
    .getPublicUrl(storagePath)

  // Verify if it actually exists (head request)
  try {
    const headRes = await fetch(publicUrlData.publicUrl, { method: 'HEAD' })
    if (headRes.ok) {
      return NextResponse.redirect(publicUrlData.publicUrl)
    }
  } catch {
    console.warn(`[CoverProxy] Supabase storage check failed for ${id}`)
  }

  // Fallback: Placeholder
  return NextResponse.redirect(new URL('/images/book_placeholder.jpg', request.url))
}
