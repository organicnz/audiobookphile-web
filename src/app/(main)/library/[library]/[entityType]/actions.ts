'use server'

import type { Author, AuthorQuickMatchPayload } from '@/types/api';
import { createClient } from '@/utils/supabase/server';
import { createServiceRoleClient } from '@/utils/supabase/service-role';

/**
 * Quick-match an author against Open Library / Google Books to fill in
 * description and fetch an author image.
 */
export async function quickMatchAuthorAction(
  authorId: string,
  payload: AuthorQuickMatchPayload
): Promise<{ updated: boolean; author: Author } | null> {
  const authorName = payload.q || (payload as any).author || ''
  if (!authorName) return null

  try {
    // Search Open Library for the author
    const res = await fetch(
      `https://openlibrary.org/search/authors.json?q=${encodeURIComponent(authorName)}&limit=1`,
      { signal: AbortSignal.timeout(8000) }
    )
    if (!res.ok) return null

    const data = await res.json()
    const doc = data?.docs?.[0]
    if (!doc) return null

    const updates: Record<string, any> = {}

    // Get author description from Open Library author page
    if (doc.key) {
      try {
        const authorRes = await fetch(`https://openlibrary.org${doc.key}.json`, {
          signal: AbortSignal.timeout(6000),
        })
        if (authorRes.ok) {
          const authorData = await authorRes.json()
          const bio = authorData.bio?.value || authorData.bio
          if (typeof bio === 'string' && bio.length > 10) {
            updates.description = bio.slice(0, 2000)
          }
        }
      } catch { /* ignore */ }
    }

    // Fetch author photo if available
    if (doc.photos?.[0]) {
      const photoId = doc.photos[0]
      const photoUrl = `https://covers.openlibrary.org/a/id/${photoId}-L.jpg`
      try {
        const imgRes = await fetch(photoUrl, { signal: AbortSignal.timeout(8000) })
        if (imgRes.ok) {
          const buf = await imgRes.arrayBuffer()
          if (buf.byteLength > 5000) {
            const db = createServiceRoleClient()
            const storagePath = `authors/${authorId}/photo.jpg`
            const { error: uploadErr } = await db.storage
              .from('covers')
              .upload(storagePath, buf, { upsert: true, contentType: 'image/jpeg' })
            if (!uploadErr) {
              updates.image_path = storagePath
            }
          }
        }
      } catch { /* ignore */ }
    }

    if (Object.keys(updates).length === 0) return null

    const supabase = await createClient()
    const { data: updated, error } = await supabase
      .from('authors')
      .update(updates)
      .eq('id', authorId)
      .select()
      .single()

    if (error) return null
    return { updated: true, author: updated as unknown as Author }
  } catch (err) {
    console.error('[quickMatchAuthor] failed:', err)
    return null
  }
}

export async function updateAuthorAction(
  authorId: string,
  editedAuthor: Partial<Author>
): Promise<{ updated: boolean; merged?: boolean; author: Author } | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('authors')
    .update({
      name: editedAuthor.name,
      description: (editedAuthor as any).description,
      image_path: (editedAuthor as any).imagePath,
    })
    .eq('id', authorId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return { updated: true, author: data as unknown as Author }
}

export async function deleteAuthorAction(authorId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('authors').delete().eq('id', authorId)
  if (error) throw new Error(error.message)
}

/**
 * Fetch and save an author image from a URL.
 */
export async function submitAuthorImageAction(authorId: string, url: string) {
  try {
    const imgRes = await fetch(url, { signal: AbortSignal.timeout(10000) })
    if (!imgRes.ok) return null
    const buf = await imgRes.arrayBuffer()
    if (buf.byteLength < 1000) return null

    const db = createServiceRoleClient()
    const storagePath = `authors/${authorId}/photo.jpg`
    const { error: uploadErr } = await db.storage
      .from('covers')
      .upload(storagePath, buf, { upsert: true, contentType: 'image/jpeg' })
    if (uploadErr) return null

    const supabase = await createClient()
    await supabase.from('authors').update({ image_path: storagePath }).eq('id', authorId)
    return { imagePath: storagePath }
  } catch (err) {
    console.error('[submitAuthorImage] failed:', err)
    return null
  }
}

export async function removeAuthorImageAction(authorId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('authors').update({ image_path: null }).eq('id', authorId)
  if (error) throw new Error(error.message)
}
