import { redirect } from 'next/navigation'

// Root page — the middleware handles auth + session refresh.
// If a ?code= param arrives here (legacy OAuth flow), forward it to the callback.
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; next?: string }>
}) {
  const { code, next } = await searchParams

  if (code) {
    const params = new URLSearchParams({ code })
    if (next) params.set('next', next)
    redirect(`/auth/callback?${params.toString()}`)
  }

  redirect('/home')
}
