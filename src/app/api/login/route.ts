import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Assuming the mobile app's username field might contain an email
    // Or we attempt to login with email directly
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: username,
      password: password,
    })

    if (authError || !authData.user) {
      // If login fails, try fetching the profile by username to get the email (if they used a real username)
      // Note: Supabase auth requires email. If they entered a username, we must find the email.
      // For now, we will assume they entered their email in the username field.
      console.error('[API Login] Auth error:', authError?.message)
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Fetch the user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    // Construct the payload the Audiobookshelf mobile app expects
    const userPayload = {
      user: {
        id: authData.user.id,
        username: profile?.username || authData.user.email?.split('@')[0] || 'User',
        type: profile?.user_type || 'user',
        token: authData.session.access_token, // Pass the Supabase JWT as the Audiobookshelf token
        isActive: true,
        isLocked: false,
        permissions: {
          download: true,
          update: profile?.user_type === 'admin',
          delete: profile?.user_type === 'admin',
          upload: profile?.user_type === 'admin',
          accessAllLibraries: true,
        },
      },
      userDefaultLibraryId: profile?.default_library_id || null,
      serverSettings: {},
      source: 'local'
    }

    return NextResponse.json(userPayload)
  } catch (error) {
    console.error('[API Login] Internal error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
