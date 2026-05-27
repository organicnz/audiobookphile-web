import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const refreshToken = request.headers.get('x-refresh-token')

    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Refresh the Supabase session
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
      refresh_token: refreshToken
    })

    if (refreshError || !refreshData.user || !refreshData.session) {
      console.error('[API Refresh] Supabase session refresh failed:', refreshError?.message)
      return NextResponse.json({ error: 'Session expired or invalid refresh token' }, { status: 401 })
    }

    const user = refreshData.user
    const session = refreshData.session

    // Fetch the user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Construct the payload the Audiobookshelf mobile app expects
    const userPayload = {
      user: {
        id: user.id,
        username: profile?.username || user.email?.split('@')[0] || 'User',
        email: user.email,
        type: profile?.user_type || 'user',
        token: session.access_token,
        refreshToken: session.refresh_token || refreshToken,
        mediaProgress: [],
        seriesHideFromContinueListening: [],
        bookmarks: [],
        isActive: true,
        isLocked: false,
        lastSeen: new Date().getTime(),
        createdAt: new Date(profile?.created_at || user.created_at).getTime(),
        permissions: {
          download: true,
          update: profile?.user_type === 'admin',
          delete: profile?.user_type === 'admin',
          upload: profile?.user_type === 'admin',
          accessAllLibraries: true,
          accessAllTags: true,
          accessExplicitContent: true
        },
        librariesAccessible: [],
        itemTagsAccessible: []
      },
      userDefaultLibraryId: profile?.default_library_id || null,
      serverSettings: {},
      source: 'local'
    }

    console.log(`[API Refresh] Successful token refresh for: ${user.email}`)
    return NextResponse.json(userPayload)
  } catch (error) {
    console.error('[API Refresh] Internal error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
