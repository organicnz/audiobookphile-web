'use server'

import type { MetadataProvider as MetadataProviderType } from '@/types/api'

/**
 * Returns the available metadata providers for this Supabase-backed version.
 * We support Open Library and Google Books directly.
 */
export async function getMetadataProvidersAction() {
  const books: MetadataProviderType[] = [
    { id: 'openlibrary', name: 'Open Library', official: true },
    { id: 'google', name: 'Google Books', official: true },
  ]

  return {
    providers: {
      books,
      podcasts: [] as MetadataProviderType[],
      booksCovers: books,
    },
  }
}
