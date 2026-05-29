import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { rateLimit } from '@/utils/rateLimit'
import { apiError } from '@/utils/apiResponse'

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 users per second
})

export async function POST(request: Request) {
  try {
    // Attempt Rate Limiting
    const ip = request.headers.get('x-forwarded-for') || 'anonymous'
    try {
      await limiter.check(10, ip) // 10 requests per minute per IP
    } catch {
      return apiError('Too many requests. Please try again later.', 'RATE_LIMIT_EXCEEDED', 429)
    }

    const bodyText = await request.text()
    console.log('[API Login] Raw body:', bodyText)
    
    let body
    try {
      body = JSON.parse(bodyText)
    } catch (e) {
      console.error('[API Login] Failed to parse JSON:', e)
      return apiError('Invalid JSON payload', 'INVALID_JSON', 400)
    }

    const { username, password } = body

    if (!username || !password) {
      return apiError('Username and password required', 'MISSING_CREDENTIALS', 400)
    }

    const supabase = await createClient()
    let emailToUse = username

    // If the username doesn't look like an email, we need to look it up in the profiles table
    if (!username.includes('@')) {
      console.log(`[API Login] Looking up email for nickname: ${username}`)
      
      // We must use the service role key to bypass RLS on profiles for unauthenticated users
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY
      if (serviceRoleKey) {
        const adminSupabase = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          serviceRoleKey
        )
        
        const { data: profileData, error: profileError } = await adminSupabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .single()
          
        if (profileData?.id) {
          // Now fetch the user's email using the admin API
          const { data: userData, error: userError } = await adminSupabase.auth.admin.getUserById(profileData.id)
          if (userData?.user?.email) {
            emailToUse = userData.user.email
            console.log(`[API Login] Found email for nickname: ${emailToUse}`)
          } else {
            console.error('[API Login] Could not find auth user for profile ID:', profileData.id)
          }
        } else {
          console.error('[API Login] Profile lookup failed:', profileError?.message)
        }
      } else {
        console.error('[API Login] Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY for nickname lookup')
      }
    }

    console.log(`[API Login] Attempting login with email: ${emailToUse}`)

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password: password,
    })

    if (authError || !authData.user) {
      console.error('[API Login] Auth error:', authError?.message)
      return apiError('Invalid credentials or missing password (did you sign up with Google?)', 'INVALID_CREDENTIALS', 401)
    }

    // Fetch the user's profile
    const { data: profile, error: pError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()
      
    if (pError) {
      console.error('[API Login] Profile fetch error after login:', pError.message)
    }

    // Construct the payload the Audiobookshelf mobile app expects
    const userPayload = {
      user: {
        id: authData.user.id,
        username: profile?.username || authData.user.email?.split('@')[0] || 'User',
        email: authData.user.email,
        type: profile?.user_type || 'user',
        token: authData.session.access_token,
        refreshToken: authData.session.refresh_token || null,
        mediaProgress: [],
        seriesHideFromContinueListening: [],
        bookmarks: [],
        isActive: true,
        isLocked: false,
        lastSeen: new Date().getTime(),
        createdAt: new Date(profile?.created_at || authData.user.created_at).getTime(),
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

    console.log(`[API Login] Successful login for: ${emailToUse}`)
    return NextResponse.json(userPayload)
  } catch (error) {
    console.error('[API Login] Internal error:', error)
    return apiError('Internal server error', 'INTERNAL_ERROR', 500)
  }
}
