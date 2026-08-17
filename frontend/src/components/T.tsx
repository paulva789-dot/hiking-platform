'use client';

import { useLanguage } from '@/lib/i18n/language-context';
import type { TranslationKey } from '@/lib/i18n/translations';

/** Drop-in translated string for use inside server components/pages. */
export function T({ k, params }: { k: TranslationKey; params?: Record<string, string | number> }) {
  const { t } = useLanguage();
  return <>{t(k, params)}</>;
}
