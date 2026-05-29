import { apiError } from '@/utils/apiResponse'
import { requireApiAuth } from '@/utils/apiAuth'
import { NextResponse } from 'next/server'
import { mapLibraryForMobile } from '@/utils/mobileMappers'

export async function GET(request: Request) {
  try {
    const { user, supabase } = await requireApiAuth(request)
    if (!user || !supabase) {
      return apiError('Unauthorized', 'UNAUTHORIZED', 401)
    }

    // Fetch libraries with folders
    const { data: libraries, error: libsError } = await supabase
      .from('libraries')
      .select('*, library_folders(*)')
      .order('display_order', { ascending: true })

    if (libsError) throw libsError

    // Map to Audiobookshelf schema
    const formattedLibraries = libraries.map(lib => mapLibraryForMobile(lib))

    return NextResponse.json({ libraries: formattedLibraries })
  } catch (error) {
    console.error('[API Libraries] Error:', error)
    return apiError('Internal server error', 'API_ERROR', 500)
  }
}
