'use client'

import Link from 'next/link'

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center p-4 text-center">
      <h1 className="mb-4 text-2xl font-bold text-red-500">Authentication Error</h1>
      <p className="text-foreground-muted mb-8">
        There was an error while trying to complete your sign-in. This often happens if the authentication link has expired or has already been used.
      </p>
      <Link href="/login" className="bg-primary text-button-foreground hover:bg-primary/80 rounded-lg px-6 py-2 transition-colors">
        Return to Login
      </Link>
    </div>
  )
}
