'use server'

import type { FFProbeData } from '@/types/api'
import { createServiceRoleClient } from '@/shared/utils/supabase/service-role'
import { verifyAdminOrThrow } from '@/shared/utils/supabase/server'

/**
 * FFProbe data is not available — audio metadata isn't extracted during upload.
 */
export async function getAudioFileFFProbeDataAction(_itemId: string, _fileIno: string): Promise<FFProbeData> {
  return {} as FFProbeData
}

/**
 * Delete an audio file from Supabase Storage and remove it from the book's audio_files JSONB.
 */
export async function deleteLibraryFileAction(itemId: string, fileIno: string): Promise<void> {
  await verifyAdminOrThrow()
  const db = createServiceRoleClient()

  // Get the library item to find the audio files
  const { data: item } = await db.from('library_items').select('audio_files').eq('id', itemId).single()

  if (!item) return

  const audioFiles = (item?.audio_files as any[]) || []
  const fileToDelete = audioFiles.find((f: any) => f.ino === fileIno)

  if (fileToDelete?.metadata?.path) {
    await db.storage.from('audio-files').remove([fileToDelete.metadata.path])
  }

  // Remove from audio_files JSONB
  const updatedFiles = audioFiles.filter((f: any) => f.ino !== fileIno)
  await db.from('library_items').update({ audio_files: updatedFiles }).eq('id', itemId)
}
