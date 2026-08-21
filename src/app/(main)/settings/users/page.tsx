import { getUsers } from '@/shared/lib/api'
import UsersClient from './UsersClient'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const profiles = await getUsers()

  return <UsersClient profiles={(profiles as any).users || profiles} />
}
