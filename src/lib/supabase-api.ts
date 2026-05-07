import { createClient } from '@/utils/supabase/server'
import { 
  Library, 
  LibraryItem, 
  BookMedia, 
  BookMetadata, 
  Author, 
  Series, 
  LibraryFile,
  MediaProgress,
  UserLoginResponse
} from '@/types/api'
import { Database } from '@/types/supabase'

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

/**
 * Maps Supabase Library row to API Library type
 */
function mapLibrary(row: Database['public']['Tables']['libraries']['Row']): Library {
  return {
    id: row.id,
    name: row.name,
    displayOrder: row.display_order ?? 0,
    icon: row.icon ?? 'book-open',
    mediaType: (row.media_type as 'book' | 'podcast') ?? 'book',
    provider: row.provider ?? undefined,
    settings: row.settings as any,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime()
  }
}

/**
 * Maps Supabase LibraryItem + Book + Author rows to API LibraryItem type
 */
function mapLibraryItem(
  item: Database['public']['Tables']['library_items']['Row'], 
  book?: Database['public']['Tables']['books']['Row'],
  authors: Author[] = [],
  series: Series[] = [],
  progress?: MediaProgress
): LibraryItem {
  const media: BookMedia = {
    metadata: {
      title: item.title ?? book?.title ?? 'Unknown Title',
      subtitle: book?.subtitle ?? undefined,
      authors: authors,
      narrators: (book?.narrators as string[]) ?? [],
      series: series,
      genres: (book?.genres as string[]) ?? [],
      publishedYear: book?.published_year ?? undefined,
      publishedDate: book?.published_date ?? undefined,
      publisher: book?.publisher ?? undefined,
      description: book?.description ?? undefined,
      isbn: book?.isbn ?? undefined,
      asin: book?.asin ?? undefined,
      language: book?.language ?? undefined,
      explicit: book?.explicit ?? false,
      abridged: book?.abridged ?? false,
      authorName: item.author_names_first_last ?? undefined,
      titleIgnorePrefix: item.title_ignore_prefix ?? undefined
    },
    coverPath: item.media_type === 'book' ? (book?.cover_path ?? undefined) : undefined,
    tags: (book?.tags as string[]) ?? [],
    audioFiles: (book?.audio_files as any) ?? [],
    chapters: (book?.chapters as any) ?? [],
    ebookFile: (book?.ebook_file as any) ?? undefined,
    duration: book?.duration ?? 0
  }

  return {
    id: item.id,
    ino: item.ino ?? '',
    libraryId: item.library_id ?? '',
    path: item.path ?? '',
    relPath: item.rel_path ?? '',
    isFile: item.is_file ?? false,
    mtimeMs: item.mtime ? new Date(item.mtime).getTime() : 0,
    ctimeMs: item.ctime ? new Date(item.ctime).getTime() : 0,
    birthtimeMs: item.birthtime ? new Date(item.birthtime).getTime() : 0,
    addedAt: new Date(item.created_at).getTime(),
    updatedAt: new Date(item.updated_at).getTime(),
    isMissing: item.is_missing ?? false,
    isInvalid: item.is_invalid ?? false,
    mediaType: (item.media_type as 'book' | 'podcast') ?? 'book',
    media: media as any, // Cast to any to handle BookMedia/PodcastMedia union
    libraryFiles: (item.library_files as any) ?? [],
    size: Number(item.size) ?? 0,
    userMediaProgress: progress
  }
}

export async function getLibraries(): Promise<Library[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('libraries')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) throw error
  return (data || []).map(mapLibrary)
}

export async function getLibrary(libraryId: string): Promise<Library> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('libraries')
    .select('*')
    .eq('id', libraryId)
    .single()

  if (error) throw error
  return mapLibrary(data)
}

