import '@/assets/globals.css'
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale } from 'next-intl/server'

import { Providers } from '../components/Providers'
import { Analytics } from '@vercel/analytics/react'
import { CardSizeProvider } from '../contexts/CardSizeContext'
import { ToastProvider } from '../contexts/ToastContext'
import { getTheme } from '../lib/theme'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#f59e0b',
}

export const metadata: Metadata = {
  title: 'Audiobookphile',
  description: 'A self-hosted audiobook and podcast server',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Audiobookphile',
  },
  openGraph: {
    title: 'Audiobookphile',
    description: 'A self-hosted audiobook and podcast server',
    type: 'website',
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const theme = await getTheme()

  return (
    <html lang={locale} className={`theme-${theme}`}>
      <body className="overflow-hidden" suppressHydrationWarning>
        <NextIntlClientProvider>
          <ToastProvider>
            <CardSizeProvider>
              <Providers>
                {children}
              </Providers>
              <Analytics />
            </CardSizeProvider>
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
