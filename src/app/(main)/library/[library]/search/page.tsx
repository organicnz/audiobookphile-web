import { searchLibrary } from '@/shared/lib/api'
import SearchClient from './SearchClient'

export const dynamic = 'force-dynamic'

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ library: string }>
  searchParams: Promise<{ q?: string }>
}) {
  const { library: libraryId } = await params
  const { q: query } = await searchParams

  let results: any = null
  if (query && query.trim().length > 0) {
    try {
      results = await searchLibrary(libraryId, query.trim(), 24)
    } catch (err) {
      console.error('Search failed:', err)
    }
  }

  return <SearchClient libraryId={libraryId} initialQuery={query ?? ''} initialResults={results} />
}
