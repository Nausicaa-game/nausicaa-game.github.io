import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { translations, type Locale } from './data'

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, fallback?: string) => string
  available: Locale[]
}

const LOCALE_KEY = 'preferred-language'
const ALL: Locale[] = ['fr', 'en', 'es', 'de', 'it', 'ja', 'zh', 'ru']

function getInitialLocale(): Locale {
  const stored = localStorage.getItem(LOCALE_KEY)
  if (stored && ALL.includes(stored as Locale)) return stored as Locale
  const browser = navigator.language?.split('-')[0]
  if (browser && ALL.includes(browser as Locale)) return browser as Locale
  return 'en'
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale)

  const setLocale = useCallback((l: Locale) => {
    localStorage.setItem(LOCALE_KEY, l)
    setLocaleState(l)
  }, [])

  const t = useCallback((key: string, fallback?: string): string => {
    const dict = translations[locale]
    if (dict && key in dict) return (dict as Record<string, string>)[key]
    if (fallback) return fallback
    return key
  }, [locale])

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, available: ALL }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within an I18nProvider')
  return ctx
}
