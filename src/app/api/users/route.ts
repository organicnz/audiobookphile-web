import { apiError } from '@/utils/apiResponse'
import { requireApiAuth } from '@/utils/apiAuth'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { user, supabase, token } = await requireApiAuth(request)
    
    if (!user || !supabase) {
      return apiError('Unauthorized', 'UNAUTHORIZED', 401)
    }

    // Fetch the user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Mock Audiobookshelf users payload
    const userPayload = {
      id: user.id,
      username: profile?.username || user.email?.split('@')[0] || 'User',
      email: user.email,
      type: profile?.user_type || 'user',
      token: token,
      refreshToken: null,
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
    }

    // We only return the current user for security reasons unless we implement an admin check
    return NextResponse.json({ users: [userPayload] })
  } catch (error) {
    console.error('[API Users] Error:', error)
    return apiError('Internal server error', 'API_ERROR', 500)
  }
}
