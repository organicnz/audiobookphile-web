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
      type: profile?.user_type || 'user',
      token: token,
      isActive: true,
      isLocked: false,
      permissions: {
        download: true,
        update: profile?.user_type === 'admin',
        delete: profile?.user_type === 'admin',
        upload: profile?.user_type === 'admin',
        accessAllLibraries: true,
      },
      createdAt: new Date(profile?.created_at || user.created_at).getTime()
    }

    // We only return the current user for security reasons unless we implement an admin check
    return NextResponse.json({ users: [userPayload] })
  } catch (error) {
    console.error('[API Users] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
