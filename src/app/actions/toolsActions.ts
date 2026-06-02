import type { Task } from '@/types/api'

/**
 * ABS-specific — not available in the Supabase-backed version.
 */
export async function embedMetadataQuickAction(_libraryItemId: string) {
  console.warn('[toolsActions] embedMetadataQuick is not available in the Supabase-backed version')
  return null
}

/**
 * ABS-specific — not available in the Supabase-backed version.
 */
export async function getTasksAction(): Promise<{
  tasks: Task[]
  queuedTaskData?: { embedMetadata: { libraryItemId: string }[] }
}> {
  console.warn('[toolsActions] getTasks is not available in the Supabase-backed version')
  return { tasks: [] }
}
