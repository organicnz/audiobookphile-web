import { getLibraries } from '@/lib/api'
import UploadClient from './UploadClient'

export const dynamic = 'force-dynamic'

export default async function UploadPage() {
  let libraries: import('@/types/api').Library[] = []
  try {
    const response = await getLibraries()
    libraries = response.libraries
  } catch {
    libraries = []
  }
  return <UploadClient libraries={libraries} />
}
