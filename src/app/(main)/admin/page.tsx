import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/shared/lib/api/users'
import { getServerBaseUrl } from '@/shared/lib/api/client'

export const dynamic = 'force-dynamic'

async function probe(endpoint: string) {
  try {
    const res = await fetch(`${getServerBaseUrl()}${endpoint}`, {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
      }
    })
    const body = await res.text()
    return `${res.status} | ${body.slice(0, 160)}`
  } catch (e) {
    return `THREW: ${e instanceof Error ? e.message : String(e)}`
  }
}

export default async function AdminDiagnosticsPage() {
  let currentUser
  try {
    currentUser = await getCurrentUser()
  } catch {
    currentUser = null
  }

  if (!currentUser?.user || !['admin', 'root'].includes(currentUser.user.type)) {
    return redirect('/')
  }

  const me = await probe('/api/me')
  const analytics = await probe('/api/admin-analytics')

  return (
    <div className="mx-auto w-full max-w-4xl p-8">
      <h1 className="mb-4 text-2xl font-bold">ADMIN DIAGNOSTICS</h1>
      <pre className="mb-4 rounded-xl border border-white/10 bg-white/5 p-4 text-xs break-all whitespace-pre-wrap">
        user: {JSON.stringify({ type: currentUser.user.type, email: currentUser.user.email, id: currentUser.user.id })}
      </pre>
      <pre className="mb-4 rounded-xl border border-white/10 bg-white/5 p-4 text-xs break-all whitespace-pre-wrap">me probe: {me}</pre>
      <pre className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs break-all whitespace-pre-wrap">analytics probe: {analytics}</pre>
    </div>
  )
}
