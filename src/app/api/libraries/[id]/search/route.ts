import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { mapBookForMobile } from '@/utils/mobileMappers'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const libraryId = resolvedParams.id

    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '12', 10)

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

    if (!query.trim()) {
      return NextResponse.json({ results: [] })
    }

    // Call PostgreSQL full-text search RPC
    const { data: searchResults, error: rpcError } = await supabase.rpc('search_library_items', {
      p_library_id: libraryId,
      p_query: query,
      p_limit: limit
    })

    if (rpcError) {
      console.error('[API Search] RPC search failed:', rpcError.message)
      return NextResponse.json({ error: 'Search failed' }, { status: 500 })
    }

    if (!searchResults || searchResults.length === 0) {
      return NextResponse.json({ results: [] })
    }

    const itemIds = searchResults.map((r: any) => r.id)

    // Fetch the full library items with relations
    const { data: items, error: itemsError } = await supabase
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
      .in('id', itemIds)

    if (itemsError || !items) {
      console.error('[API Search] Failed to fetch full items:', itemsError?.message)
      return NextResponse.json({ error: 'Search failed' }, { status: 500 })
    }

    // Fetch user media progress separately
    const { data: progressList } = await supabase
      .from('media_progress')
      .select('*')
      .eq('user_id', user.id)

    // Map and order according to search results rank (returned by RPC)
    const formattedItems = items.map((item: any) => {
      const progressRecord = (progressList || []).find((p: any) => p.library_item_id === item.id) || null
      return mapBookForMobile(item, progressRecord)
    })

    // Sort formatted items to match the order of IDs returned by the RPC search (rank order)
    const sortedFormattedItems = formattedItems.sort((a: any, b: any) => {
      return itemIds.indexOf(a.id) - itemIds.indexOf(b.id)
    })

    // Map to SearchResponse structure: { results: [ { libraryItem: Book, matchKey: null, matchText: null } ] }
    const searchResponse = {
      results: sortedFormattedItems.map((item: any) => ({
        libraryItem: item,
        matchKey: 'title',
        matchText: item.media.metadata.title
      }))
    }

    return NextResponse.json(searchResponse)
  } catch (error) {
    console.error('[API Search] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