export async function getLibraryItems(libraryId: string, options: { limit?: number, offset?: number } = {}): Promise<LibraryItem[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('library_items')
    .select(`
      *,
      books (
        *,
        book_authors (authors (*)),
        book_series (series (*))
      )
    `)
    .eq('library_id', libraryId)
    .order('created_at', { ascending: false })

  if (options.limit) query = query.limit(options.limit)
  if (options.offset) query = query.range(options.offset, options.offset + (options.limit ?? 10) - 1)

  const { data, error } = await query

  if (error) throw error

  return (data || []).map(item => {
    const book = item.books as any
    const authors = (book?.book_authors as any[] || []).map(ba => ({
      id: ba.authors.id,
      name: ba.authors.name,
      imagePath: ba.authors.image_path
    }))
    const series = (book?.book_series as any[] || []).map(bs => ({
      id: bs.series.id,
      name: bs.series.name
    }))
    return mapLibraryItem(item, book, authors, series)
  })
}

export async function getLibraryItem(itemId: string): Promise<LibraryItem> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('library_items')
    .select(`
      *,
      books (
        *,
        book_authors (authors (*)),
        book_series (series (*))
      )
    `)
    .eq('id', itemId)
    .single()

  if (error) throw error
  
  const book = data.books as any
  const authors = (book?.book_authors as any[] || []).map((ba: any) => ({
    id: ba.authors.id,
    name: ba.authors.name,
    description: ba.authors.description,
    imagePath: ba.authors.image_path
  }))
  const series = (book?.book_series as any[] || []).map((bs: any) => ({
    id: bs.series.id,
    name: bs.series.name
  }))

  return mapLibraryItem(data, book, authors, series)
}

export async function getLibraryPersonalized(libraryId: string): Promise<any[]> {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // 1. Recently Added
  const recentlyAdded = await getLibraryItems(libraryId, { limit: 20 })

  const shelves: any[] = [
    {
      id: 'recently-added',
      label: 'Recently Added',
      entities: recentlyAdded
    }
  ]

  // 2. Continue Listening (Real Data)
  if (session?.user) {
    const { data: progressData } = await supabase
      .from('media_progress')
      .select(`
        *,
        library_items (*, books (*))
      `)
      .eq('user_id', session.user.id)
      .eq('is_finished', false)
      .order('last_update', { ascending: false })
      .limit(10)

    if (progressData && progressData.length > 0) {
      const continueListening = progressData.map(p => {
        const item = p.library_items as any
        const progress: MediaProgress = {
          id: p.id,
          libraryItemId: p.library_item_id,
          displayTitle: item.title || 'Unknown',
          duration: p.duration ?? 0,
          progress: p.progress ?? 0,
          currentTime: p.current_time_pos ?? 0,
          isFinished: p.is_finished ?? false,
          lastUpdate: new Date(p.last_update || Date.now()).getTime(),
          userId: p.user_id,
          ebookProgress: 0
        }
        return mapLibraryItem(item, item.books as any, [], [], progress)
      })

      shelves.unshift({
        id: 'continue-listening',
        label: 'Continue Listening',
        entities: continueListening
      })
    }
  }

  return shelves
}

export async function getLibraryAuthors(libraryId: string): Promise<Author[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('authors')
    .select('*')
    .eq('library_id', libraryId)
    .order('name', { ascending: true })

  if (error) throw error
  return (data || []).map(row => ({
    id: row.id,
    name: row.name ?? 'Unknown Author',
    description: row.description ?? undefined,
    imagePath: row.image_path ?? undefined
  }))
}

export async function getLibrarySeries(libraryId: string): Promise<Series[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('series')
    .select('*')
    .eq('library_id', libraryId)
    .order('name', { ascending: true })

  if (error) throw error
  return (data || []).map(row => ({
    id: row.id,
    name: row.name ?? 'Unknown Series',
    description: row.description ?? undefined
  }))
}

export async function searchLibrary(libraryId: string, query: string, limit: number = 12): Promise<any> {
  const supabase = await createClient()
  const searchPattern = `%${query}%`

  // 1. Search Books (Library Items)
  const { data: items } = await supabase
    .from('library_items')
    .select('*, books(*)')
    .eq('library_id', libraryId)
    .ilike('title', searchPattern)
    .limit(limit)

  const mappedItems = (items || []).map(item => mapLibraryItem(item, item.books as any))

  // 2. Search Authors
  const { data: authors } = await supabase
    .from('authors')
    .select('*')
    .eq('library_id', libraryId)
    .ilike('name', searchPattern)
    .limit(limit)

  const mappedAuthors = (authors || []).map(row => ({
    id: row.id,
    name: row.name ?? 'Unknown Author',
    imagePath: row.image_path ?? undefined
  }))

  // 3. Search Series
  const { data: series } = await supabase
    .from('series')
    .select('*')
    .eq('library_id', libraryId)
    .ilike('name', searchPattern)
    .limit(limit)

  const mappedSeries = (series || []).map(row => ({
    id: row.id,
    name: row.name ?? 'Unknown Series'
  }))

  return {
    book: mappedItems.filter(i => i.mediaType === 'book'),
    author: mappedAuthors,
    series: mappedSeries,
    podcast: mappedItems.filter(i => i.mediaType === 'podcast')
  }
}

