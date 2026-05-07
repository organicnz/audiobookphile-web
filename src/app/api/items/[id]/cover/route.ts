import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getServerBaseUrl } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const isRaw = searchParams.get('raw') === '1'

  const supabase = await createClient()

  // 1. Check if cover exists in Supabase Storage
  // For now, we assume covers are in "covers/library-items/{id}/cover.jpg"
  const storagePath = `library-items/${id}/cover.jpg`
  const { data: publicUrlData } = await supabase.storage
    .from('covers')
    .getPublicUrl(storagePath)

  // Verify if it actually exists (head request)
  try {
    const headRes = await fetch(publicUrlData.publicUrl, { method: 'HEAD' })
    if (headRes.ok) {
      return NextResponse.redirect(publicUrlData.publicUrl)
    }
  } catch (err) {
    console.warn(`[CoverProxy] Supabase storage check failed for ${id}`)
  }

  // 2. Fallback to legacy backend
  const baseUrl = getServerBaseUrl()
  const legacyUrl = `${baseUrl}/api/items/${id}/cover${isRaw ? '?raw=1' : ''}`
  
  // We can either redirect or pipe the response
  // Piping is safer if the legacy backend is on localhost/internal network
  try {
    const response = await fetch(legacyUrl, {
      headers: {
        // Forward auth cookies if needed, but usually cover endpoint in ABS
        // allows token in query or relies on session.
        // For simplicity, we just fetch it.
      }
    })

    if (response.ok) {
      const blob = await response.blob()
      return new NextResponse(blob, {
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
          'Cache-Control': 'public, max-age=3600'
        }
      })
    }
  } catch (err) {
    console.error(`[CoverProxy] Legacy fallback failed for ${id}:`, err)
  }

  // 3. Last fallback: Placeholder
  return NextResponse.redirect(new URL('/images/book_placeholder.jpg', request.url))
}
