import '@/assets/globals.css'
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale } from 'next-intl/server'

import { Analytics } from '@vercel/analytics/react'
import GlobalToastContainer from '../components/widgets/GlobalToastContainer'
import { CardSizeProvider } from '../contexts/CardSizeContext'
import { ToastProvider } from '../contexts/ToastContext'
import { getTheme } from '../lib/theme'

export const metadata: Metadata = {
  title: 'Audiobookshelf',
  description: 'A self-hosted audiobook and podcast server',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#1ad691',
  openGraph: {
    title: 'Audiobookshelf',
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
              {children}
              <GlobalToastContainer />
              <Analytics />
            </CardSizeProvider>
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
