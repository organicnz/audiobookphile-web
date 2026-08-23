'use client'

import { Suspense, use } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'

async function LocaleContent({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <LocaleContent>{children}</LocaleContent>
    </Suspense>
  )
}
