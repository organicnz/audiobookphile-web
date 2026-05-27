import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { mapBookForMobile } from '@/utils/mobileMappers'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const itemId = resolvedParams.id

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

    // Validate token and get user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch the single library item with all relations
    const { data: item, error: itemError } = await supabase
      .from('library_items')
      .select(`
        *,
        books (
          *,
          book_authors (
            authors (
              *
            )
          ),
          book_series (
            series (
              *
            )
          )
        )
      `)
      .eq('id', itemId)
      .maybeSingle()

    if (itemError || !item) {
      console.error('[API Get Item] Item not found:', itemError?.message)
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Fetch user media progress separately
    const { data: progressRecord } = await supabase
      .from('media_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('library_item_id', item.id)
      .maybeSingle()

    const formattedBook = mapBookForMobile(item, progressRecord)
    return NextResponse.json(formattedBook)
  } catch (error) {
    console.error('[API Get Item] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
