import { getServerStatus } from '@/lib/api'
import LoginForm from './LoginForm'
import ServerInitForm from './ServerInitForm'

export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  let isServerInitialized = true
  
  try {
    const status = await getServerStatus()
    isServerInitialized = !!status?.isInit
  } catch (error) {
    // If we can't reach the backend server, we still want to show the login form
    // so users can authenticate with Supabase.
    console.error('[LoginPage] Failed to fetch server status, falling back to LoginForm:', error)
  }

  return (
    <div className="-mt-[var(--header-height)] flex min-h-full items-center justify-center">
      {isServerInitialized ? <LoginForm /> : <ServerInitForm />}
    </div>
  )
}
