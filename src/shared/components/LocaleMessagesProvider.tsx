'use client'

import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Suspense, use } from 'react'

async function MessagesProvider({ locale, children }: { locale: string; children: React.ReactNode }) {
  const messages = await getMessages()
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}

export function LocaleMessagesProvider({ locale, children }: { locale: string; children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading translations...</div>}>
      <MessagesProvider locale={locale}>{children}</MessagesProvider>
    </Suspense>
  )
}
