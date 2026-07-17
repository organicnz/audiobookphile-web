'use client'

import Link from 'next/link'
import Btn from '@/shared/ui/Btn'
import { useTypeSafeTranslations } from '@/shared/hooks/useTypeSafeTranslations'

export default function NotFound() {
  const t = useTypeSafeTranslations()

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-8">
        <h1 className="text-primary text-9xl font-extrabold tracking-widest opacity-20">404</h1>
        <div className="bg-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-12 transform rounded px-2 text-sm font-bold text-black">
          Page Not Found
        </div>
      </div>

      <p className="text-foreground-muted mb-8 max-w-md text-xl font-medium">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or deleted.
      </p>

      <Link href="/">
        <Btn className="px-8 py-3 text-lg">Back to Home</Btn>
      </Link>
    </div>
  )
}
