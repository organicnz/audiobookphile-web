import { NextResponse } from 'next/server'
import { createClient } from '@/shared/utils/supabase/server'
import { getPlaceholderCoverUrl } from '@/shared/lib/coverUtils'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const supabase = await createClient()

    const { data } = await supabase.from('library_items').select('cover_path').eq('id', id).single()

    if (!data || !data.cover_path || data.cover_path === 'missing') {
      return NextResponse.redirect(new URL(getPlaceholderCoverUrl(), request.url))
    }

    const { data: publicUrlData } = supabase.storage.from('covers').getPublicUrl(data.cover_path)

    return NextResponse.redirect(publicUrlData.publicUrl)
  } catch (error) {
    console.error('Error fetching cover:', error)
    return NextResponse.redirect(new URL(getPlaceholderCoverUrl(), request.url))
  }
}
