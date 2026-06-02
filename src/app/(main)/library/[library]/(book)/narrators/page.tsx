import { createClient } from '@/utils/supabase/server'
import NarratorsClient from './NarratorsClient'

export default async function NarratorsPage({ params }: { params: Promise<{ library: string }> }) {
  const { library: libraryId } = await params
  const supabase = await createClient()

  // Narrators are stored in book_narrators joined with a narrators table (if it exists)
  // Fall back to empty array if the table doesn't exist
  let narrators: { id: string; name: string }[] = []
  try {
    const { data } = await (supabase as any).from('narrators').select('id, name').eq('library_id', libraryId)
    narrators = data ?? []
  } catch {
    narrators = []
  }

  return (
    <div className="w-full p-8">
      <NarratorsClient libraryId={libraryId} narrators={narrators as any} />
    </div>
  )
}
