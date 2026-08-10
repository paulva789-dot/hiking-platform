'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { LOCALES, TRANSLATIONS, type Locale, type TranslationKey } from './translations';

const STORAGE_KEY = 'trek-cameroon-locale';

interface LanguageState {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageState | null>(null);

const detectBrowserLocale = (): Locale => {
  if (typeof navigator === 'undefined') return 'en';
  const short = navigator.language?.slice(0, 2).toLowerCase();
  return (LOCALES as readonly string[]).includes(short) ? (short as Locale) : 'en';
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && (LOCALES as readonly string[]).includes(stored)) {
      setLocaleState(stored as Locale);
    } else {
      setLocaleState(detectBrowserLocale());
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    window.localStorage.setItem(STORAGE_KEY, l);
    document.documentElement.lang = l;
  }, []);

  const t = useCallback((key: TranslationKey) => TRANSLATIONS[locale][key] ?? TRANSLATIONS.en[key] ?? key, [
    locale,
  ]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
}
