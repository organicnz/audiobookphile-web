'use server'

import type { FFProbeData } from '@/types/api'

/**
 * ABS-specific — not available in the Supabase-backed version.
 */
export async function getAudioFileFFProbeDataAction(_itemId: string, _fileIno: string): Promise<FFProbeData> {
  console.warn('[audioFileActions] getAudioFileFFProbeData is not available in the Supabase-backed version')
  return {} as FFProbeData
}

/**
 * ABS-specific — not available in the Supabase-backed version.
 */
export async function deleteLibraryFileAction(_itemId: string, _fileIno: string): Promise<void> {
  console.warn('[audioFileActions] deleteLibraryFile is not available in the Supabase-backed version')
}