export async function getCurrentUser(): Promise<UserLoginResponse | null> {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) return null

  const userId = session.user.id

  // Fetch profile and legacy user data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  // We use the username to find the legacy user data (since IDs might differ if not perfectly synced)
  // But ideally we have a mapping. For now, let's try by username or ID.
  const { data: legacyUser } = await supabase
    .from('legacy_users')
    .select('*')
    .or(`id.eq.${userId},username.eq.${profile?.username}`)
    .single()

  let profileData = profile
  let legacyUserData = legacyUser

  if (!profileData && !legacyUserData) {
    // JIT Profile Creation for new Social/OAuth users
    console.log('[Supabase] No profile found for authenticated user, creating one...', userId)
    
    const username = session.user.email?.split('@')[0] || `user_${userId.slice(0, 5)}`
    
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        username: username,
        user_type: 'user'
      })
      .select()
      .single()

    if (createError) {
      console.error('[Supabase] Failed to create JIT profile:', createError.message)
      return null
    }
    
    profileData = newProfile
  }

  const username = profileData?.username || legacyUserData?.username || session.user.email?.split('@')[0] || 'user'
  const type = profileData?.user_type || legacyUserData?.user_type || 'user'

  return {
    user: {
      id: userId,
      username,
      type: type as any,
      token: session.access_token,
      mediaProgress: [], // Fetched separately
      seriesHideFromContinueListening: [],
      bookmarks: [],
      isActive: legacyUser?.is_active ?? true,
      isLocked: false,
      createdAt: new Date(profile?.created_at || legacyUser?.created_at || Date.now()).getTime(),
      permissions: {
        download: true,
        update: type === 'root' || type === 'admin',
        delete: type === 'root' || type === 'admin',
        upload: type === 'root' || type === 'admin',
        createEreader: true,
        accessAllLibraries: true,
        accessAllTags: true,
        accessExplicitContent: true,
        selectedTagsNotAccessible: false,
        ...(legacyUser?.permissions as any)
      },
      librariesAccessible: [],
      itemTagsSelected: [],
      hasOpenIDLink: !!session.user.identities?.some(id => id.provider === 'google')
    },
    serverSettings: {
      language: 'en-us',
      version: 'Supabase-Native',
      buildNumber: '1',
      // ... default settings
    } as any,
    userDefaultLibraryId: undefined,
    ereaderDevices: [],
    Source: 'supabase'
  }
}

export async function getLibraryFilterData(libraryId: string): Promise<any> {
  const supabase = await createClient()

  // Fetch all genres, tags, authors, and series for the library
  // This is simplified but covers the main filter needs
  const { data: items } = await supabase
    .from('library_items')
    .select('books(genres, tags)')
    .eq('library_id', libraryId)

  const genres = new Set<string>()
  const tags = new Set<string>()
  
  items?.forEach(item => {
    const book = item.books as any
    if (book?.genres) (book.genres as string[]).forEach(g => genres.add(g))
    if (book?.tags) (book.tags as string[]).forEach(t => tags.add(t))
  })

  const { data: authors } = await supabase
    .from('authors')
    .select('id, name')
    .eq('library_id', libraryId)

  const { data: series } = await supabase
    .from('series')
    .select('id, name')
    .eq('library_id', libraryId)

  return {
    genres: Array.from(genres).sort(),
    tags: Array.from(tags).sort(),
    authors: (authors || []).sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    series: (series || []).sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    narrators: [] // Narrators would need a separate join or extraction from book json
  }
}
