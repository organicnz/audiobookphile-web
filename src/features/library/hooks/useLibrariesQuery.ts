import { getLibraries } from '@/shared/lib/api'
import { LibrarySchema } from '@/shared/lib/schemas'
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
