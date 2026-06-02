'use server'

import type { FFProbeData } from '@/types/api'
import { createServiceRoleClient } from '@/utils/supabase/service-role'

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
  const db = createServiceRoleClient()

  // Get the library item to find the book
  const { data: item } = await db
    .from('library_items')
    .select('media_id')
    .eq('id', itemId)
    .single()

  if (!item?.media_id) return

  // Get the book's audio_files to find the storage path
  const { data: book } = await db
    .from('books')
    .select('audio_files')
    .eq('id', item.media_id)
    .single()

  const audioFiles = (book?.audio_files as any[]) || []
  const fileToDelete = audioFiles.find((f: any) => f.ino === fileIno)

  if (fileToDelete?.metadata?.path) {
    await db.storage.from('audio-files').remove([fileToDelete.metadata.path])
  }

  // Remove from audio_files JSONB
  const updatedFiles = audioFiles.filter((f: any) => f.ino !== fileIno)
  await db.from('books').update({ audio_files: updatedFiles }).eq('id', item.media_id)
}
