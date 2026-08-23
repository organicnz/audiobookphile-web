export const dynamic = 'force-dynamic'
import { getUsers } from '@/shared/lib/api'
import UsersClient from './UsersClient'

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components

export default async function UsersPage() {
  const profiles = await getUsers()

  return <UsersClient profiles={(profiles as any).users || profiles} />
}
