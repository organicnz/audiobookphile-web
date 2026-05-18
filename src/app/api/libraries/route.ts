import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    const supabase = createSupabaseClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch libraries with folders
    const { data: libraries, error: libsError } = await supabase
      .from('libraries')
      .select('*, library_folders(*)')
      .order('display_order', { ascending: true })

    if (libsError) throw libsError

    // Map to Audiobookshelf schema
    const formattedLibraries = libraries.map(lib => ({
      id: lib.id,
      name: lib.name,
      displayOrder: lib.display_order || 0,
      icon: lib.icon || 'bookshelf',
      mediaType: lib.media_type || 'book',
      provider: lib.provider || 'local',
      settings: lib.settings || {},
      folders: lib.library_folders?.map((f: any) => ({
        id: f.id,
        fullPath: f.path || '',
        libraryId: f.library_id,
        addedAt: new Date(f.created_at).getTime()
      })) || [],
      createdAt: new Date(lib.created_at).getTime(),
      lastUpdate: new Date(lib.updated_at).getTime()
    }))

    return NextResponse.json({ libraries: formattedLibraries })
  } catch (error) {
    console.error('[API Libraries] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
