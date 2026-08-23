import { getLibraries } from '@/shared/lib/api'
import LibrariesClient from './LibrariesClient'

export default async function LibrariesPage() {
  const { libraries } = await getLibraries()

  return <LibrariesClient libraries={libraries} />
}
