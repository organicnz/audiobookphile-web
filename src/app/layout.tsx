import '@/assets/globals.css'
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale } from 'next-intl/server'

import { ErrorBoundary } from '@/shared/ErrorBoundary'
import { Providers } from '@/shared/Providers'
import { CardSizeProvider } from '../features/library/contexts/CardSizeContext'
import { ToastProvider } from '../shared/contexts/ToastContext'
import { getTheme } from '../shared/lib/theme'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#f97316'
}

export const metadata: Metadata = {
  title: 'Audiobookphile',
  description: 'A self-hosted audiobook and podcast server',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Audiobookphile'
  },
  openGraph: {
    title: 'Audiobookphile',
    description: 'A self-hosted audiobook and podcast server',
    type: 'website'
  }
}

import { PostHogProvider } from '@/shared/PostHogProvider'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const theme = await getTheme()

  return (
    <html lang={locale} className={`theme-${theme}`}>
      <body className="overflow-hidden" suppressHydrationWarning>
        <ErrorBoundary
          fallback={
            <div className="bg-background flex min-h-screen items-center justify-center p-6">
              <div>
                <h1 className="text-error mb-4 text-2xl font-bold">Something went wrong</h1>
                <p className="text-foreground-muted mb-4">We&apos;re sorry for the inconvenience. Please refresh and try again.</p>
                <button onClick={() => window.location.reload()} className="bg-primary rounded-lg px-6 py-2 text-white transition-opacity hover:opacity-90">
                  Refresh
                </button>
              </div>
            </div>
          }
        >
          <div key="providers">
            <PostHogProvider>
              <NextIntlClientProvider>
                <ToastProvider>
                  <CardSizeProvider>
                    <Providers>{children}</Providers>
                  </CardSizeProvider>
                </ToastProvider>
              </NextIntlClientProvider>
            </PostHogProvider>
          </div>
        </ErrorBoundary>
      </body>
    </html>
  )
}
