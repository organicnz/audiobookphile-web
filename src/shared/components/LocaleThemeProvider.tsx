'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface LocaleThemeContextValue {
  locale: string
  theme: string
  mounted: boolean
}

const LocaleThemeContext = createContext<LocaleThemeContextValue>({
  locale: 'en-us',
  theme: 'system',
  mounted: false
})

export function LocaleThemeProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState('en-us')
  const [theme, setTheme] = useState('system')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Read locale from cookies
    const userLanguage = document.cookie
      .split('; ')
      .find((row) => row.startsWith('userLanguage='))
      ?.split('=')[1]
    const serverLanguage = document.cookie
      .split('; ')
      .find((row) => row.startsWith('language='))
      ?.split('=')[1]
    const localeFromCookie = userLanguage || serverLanguage || 'en-us'
    setLocale(localeFromCookie)

    // Read theme from cookies
    const themeFromCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('theme='))
      ?.split('=')[1]
    setTheme(themeFromCookie || 'system')

    // Apply theme to html element
    document.documentElement.className = `theme-${themeFromCookie || 'system'}`
    document.documentElement.lang = localeFromCookie
  }, [])

  return <LocaleThemeContext.Provider value={{ locale, theme, mounted }}>{mounted ? children : <>{children}</>}</LocaleThemeContext.Provider>
}

export function useLocaleTheme() {
  return useContext(LocaleThemeContext)
}
