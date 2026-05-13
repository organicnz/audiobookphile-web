import { getLibraries } from '@/lib/supabase-api'
import { LibrarySchema } from '@/lib/schemas'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

export function useLibrariesQuery() {
  return useQuery({
    queryKey: ['libraries'],
    queryFn: async () => {
      const { libraries } = await getLibraries()
      return z.array(LibrarySchema).parse(libraries)
    },
  })
}
