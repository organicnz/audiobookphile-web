import { NextResponse } from 'next/server'
import { apiRequest } from '@/shared/lib/api/client'

export async function GET(req: Request, { params }: { params: Promise<{ id: string; fileId: string }> }) {
  try {
    const { id, fileId } = await params

    // Request signed URL from Edge Function
    const data = await apiRequest<{ url: string }>(`/api/items/${id}/file/${fileId}/download`)

    if (!data || !data.url) {
      return NextResponse.json({ error: 'Failed to retrieve signed URL' }, { status: 404 })
    }

    // Redirect to the signed URL
    return NextResponse.redirect(data.url)
  } catch (error: any) {
    console.error('Download error:', error)
    if (error?.status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: error?.status || 500 })
  }
}
