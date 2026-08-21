import { NextResponse } from 'next/server'
import { apiRequest } from '@/shared/lib/api/client'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Request download manifest from Edge Function
    const data = await apiRequest<{ tracks: { url: string }[] }>(`/api/items/${id}/download`)

    if (!data || !data.tracks || data.tracks.length === 0) {
      return NextResponse.json({ error: 'No audio files found' }, { status: 404 })
    }

    if (data.tracks.length > 1) {
      return NextResponse.json(
        {
          error: 'Downloading multi-file items as a ZIP is not supported in this version. Please download individual files from the tracks list.'
        },
        { status: 400 }
      )
    }

    // Redirect to the first track's signed URL
    return NextResponse.redirect(data.tracks[0].url)
  } catch (error: any) {
    console.error('Download error:', error)
    if (error?.status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: error?.status || 500 })
  }
}
