import type { ContentLocale, TrailTranslation } from '@/lib/types';
import type { Locale } from './translations';

/** Every translatable Trail field, keyed the same way on both Trail and TrailTranslation. */
export type TranslatableField = 'summary' | 'description' | 'waterSources' | 'permitInfo' | 'gettingThere';

const findTranslation = (translations: TrailTranslation[], locale: Locale): TrailTranslation | undefined => {
  if (locale === 'en') return undefined;
  const target = locale.toUpperCase() as ContentLocale;
  return translations.find((t) => t.locale === target);
};

/** Resolves a single text field for the current locale, falling back to the
 * English value field-by-field -- a trail with hazards translated but not
 * gettingThere still shows real French hazards, not a half-English page. */
export function resolveTrailText(
  english: string | null,
  translations: TrailTranslation[],
  locale: Locale,
  field: TranslatableField
): string | null {
  const translation = findTranslation(translations, locale);
  return translation?.[field] || english;
}

export function resolveTrailHazards(english: string[], translations: TrailTranslation[], locale: Locale): string[] {
  const translation = findTranslation(translations, locale);
  return translation && translation.hazards.length > 0 ? translation.hazards : english;
}
