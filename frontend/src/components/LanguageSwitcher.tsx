'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/language-context';
import { LOCALES, LOCALE_LABELS } from '@/lib/i18n/translations';

/** Plain-text locale toggle — no flags. A flag denotes a country, not a
 * language, and Cameroon itself is officially bilingual: a flag here would
 * misrepresent the choice being made, not just look dated. */
export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-9 items-center gap-1 rounded-lg px-2.5 text-sm font-semibold text-basalt-600 transition-colors hover:bg-basalt-100 dark:text-basalt-300 dark:hover:bg-basalt-800"
      >
        {locale.toUpperCase()}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="dropdown-menu absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-basalt-200 bg-white py-1 shadow-lg dark:border-basalt-800 dark:bg-basalt-900"
          >
            {LOCALES.map((l) => (
              <button
                key={l}
                type="button"
                role="menuitem"
                onClick={() => {
                  setLocale(l);
                  setOpen(false);
                }}
                aria-current={locale === l}
                className={`block w-full px-4 py-2.5 text-left text-sm transition-colors ${
                  locale === l
                    ? 'bg-forest-50 font-semibold text-forest-800 dark:bg-forest-900/40 dark:text-forest-300'
                    : 'text-basalt-700 hover:bg-basalt-50 dark:text-basalt-300 dark:hover:bg-basalt-800'
                }`}
              >
                {LOCALE_LABELS[l]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
