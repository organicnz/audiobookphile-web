import '@/assets/globals.css'
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale } from 'next-intl/server'

import { Providers } from '@/shared/Providers'
import { CardSizeProvider } from '../features/library/contexts/CardSizeContext'
import { ToastProvider } from '../shared/contexts/ToastContext'
import { getTheme } from '../shared/lib/theme'
import ErrorBoundary from '@/shared/components/ErrorBoundary'

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
    <html lang={locale} className={`theme-${theme}`} data-scroll-behavior="smooth">
      <body className="overflow-hidden" suppressHydrationWarning>
        <div key="providers">
          <PostHogProvider>
            <NextIntlClientProvider>
              <ToastProvider>
                <CardSizeProvider>
                  <ErrorBoundary title="Audiobookphile Error">
                    <Providers>{children}</Providers>
                  </ErrorBoundary>
                </CardSizeProvider>
              </ToastProvider>
            </NextIntlClientProvider>
          </PostHogProvider>
        </div>
      </body>
    </html>
  )
}
