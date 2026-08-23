import '@/assets/globals.css'
import type { Metadata } from 'next'

import { Providers } from '@/shared/Providers'
import { CardSizeProvider } from '../features/library/contexts/CardSizeContext'
import { ToastProvider } from '../shared/contexts/ToastContext'
import ErrorBoundary from '@/shared/components/ErrorBoundary'
import { LocaleThemeProvider } from '@/shared/components/LocaleThemeProvider'

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

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-us" className="theme-system" data-scroll-behavior="smooth">
      <body className="overflow-hidden" suppressHydrationWarning>
        <div key="providers">
          <PostHogProvider>
            <LocaleThemeProvider>
              <ToastProvider>
                <CardSizeProvider>
                  <ErrorBoundary title="Audiobookphile Error">
                    <Providers>{children}</Providers>
                  </ErrorBoundary>
                </CardSizeProvider>
              </ToastProvider>
            </LocaleThemeProvider>
          </PostHogProvider>
        </div>
      </body>
    </html>
  )
}
