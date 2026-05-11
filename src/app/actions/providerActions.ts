'use server'

/**
 * ABS-specific — not available in the Supabase-backed version.
 */
import type { MetadataProvider as MetadataProviderType } from '@/types/api'

export async function getMetadataProvidersAction() {
  console.warn('[providerActions] getMetadataProviders is not available in the Supabase-backed version')
  return {
    providers: {
      books: [] as MetadataProviderType[],
      podcasts: [] as MetadataProviderType[],
      booksCovers: [] as MetadataProviderType[],
    },
  }
}
